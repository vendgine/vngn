import provider from "@/common/provider.mjs"
import LocalCarrier from "@/infrastructure/dependencies/carriers/local.mjs"

// Create the instance of local carrier object for current provider:
export const localCarrier = new LocalCarrier(provider)