import type Container from "@/interfaces/container.mjs"

import { expect } from "chai"
import RegularDelivery from "@/infrastructure/dependencies/deliveries/regular.mjs"
import { DeliveryLocation } from "@/interfaces/delivery.mjs"

describe("RegularDelivery", () => {
    describe(".construct", () => {
        it("sets sourceConstructor passed as the first argument", () => {
            class TestClass {}

            const regularDelivery = new RegularDelivery(TestClass)

            expect(regularDelivery.sourceConstructor).to.be.equal(TestClass)
        })

        it("sets empty preparedArguments if not defined as constructor's arguments", () => {
            class TestClass {}

            const regularDelivery = new RegularDelivery(TestClass)

            expect(regularDelivery.preparedArguments).to.be.empty
        })

        it("sets preparedArguments from constructor's arguments", () => {
            const arg1 = Symbol()
            const arg2 = Symbol()

            class TestClass {
                constructor(readonly test1: symbol, readonly test2: symbol) {}
            }

            const regularDelivery = new RegularDelivery(TestClass, arg1, arg2)

            expect(regularDelivery.preparedArguments).to.have.same.members([arg1, arg2])
        })
    })

    describe(".open", () => {
        it("constructs an instance of the class", () => {
            class TestClass {}

            const regularDelivery = new RegularDelivery(TestClass)

            expect(regularDelivery.open({})).to.be.instanceOf(TestClass)
        })

        it("constructs new instance of the class on each call", () => {
            class TestClass {}

            const container: Container = {}
            const regularDelivery = new RegularDelivery(TestClass)

            expect(regularDelivery.open(container)).to.be.not.equal(regularDelivery.open(container))
        })

        it("passes preconfigured arguments to the constructor", () => {
            const arg1 = Symbol()
            const arg2 = Symbol()

            class TestClass {
                constructor(readonly test1: symbol, readonly test2: symbol) {}
            }

            const regularDelivery = new RegularDelivery(TestClass, arg1, arg2)

            expect(regularDelivery.open({})).to.include({test1: arg1, test2: arg2})
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

            const regularDelivery = new RegularDelivery(TestClass, arg1, arg2)

            expect(regularDelivery.open({}, arg3, arg4)).to.include(
                {test1: arg1, test2: arg2, test3: arg3, test4: arg4}
            )
        })

        it("passes the container if class decorated as DeliveryLocation", () => {
            @DeliveryLocation
            class TestClass {
                constructor(readonly container: Container) {}
            }

            const container: Container = {}
            const regularDelivery = new RegularDelivery(TestClass)

            expect(regularDelivery.open(container).container).to.be.equal(container)
        })
    })
})