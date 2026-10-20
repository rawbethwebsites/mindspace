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

// Settings that must survive a wipe so the disguise stays in place afterwards.
const KEEP_ON_WIPE = ['mindspace-safe-mode', 'mindspace-safe-code', 'mindspace-look', 'mindspace-quiet-dismissed']

/** Full wipe: IndexedDB stores + localStorage + sessionStorage. The disguise and its code stay. */
export async function fullWipe() {
  await clearAllData()
  for (const k of Object.keys(localStorage)) if (!KEEP_ON_WIPE.includes(k)) localStorage.removeItem(k)
  try { sessionStorage.clear() } catch { /* ignore */ }
  window.location.reload()
}

export function isSafeModeEnabled(): boolean {
  try { return localStorage.getItem('mindspace-safe-mode') === '1' && /^\d{4}$/.test(getSafeCode() ?? '') } catch { return false }
}

export function getSafeCode(): string | null {
  try { return localStorage.getItem('mindspace-safe-code') } catch { return null }
}

export function setSafeCode(code: string) {
  localStorage.setItem('mindspace-safe-code', code)
}

// A shake never wipes directly: it asks the guard to start a 5-second countdown with Cancel.
const requestWipe = () => window.dispatchEvent(new CustomEvent('safe-wipe-request'))

export function setSafeMode(enabled: boolean) {
  localStorage.setItem('mindspace-safe-mode', enabled ? '1' : '0')
  if (enabled) startShakeWipe(requestWipe)
  else stopShakeWipe()
}

/** Initialise on app load if enabled. */
export function initSafeMode() {
  if (isSafeModeEnabled()) startShakeWipe(requestWipe)
}
