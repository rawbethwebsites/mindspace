import type { FeatureBundle } from './types'
import { Users } from 'lucide-react'
import QuietSignal from '../components/quiet-signal/QuietSignal'
import QuietSignalBanner from '../components/quiet-signal/QuietSignalBanner'

// Batch C registers its features here (and only here) for the Tools page, Settings and app-wide helpers.
export const bundleC: FeatureBundle = {
  features: [
    {
      id: 'your-people',
      route: '/your-people',
      title: 'Your people',
      blurb: 'When words are hard, send your weather to someone you trust.',
      icon: Users,
      element: <QuietSignal />,
    },
  ],
  settings: [],
  globals: [QuietSignalBanner],
  systemAddons: [],
}