import { expect } from "chai"
import sinon from "sinon"

import LocalCarrier from "@/infrastructure/dependencies/carriers/local.mjs"
import { AnyDelivery } from "@/interfaces/delivery.mjs"

describe("LocalCarrier", () => {
    describe(".construct", () => {
        it("sets defined provider's property in the container", () => {
            const delivery = sinon.fake.returns({
                sourceConstructor: class {}
            }) as unknown as () => AnyDelivery

            const localCarrier = new LocalCarrier({Test: delivery})

            expect("Test" in localCarrier.container).to.be.true
        })
    })

    describe(".container", () => {
        it("returns undefined if container does not contains the constructor", () => {
            const localCarrier = new LocalCarrier({})

            expect(Reflect.get(localCarrier.container, "Test")).to.be.undefined
        })

        it("contains Proxy for a class derived from delivery's source constructor", () => {
            const TestClass = class {}

            const delivery = sinon.fake.returns({
                sourceConstructor: TestClass
            }) as unknown as () => AnyDelivery

            const localCarrier = new LocalCarrier({Test: delivery})

            expect(localCarrier.container.Test.prototype).to.be.instanceOf(TestClass)
        })

        it("contains Proxy for a class that constructs with Delivery open() method", () => {
            const TestClass = class {}
            const openFake = sinon.fake.returns(new TestClass)

            const delivery = sinon.fake.returns({
                sourceConstructor: TestClass,
                open: openFake
            }) as unknown as () => AnyDelivery

            const localCarrier = new LocalCarrier({Test: delivery})

            expect(new localCarrier.container.Test).to.be.instanceOf(TestClass)
        })

        it("contains Proxy for a class and pass container as the first argument for Delivery open()", () => {
            const TestClass = class {}
            const openFake = sinon.fake.returns(new TestClass)

            const delivery = sinon.fake.returns({
                sourceConstructor: TestClass,
                open: openFake
            }) as unknown as () => AnyDelivery

            const localCarrier = new LocalCarrier({Test: delivery})

            new localCarrier.container.Test

            expect(openFake.calledWith(localCarrier.container)).to.be.true
        })

        it("contains Proxy for a class and pass constructor arguments for Delivery open()", () => {
            const TestClass = class {}
            const openFake = sinon.fake.returns(new TestClass)

            const delivery = sinon.fake.returns({
                sourceConstructor: TestClass,
                open: openFake
            }) as unknown as () => AnyDelivery

            const localCarrier = new LocalCarrier({Test: delivery})

            new localCarrier.container.Test(1, 2, 3)

            expect(openFake.calledWith(localCarrier.container, 1, 2, 3)).to.be.true
        })
    })
})
