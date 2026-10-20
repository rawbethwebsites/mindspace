import type { FeatureBundle } from './types'
import { languageAddon } from './b-prefs'
import LanguageSettings from '../components/b/LanguageSettings'
import Patterns from '../components/b/Patterns'
import NightMode from '../components/b/NightMode'
import NightSettings from '../components/b/NightSettings'
import TonightStory from '../components/b/TonightStory'
import WeekMusic from '../components/b/WeekMusic'
import { Activity, MoonStar, Music4 } from 'lucide-react'

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
    {
      id: 'b-tonight-story',
      route: '/tonight-story',
      title: "Tonight's story",
      blurb: 'A tiny sleep story made from your own day. Nothing kept.',
      icon: MoonStar,
      element: <TonightStory />,
    },
    {
      id: 'b-week-music',
      route: '/week-music',
      title: 'Your week as music',
      blurb: 'Your last 7 check-ins become a small ambient piece.',
      icon: Music4,
      element: <WeekMusic />,
    },
  ],
  settings: [
    { id: 'b-language', title: 'Language', element: <LanguageSettings /> },
    { id: 'b-night', title: 'Late nights', element: <NightSettings /> },
  ],
  globals: [NightMode],
  systemAddons: [languageAddon],
}