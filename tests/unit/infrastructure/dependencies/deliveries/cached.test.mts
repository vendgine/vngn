import type Container from "@/interfaces/container.mjs"

import { expect } from "chai"
import CachedDelivery from "@/infrastructure/dependencies/deliveries/cached.mjs"
import { DeliveryLocation } from "@/interfaces/delivery.mjs"

describe("CachedDelivery", () => {
    describe(".construct", () => {
        it("sets infinite lifetime passed as the first argument", () => {
            class TestClass {}

            const cachedDelivery = new CachedDelivery(101, TestClass)

            expect(cachedDelivery.lifetime).to.be.equal(101)
        })

        it("sets numeric lifetime passed as the first argument", () => {
            class TestClass {}

            const cachedDelivery = new CachedDelivery(101, TestClass)

            expect(cachedDelivery.lifetime).to.be.equal(101)
        })

        it("sets string lifetime passed as the first argument", () => {
            class TestClass {}

            const cachedDelivery1 = new CachedDelivery("1s", TestClass)
            expect(cachedDelivery1.lifetime).to.be.equal(1000)

            const cachedDelivery2 = new CachedDelivery("1m", TestClass)
            expect(cachedDelivery2.lifetime).to.be.equal(1000 * 60)

            const cachedDelivery3 = new CachedDelivery("1h", TestClass)
            expect(cachedDelivery3.lifetime).to.be.equal(1000 * 60 * 60)

            const cachedDelivery4 = new CachedDelivery("1d", TestClass)
            expect(cachedDelivery4.lifetime).to.be.equal(1000 * 60 * 60 * 24)
        })

        it("throws an exception if format is incorrect", () => {
            class TestClass {}

            expect(() => new CachedDelivery("1y", TestClass)).to.throw(Error)
        })

        it("throws an exception if number is negative", () => {
            class TestClass {}

            expect(() => new CachedDelivery(-5, TestClass)).to.throw(Error)
        })

        it("sets sourceConstructor passed as the second argument", () => {
            class TestClass {}

            const cachedDelivery = new CachedDelivery(Infinity, TestClass)

            expect(cachedDelivery.sourceConstructor).to.be.equal(TestClass)
        })

        it("sets lifetime as infinity if not defined as constructor's argument", () => {
            class TestClass {}

            const cachedDelivery = new CachedDelivery(Infinity, TestClass)

            expect(cachedDelivery.lifetime).to.be.equal(Infinity)
        })

        it("sets empty preparedArguments if not defined as constructor's arguments", () => {
            class TestClass {}

            const cachedDelivery = new CachedDelivery(Infinity, TestClass)

            expect(cachedDelivery.preparedArguments).to.be.empty
        })

        it("sets preparedArguments from constructor's arguments", () => {
            const arg1 = Symbol()
            const arg2 = Symbol()

            class TestClass {
                constructor(readonly test1: symbol, readonly test2: symbol) {}
            }

            const cachedDelivery = new CachedDelivery(Infinity, TestClass, arg1, arg2)

            expect(cachedDelivery.preparedArguments).to.have.same.members([arg1, arg2])
        })
    })

    describe(".open", () => {
        it("constructs an instance of the class", () => {
            class TestClass {}

            const cachedDelivery = new CachedDelivery(Infinity, TestClass)

            expect(cachedDelivery.open({})).to.be.instanceOf(TestClass)
        })

        it("returns same instance of the class on each call", () => {
            class TestClass {
                constructor(
                    readonly test1?: number,
                    readonly test2?: number,
                    readonly test3?: number,
                ) {}
            }

            const container: Container = {}

            const cachedDelivery1 = new CachedDelivery(Infinity, TestClass)
            expect(cachedDelivery1.open(container)).to.be.equal(cachedDelivery1.open(container))

            const cachedDelivery2 = new CachedDelivery(Infinity, TestClass, 1)
            expect(cachedDelivery2.open(container, 1, 2)).to.be.equal(cachedDelivery2.open(container, 1, 2))
        })

        it("returns same instance of the class on each call for different delivery objects", () => {
            class TestClass {
                constructor(
                    readonly test1?: number,
                    readonly test2?: number,
                    readonly test3?: number,
                ) {}
            }

            const container: Container = {}

            const cachedDelivery1 = new CachedDelivery(Infinity, TestClass)
            const cachedDelivery2 = new CachedDelivery(Infinity, TestClass)
            expect(cachedDelivery1.open(container, 1)).to.be.equal(cachedDelivery2.open(container, 1))
        })

        it("returns different instances of the class on each call with different arguments", () => {
            class TestClass {
                constructor(
                    readonly test1?: number,
                    readonly test2?: number,
                    readonly test3?: number,
                ) {}
            }

            const container: Container = {}

            const cachedDelivery1 = new CachedDelivery(Infinity, TestClass)
            const cachedDelivery2 = new CachedDelivery(Infinity, TestClass, 1)
            expect(cachedDelivery1.open(container)).to.be.not.equal(cachedDelivery2.open(container))

            const cachedDelivery3 = new CachedDelivery(Infinity, TestClass)
            expect(cachedDelivery3.open(container, 1)).to.be.not.equal(cachedDelivery3.open(container, 2))
        })

        it("returns different instances after a timeout with same arguments", () => {
            class TestClass {
                constructor(
                    readonly test1?: number,
                    readonly test2?: number,
                    readonly test3?: number,
                ) {}
            }

            const container: Container = {}

            const cachedDelivery = new CachedDelivery(1, TestClass)
            const instance1 = cachedDelivery.open(container, 1, 2, 3)
            setTimeout(() => {
                const instance2 = cachedDelivery.open(container, 1, 2, 3)
                expect(instance1).to.be.not.equal(instance2)
            }, 2)
        })

        it("refreshes a timeout when new object is opened within the timeout", () => {
            class TestClass {
                constructor(
                    readonly test1?: number,
                    readonly test2?: number,
                    readonly test3?: number,
                ) {}
            }

            const container: Container = {}

            const cachedDelivery = new CachedDelivery(1000, TestClass)
            const instance1 = cachedDelivery.open(container, 1, 2, 3)
            setImmediate(() => {
                const instance2 = cachedDelivery.open(container, 1, 2, 3)
                expect(instance1).to.be.equal(instance2)
            })
        })

        it("passes preconfigured arguments to the constructor", () => {
            const arg1 = Symbol()
            const arg2 = Symbol()

            class TestClass {
                constructor(readonly test1: symbol, readonly test2: symbol) {}
            }

            const cachedDelivery = new CachedDelivery(Infinity, TestClass, arg1, arg2)

            expect(cachedDelivery.open({})).to.include({test1: arg1, test2: arg2})
        })

        it("passes arguments to the constructor after preconfigured", () => {
            const arg1 = Symbol()
            const arg2 = Symbol()
            const arg3 = Symbol()
            const arg4 = Symbol()

            class TestClass {
                constructor(
                    readonly test1: symbol,
                    readonly test2: symbol,
                    readonly test3: symbol,
                    readonly test4: symbol,
                ) {}
            }

            const cachedDelivery = new CachedDelivery(Infinity, TestClass, arg1, arg2)

            expect(cachedDelivery.open({}, arg3, arg4)).to.include(
                {test1: arg1, test2: arg2, test3: arg3, test4: arg4}
            )
        })

        it("passes the container if class decorated as DeliveryLocation", () => {
            @DeliveryLocation
            class TestClass {
                constructor(readonly container: Container) {}
            }

            const container: Container = {}
            const cachedDelivery = new CachedDelivery(Infinity, TestClass)

            expect(cachedDelivery.open(container).container).to.be.equal(container)
        })
    })
})