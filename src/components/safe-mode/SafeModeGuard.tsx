import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { isSafeModeEnabled, initSafeMode } from '../../lib/safe-mode'
import SafeModeCalculator from './SafeModeCalculator'

/**
 * Global wrapper: when Safe-at-home Mode is enabled, the whole app is hidden
 * behind a working calculator. Tapping MC 5× fast unlocks to the real app.
 * This component mounts at the top level (via globals in bundleC).
 */

export default function SafeModeGuard() {
  const [locked, setLocked] = useState(true)
  const location = useLocation()

  useEffect(() => {
    initSafeMode()
    if (isSafeModeEnabled()) setLocked(true)
  }, [])

  // Re-lock on navigation so a refresh or back-button doesn't bypass the calculator
  useEffect(() => {
    if (isSafeModeEnabled()) setLocked(true)
  }, [location.pathname])

  if (!isSafeModeEnabled()) return null
  if (!locked) return null

  return <SafeModeCalculator onUnlock={() => setLocked(false)} />
}