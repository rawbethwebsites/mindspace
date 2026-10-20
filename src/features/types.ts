import type { ComponentType, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

// A standalone feature with its own screen, listed on /tools.
export interface Feature {
  id: string
  route: string // e.g. '/burn'
  title: string
  blurb: string
  icon: LucideIcon
  element: ReactNode
}

// A block shown on /settings (toggles, pickers).
export interface SettingsSection {
  id: string
  title: string
  element: ReactNode
}

// Each builder registers into its own file (a.tsx, b.tsx, c.tsx) so nobody edits a shared list.
export interface FeatureBundle {
  features: Feature[]
  settings: SettingsSection[]
  globals: ComponentType[] // always-mounted helpers (e.g. night mode, shake-to-wipe)
  // Extra lines added to every companion chat's instructions (e.g. language, faith, remembered facts).
  // Return '' when the user has it switched off.
  systemAddons: (() => string)[]
}
