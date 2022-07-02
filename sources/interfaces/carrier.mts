import Container from "@/interfaces/container.mjs"

/**
 * This type declares an object that delivers overrided constructors from passed provider object to
 * defined delivery locations.
 */
export default interface Carrier {
    /** A container object that will be used to deliver dependencies. */
    readonly container: Container
}
