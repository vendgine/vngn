import Provider from "@/interfaces/provider.mjs"
import Delivery from "@/interfaces/delivery.mjs"

/**
 * This type declares constructor that takes the container as the first argument.
 */
export type ContainerDestination = {
    new (container: Container, ...args: any[]): unknown
}
/**
 * This type declares constructor returns container destination paramers (all arguments without a container).
 */
export type ContainerDestinationParameters<Constructor extends ContainerDestination> = Constructor extends new (
    container: Container,
    ...args: infer RestOfParameters
) => unknown
    ? RestOfParameters
    : never[]
/**
 * This type declares a provided class type helper.
 */
export type OverridedConstructorOf<Class, Arguments extends unknown[] = never[]> = new (...args: Arguments) => Class
/**
 * This type declares the contents of dependency injection container for a passed provider.
 */
export type ContainerOf<Contents extends Provider> = {
    readonly [name in keyof Contents]: ReturnType<Contents[name]> extends Delivery<
        infer SourceConstructor,
        infer PreparedParameters,
        infer DeliveredParameters
    >
        ? OverridedConstructorOf<SourceConstructor, DeliveredParameters>
        : never
}
/**
 * This type declares object that contains constructors.
 */
type Container = ContainerOf<Provider>

// Export the type as module's default export:
export default Container
