import provider from "@/common/provider.mjs"
import { ContainerOf } from "@/interfaces/container.mjs"
import { localCarrier } from "@/common/carrier.mjs"

// Export type of exported container:
export type Container = ContainerOf<typeof provider>
// Export current container object from this module:
export const container = localCarrier.container
