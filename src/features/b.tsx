import type { FeatureBundle } from './types'
import { languageAddon } from './b-prefs'
import LanguageSettings from '../components/b/LanguageSettings'
import Patterns from '../components/b/Patterns'
import { Activity } from 'lucide-react'

// Batch B registers its features here (and only here) for the Tools page, Settings and app-wide helpers.
export const bundleB: FeatureBundle = {
  features: [
    {
      id: 'b-patterns',
      route: '/patterns',
      title: 'Your patterns',
      blurb: 'What your hard and good days have in common.',
      icon: Activity,
      element: <Patterns />,
    },
  ],
  settings: [{ id: 'b-language', title: 'Language', element: <LanguageSettings /> }],
  globals: [],
  systemAddons: [languageAddon],
}