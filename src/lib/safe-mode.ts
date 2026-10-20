// Shake detection — purely local, clears ALL on-device data when triggered.
import { clearAllData } from '../lib/db'

let shakeCb: (() => void) | null = null
let lastShake = 0
const SHAKE_THRESHOLD = 22 // m/s^2 — firm shake, not a jog
const SHAKE_WINDOW_MS = 800

function onMotion(e: DeviceMotionEvent) {
  const acc = e.accelerationIncludingGravity
  if (!acc || acc.x === null || acc.y === null || acc.z === null) return
  const mag = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2)
  if (mag > SHAKE_THRESHOLD) {
    const now = Date.now()
    if (now - lastShake < SHAKE_WINDOW_MS && shakeCb) {
      shakeCb()
      lastShake = 0
    } else {
      lastShake = now
    }
  }
}

export function startShakeWipe(cb: () => void) {
  shakeCb = cb
  if ('DeviceMotionEvent' in window) {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      ;(DeviceMotionEvent as any).requestPermission().then((perm: string) => {
        if (perm === 'granted') window.addEventListener('devicemotion', onMotion, { passive: true })
      })
    } else {
      window.addEventListener('devicemotion', onMotion, { passive: true })
    }
  }
}

export function stopShakeWipe() {
  shakeCb = null
  window.removeEventListener('devicemotion', onMotion)
}

/** Full wipe — IndexedDB stores + localStorage + sessionStorage. */
export async function fullWipe() {
  await clearAllData()
  const protectedKeys = ['mindspace-quiet-dismissed'] // Quiet Signal dismissal is per-streak; wipe it
  const localKeys = Object.keys(localStorage)
  for (const k of localKeys) if (!protectedKeys.includes(k)) localStorage.removeItem(k)
  try { sessionStorage.clear() } catch {}
  // Force reload so the calculator disguise returns to its innocent state
  window.location.reload()
}

/** Check if Safe-at-home Mode is enabled. */
export function isSafeModeEnabled(): boolean {
  return localStorage.getItem('mindspace-safe-mode') === '1'
}

export function setSafeMode(enabled: boolean) {
  localStorage.setItem('mindspace-safe-mode', enabled ? '1' : '0')
  if (enabled) startShakeWipe(fullWipe)
  else stopShakeWipe()
}

/** Initialise on app load if enabled. */
export function initSafeMode() {
  if (isSafeModeEnabled()) startShakeWipe(fullWipe)
}