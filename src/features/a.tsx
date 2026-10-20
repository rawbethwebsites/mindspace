import type { FeatureBundle } from './types'
import { Mail, Flame, MessagesSquare, Sparkles } from 'lucide-react'
import LetterToFuture from '../pages/LetterToFuture'
import BurnIt from '../pages/BurnIt'
import RehearsalRoom from '../pages/RehearsalRoom'
import WinsJar from '../pages/WinsJar'
import LetterMoment from '../components/LetterMoment'
import MemorySettings from '../components/MemorySettings'
import { getMemories } from '../lib/db'

// The system addon function syncs a fresh read of memories once per app
// session; IndexedDB is async, so we kick a pull on each call and use
// whatever was cached by the previous call.
let memoryCache: string[] = []
let memoryPull: Promise<void> | null = null
function refreshMemories() {
  if (!memoryPull) {
    memoryPull = getMemories()
      .then((all) => {
        memoryCache = all.filter((m) => m.enabled).map((m) => m.fact)
      })
      .catch(() => { memoryCache = [] })
      .finally(() => { memoryPull = null })
  }
}
// Prime at startup so the first message of a session already knows the facts.
refreshMemories()
window.addEventListener('memories-changed', refreshMemories)

function CompanionMemoryAddon(): string {
  refreshMemories()
  if (memoryCache.length === 0) return ''
  const lines = memoryCache.slice(0, 12).map((f) => `- ${f}`)
  return `Things this person has chosen to tell you about themselves (do not repeat back unprompted):\n${lines.join('\n')}`
}

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
    {
      id: 'rehearsal-room',
      route: '/rehearsal-room',
      title: 'Rehearsal room',
      blurb: 'Practice the hard conversation, safely.',
      icon: MessagesSquare,
      element: <RehearsalRoom />,
    },
    {
      id: 'wins-jar',
      route: '/wins-jar',
      title: 'Wins jar',
      blurb: 'Small wins. Poured out when you need them.',
      icon: Sparkles,
      element: <WinsJar />,
    },
  ],
  settings: [
    {
      id: 'memory-you-control',
      title: 'What your companion remembers',
      element: <MemorySettings />,
    },
  ],
  globals: [LetterMoment],
  systemAddons: [CompanionMemoryAddon],
}

