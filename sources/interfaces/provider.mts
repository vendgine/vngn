import { AnyDelivery } from "@/interfaces/delivery.mjs"
import Container from "@/interfaces/container.mjs"

/**
 * This type declares a dependencies provider object.
 */
type Provider = {
    [name: string]: (container?: Container) => AnyDelivery
}

// Export the type as module's default export:
export default Provider
