import { Newable, Tuple } from "ts-essentials"
import Delivery from "@/interfaces/delivery.mjs"
import { DeliveredConstructorParameters, DeliveredInstanceOf, DeliveryParameters } from "@/interfaces/delivery.mjs"
import Container from "@/interfaces/container.mjs"
import { isDeliveryLocation } from "@/interfaces/delivery.mjs"

/**
 * This class describes an object that can be delivered by carrier object. New instance will be
 * constructed on each call of open method.
 */
export default class RegularDelivery<
    SourceConstructor extends Newable<unknown>,
    PreparedParameters extends DeliveryParameters<SourceConstructor>,
    DeliveredParameters extends Tuple = DeliveredConstructorParameters<SourceConstructor, PreparedParameters>,
> implements Delivery<SourceConstructor, PreparedParameters, DeliveredParameters>
{
    /** A property of source constructor for this delivery. */
    readonly sourceConstructor: SourceConstructor
    /** A property of arguments that will be passed to source constructor. */
    readonly preparedArguments: PreparedParameters

    /**
     * The constructor takes a constructor to deliver and list of preconfigured arguments.
     */
    constructor(sourceConstructor: SourceConstructor, ...preparedArguments: PreparedParameters) {
        this.sourceConstructor = sourceConstructor
        this.preparedArguments = preparedArguments
    }

    /**
     * This method returns saved or constructed instance of source constructor for current
     * instance of delivery object.
     * @param container an object of dependency injection container.
     * @param constructorArguments arguments that will be passed to target constructor.
     * @returns an instance of delivered type.
     */
    open(container: Container, ...constructorArguments: DeliveredParameters): DeliveredInstanceOf<SourceConstructor> {
        switch (true) {
            // If constructor is a delivery location, pass the container as it's first argument:
            case isDeliveryLocation(this.sourceConstructor):
                return new this.sourceConstructor(
                    container,
                    ...this.preparedArguments,
                    ...constructorArguments,
                ) as DeliveredInstanceOf<SourceConstructor>
            // Otherwise, create instance with passed and preconfigured arguments:
            default:
                return new this.sourceConstructor(
                    ...this.preparedArguments,
                    ...constructorArguments,
                ) as DeliveredInstanceOf<SourceConstructor>
        }
    }
}
