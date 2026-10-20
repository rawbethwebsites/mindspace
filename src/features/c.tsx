import type { FeatureBundle } from './types'
import { Users, HeartPulse, Calculator, LifeBuoy } from 'lucide-react'
import QuietSignal from '../components/quiet-signal/QuietSignal'
import QuietSignalBanner from '../components/quiet-signal/QuietSignalBanner'
import HeartCheck from '../components/heart-rate/HeartCheck'
import SafeModeGuard from '../components/safe-mode/SafeModeGuard'
import SafeModeSettings from '../components/safe-mode/SafeModeSettings'

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
    {
      id: 'proof-heart',
      route: '/proof-heart',
      title: 'Proof it worked',
      blurb: 'Check your heart-rate after breathing to see your body settle.',
      icon: HeartPulse,
      element: <HeartCheck />,
    },
    {
      id: 'safe-mode',
      route: '/safe-mode',
      title: 'Safe-at-home',
      blurb: 'Calculator disguise with shake-to-wipe. Nothing leaves your phone.',
      icon: Calculator,
      element: <div className="p-6 text-center text-[var(--color-on-surface-muted)]">
        Safe-at-home Mode is managed in Settings. Toggle it on there, then the app
        will hide behind the calculator on every visit.
      </div>,
    },
    {
      id: 'bridge-help',
      route: '/bridge-help',
      title: 'Bridge to real help',
      blurb: '14-day summary + Nigeria guide you can hand to a clinician.',
      icon: LifeBuoy,
      element: <div className="p-6 text-center text-[var(--color-on-surface-muted)]">
        Building the 14-day summary and Nigeria clinician guide…
      </div>,
    },
  ],
  settings: [
    {
      id: 'safe-mode',
      title: 'Safe-at-home Mode',
      element: <SafeModeSettings />,
    },
  ],
  globals: [QuietSignalBanner, SafeModeGuard],
  systemAddons: [],
}