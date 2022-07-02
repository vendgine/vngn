import { ElementOf, IsAny, IsUnknown, Newable, Tuple } from "ts-essentials"
import Container, { ContainerDestination, ContainerDestinationParameters } from "./container.mjs"

/**
 * Declare the container destination symbol.
 */
const DeliveryLocationSymbol: unique symbol = Symbol()
/**
 * This decorator should be used on the container destination classes.
 */
export const DeliveryLocation = (constructor: ContainerDestination) => {
    Reflect.set(constructor, DeliveryLocationSymbol, "Dependency Injection Destination")
}
/**
 * This type guard function can be used to check if class is a container destination object.
 */
export function isDeliveryLocation(constructor: Newable<unknown>): constructor is ContainerDestination {
    return Reflect.has(constructor, DeliveryLocationSymbol)
}
/**
 * This type declares any delivery type.
 */
export type AnyDelivery = Delivery<Newable<object>, unknown[], unknown[]>
/**
 * This type declares tuple where all elements are optional.
 */
export type MakeOptionalParameters<InputParameters extends Tuple> = InputParameters extends []
    ? []
    : InputParameters extends [infer FirstParameter, ...infer RestParameters]
    ? [FirstParameter?, ...MakeOptionalParameters<RestParameters>]
    : InputParameters
/**
 * This type is true if parameters are unknown, any or empty, and false otherwise.
 */
export type IsUnspecified<InputParameters extends Tuple> = IsAny<ElementOf<InputParameters>> extends true
    ? true
    : IsUnknown<ElementOf<InputParameters>> extends true
    ? true
    : InputParameters extends []
    ? true
    : false
/**
 * This type declares a tuple where parameters passed as the first argument were removed from the tuple
 * that was passed as the second argument.
 */
export type RemainingParameters<
    Parameters extends Tuple,
    ParametersToRemove extends Tuple,
> = IsUnspecified<Parameters> extends true
    ? never[]
    : ((...args: Parameters) => void) extends (
          first?: infer FirstOfParameters,
          ...other: infer RestOfParameters
      ) => void
    ? ((...args: ParametersToRemove) => void) extends (
          first?: infer FirstOfParametersToRemove,
          ...other: infer RestOfParametersToRemove
      ) => void
        ? FirstOfParametersToRemove extends FirstOfParameters
            ? [...passed: RemainingParameters<RestOfParameters, RestOfParametersToRemove>]
            : Parameters
        : Parameters
    : Parameters
/**
 * This type declares optional arguments tuple for the passed constructor.
 */
export type DeliveryParameters<SourceConstructor extends Newable<unknown>> =
    SourceConstructor extends ContainerDestination
        ? MakeOptionalParameters<ContainerDestinationParameters<SourceConstructor>>
        : MakeOptionalParameters<ConstructorParameters<SourceConstructor>>
/**
 * This type declares arguments for delivered constructor.
 */
export type DeliveredConstructorParameters<
    SourceConstructor extends Newable<unknown>,
    DeliveryParameters extends Tuple,
> = SourceConstructor extends ContainerDestination
    ? RemainingParameters<ConstructorParameters<SourceConstructor>, [container: Container, ...rest: DeliveryParameters]>
    : RemainingParameters<ConstructorParameters<SourceConstructor>, DeliveryParameters>
/**
 * This type declares a delivered instance of passed source class.
 */
export type DeliveredInstanceOf<SourceConstructor extends Newable<unknown>> = 
    SourceConstructor extends Newable<infer SourceType>
    ? SourceType
    : never
/**
 * This interface describes a class of instance delivery object.
 */
export default interface Delivery<
    SourceConstructor extends Newable<unknown>,
    PreparedParameters extends Tuple,
    DeliveredParameters extends Tuple,
> {
    /** A property of source constructor for this delivery. */
    readonly sourceConstructor: SourceConstructor
    /** A property of arguments that will be passed to source constructor. */
    readonly preparedArguments: PreparedParameters
    /**
     * This method returns saved or constructed instance of source constructor for current
     * instance of delivery object.
     * @param container an object of dependency injection container.
     * @param constructorArguments arguments that will be passed to target constructor.
     * @returns an instance of delivered type.
     */
    open(container: Container, ...constructorArguments: DeliveredParameters): DeliveredInstanceOf<SourceConstructor>
}
