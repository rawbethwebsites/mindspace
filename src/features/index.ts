import { bundleA } from './a'
import { bundleB } from './b'
import { bundleC } from './c'

const bundles = [bundleA, bundleB, bundleC]
export const features = bundles.flatMap((b) => b.features)
export const settingsSections = bundles.flatMap((b) => b.settings)
export const globalHelpers = bundles.flatMap((b) => b.globals)
export const systemAddons = () => bundles.flatMap((b) => b.systemAddons.map((f) => f())).filter(Boolean).join('\n')
