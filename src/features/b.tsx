import type { FeatureBundle } from './types'
import { languageAddon } from './b-prefs'
import LanguageSettings from '../components/b/LanguageSettings'

// Batch B registers its features here (and only here) for the Tools page, Settings and app-wide helpers.
export const bundleB: FeatureBundle = {
  features: [],
  settings: [{ id: 'b-language', title: 'Language', element: <LanguageSettings /> }],
  globals: [],
  systemAddons: [languageAddon],
}