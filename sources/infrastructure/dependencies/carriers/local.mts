import { Newable } from "ts-essentials"
import Carrier from "@/interfaces/carrier.mjs"
import Provider from "@/interfaces/provider.mjs"
import { ContainerOf } from "@/interfaces/container.mjs"
import { AnyDelivery } from "@/interfaces/delivery.mjs"

/**
 * This class describes an object of carrier that can deliver provided constructors.
 */
export default class LocalCarrier<CurrentProvider extends Provider> implements Carrier {
    /** A container object that will be used to deliver dependencies. */
    readonly container: ContainerOf<CurrentProvider>

    /**
     * The constructor gets a provider object as the arguments to compose a container.
     * @param provider object that provides instances of objects for the container.
     */
    constructor(provider: CurrentProvider) {
        // Save proxy for current container's map:
        this.container = new Proxy(provider, {
            get: this.pickup.bind(this),
            has: this.check.bind(this),
            set: () => false,
        }) as unknown as ContainerOf<CurrentProvider>
    }

    /**
     * This method returns true if there is a getter in the container proxy.
     * @param provider an object of constructor's providers.
     * @param constructorName a name of constructor to check.
     */
    private check(provider: Provider, constructorName: string): boolean {
        return Reflect.has(provider, constructorName)
    }

    /**
     * This method handles getter of container proxy.
     * @param provider an object of constructor's providers.
     * @param constructorName a name of constructor to pick up.
     * @returns value from dependencies container.
     */
    private pickup(provider: Provider, constructorName: string): Newable<unknown> {
        // Check if property does exist:
        if (Reflect.has(provider, constructorName) === true) {
            const providerFunction = Reflect.get(provider, constructorName)
            // Get delivery from the provider function:
            const delivery = providerFunction(this.container)
            // Pass container and return computed value:
            return new Proxy(
                class extends delivery.sourceConstructor {}, 
                { construct: this.deliver.bind(this, delivery) }
            ) as Newable<unknown>
        }
        // Return other properties as is:
        return Reflect.get(provider, constructorName)
    }

    /**
     * This method handles constructor of object's class derived from the container.
     * @param providedValue an instance or a function that returns an instance.
     * @param constructor argument passed from "construct" method of a proxy handler.
     * @param constructorArguments arguments passed to 'construct' method of a proxy handler.
     */
    private deliver(delivery: AnyDelivery, origin: unknown, constructorArguments: unknown[]): object {
        return delivery.open(this.container, ...constructorArguments)
    }
}
