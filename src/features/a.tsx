import type { FeatureBundle } from './types'
import { Mail, Flame } from 'lucide-react'
import LetterToFuture from '../pages/LetterToFuture'
import BurnIt from '../pages/BurnIt'
import LetterMoment from '../components/LetterMoment'

// Batch A registers its features here (and only here) for the Tools page, Settings and app-wide helpers.
export const bundleA: FeatureBundle = {
  features: [
    {
      id: 'letter-future',
      route: '/letter-to-future-you',
      title: 'Letter to future you',
      blurb: 'Write on a good day. It finds you on the hard ones.',
      icon: Mail,
      element: <LetterToFuture />,
    },
    {
      id: 'burn-it',
      route: '/burn-it',
      title: 'Burn it',
      blurb: 'Say it. Watch it go. Nothing is saved.',
      icon: Flame,
      element: <BurnIt />,
    },
  ],
  settings: [],
  globals: [LetterMoment],
  systemAddons: [],
}
