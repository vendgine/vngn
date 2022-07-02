import { Newable, Tuple } from "ts-essentials"
import Delivery from "@/interfaces/delivery.mjs"
import { DeliveredConstructorParameters, DeliveredInstanceOf, DeliveryParameters } from "@/interfaces/delivery.mjs"
import Container from "@/interfaces/container.mjs"
import { isDeliveryLocation } from "@/interfaces/delivery.mjs"

/** A map of constructed and cached instances of the delivered constructor. */
export const cachedDeliveries: Map<Newable<unknown>, Map<unknown[], unknown>> = new Map()
/** A map of constructed instance to cache lifetime timeout. */
export const deliveryTimers: Map<unknown, NodeJS.Timeout> = new Map()
/** A regular expression for a string timeout parser. */
export const LIFETIME_PARSING_REGEXP = /^(\d+)([smhd])$/
/**
 * This class describes an object that can be delivered by carrier object. Constructed instance will be
 * cached and same instance will be returned if same arguments will be passed to the constructor in
 * period of cache lifetime (infinity by default).
 */
export default class CachedDelivery<
    SourceConstructor extends Newable<unknown>,
    PreparedParameters extends DeliveryParameters<SourceConstructor>,
    DeliveredParameters extends Tuple = DeliveredConstructorParameters<SourceConstructor, PreparedParameters>,
> implements Delivery<SourceConstructor, PreparedParameters, DeliveredParameters>
{
    /** A property of source constructor for this delivery. */
    readonly sourceConstructor: SourceConstructor
    /** A property of arguments that will be passed to source constructor. */
    readonly preparedArguments: PreparedParameters
    /** A property of a lifetime for the cached instance. */
    readonly lifetime: number

    /**
     * The constructor takes a constructor to deliver and list of preconfigured arguments.
     */
    constructor(lifetime: number | string, sourceConstructor: SourceConstructor, ...preparedArguments: PreparedParameters) {
        this.sourceConstructor = sourceConstructor
        this.preparedArguments = preparedArguments
        this.lifetime = this.parseLifetime(lifetime)

        // Create a container for instances of the delivery constrcutor:
        if (cachedDeliveries.has(sourceConstructor) == false) {
            cachedDeliveries.set(sourceConstructor, new Map())
        }  
    }

    /**
     * This method returns saved or constructed instance of source constructor for current
     * instance of delivery object.
     * @param container an object of dependency injection container.
     * @param constructorArguments arguments that will be passed to target constructor.
     * @returns an instance of delivered type.
     */
    open(container: Container, ...constructorArguments: DeliveredParameters): DeliveredInstanceOf<SourceConstructor> {
        const finalArguments = [container, ...this.preparedArguments, ...constructorArguments]
        
        const instances = cachedDeliveries.get(this.sourceConstructor)
        // Find saved cached instance of the delivery:
        for (const [cachedArguments, cachedInstance] of instances.entries()) {
            if ((finalArguments.every((value, index) => value === cachedArguments[index]))
             && (finalArguments.length === cachedArguments.length)
              ) {
                if (this.lifetime !== Infinity) {
                    // Restart delivery timer for this instance: 
                    deliveryTimers.get(this.sourceConstructor).refresh()
                }
                // Return saved instance of the object:
                return cachedInstance as DeliveredInstanceOf<SourceConstructor>
            }
        }

        // Create an instance of cached delivery:
        let constructedInstance: DeliveredInstanceOf<SourceConstructor>
        switch (true) {
            // If constructor is a delivery location, pass the container as it's first argument:
            case isDeliveryLocation(this.sourceConstructor):
                constructedInstance = new this.sourceConstructor(
                    container,
                    ...this.preparedArguments,
                    ...constructorArguments,
                ) as DeliveredInstanceOf<SourceConstructor>
                break
            // Otherwise, create instance with passed and preconfigured arguments:
            default:
                constructedInstance = new this.sourceConstructor(
                    ...this.preparedArguments,
                    ...constructorArguments,
                ) as DeliveredInstanceOf<SourceConstructor>
                break
        }

        // Save cached instance of delivered constrcutor:
        instances.set(finalArguments, constructedInstance)

        // Set the timeout for cached value:
        if (this.lifetime !== Infinity) {
            deliveryTimers.set(
                this.sourceConstructor,
                setTimeout(
                    () => {
                        instances.delete(finalArguments)
                        deliveryTimers.delete(constructedInstance)
                    },
                    this.lifetime
                )
            )
        }

        return constructedInstance 
    }
    /**
     * This method converts passed value of a lifetime to the number of microseconds.
     */
    protected parseLifetime(lifetime: number | string): number {
        // Return value as is if it was passed as a number or as Infinity:
        if (lifetime.constructor === Number || lifetime === Infinity) {
            // Throw an error exception if the value is negative:
            if (lifetime < 0) {
                throw new Error(
                    "CachedDelivery: Wrong argument, numeric value should be a positive number."
                )
            }
            return lifetime
        }
        // Covert a string value:
        if ( lifetime.constructor === String ) {
            // Validate the value format:
            if ( LIFETIME_PARSING_REGEXP.test( lifetime ) ) {
                const [, value, units] = LIFETIME_PARSING_REGEXP.exec(lifetime)
                const numericValue = Number(value)
                // Convert to a number based on units of the value:
                switch ( units ) {
                    case "s":
                        return 1000 * numericValue
                    case "m":
                        return 1000 * numericValue * 60
                    case "h":
                        return 1000 * numericValue * 60 * 60
                    case "d":
                        return 1000 * numericValue * 60 * 60 * 24
                }
            }
        }
        // Otherwise, throw an error exception:
        throw new Error(
            `CachedDelivery: Wrong format for a cache lifetime value "${lifetime}".`
        )
    }
}
