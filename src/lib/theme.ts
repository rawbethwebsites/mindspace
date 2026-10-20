// Looks: four complete visual directions (Mindspace 2056 board, 20 Oct 2026). Default: Living Light.
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

export type LookId = 'living' | 'paper' | 'glass' | 'signal'

export const looks: { id: LookId; name: string; tagline: string; dark: boolean; swatch: string }[] = [
  { id: 'living', name: 'Living Light', tagline: 'One breathing light in the dark', dark: true, swatch: 'radial-gradient(circle at 40% 35%, #fff3dc, #f6c873 25%, #ef7851 60%, #07090c 62%)' },
  { id: 'paper', name: 'Horizon Paper', tagline: 'Calm, warm and editorial', dark: false, swatch: 'linear-gradient(180deg, #f3eee6 58%, #111923 58%, #111923 60%, #f3eee6 60%)' },
  { id: 'glass', name: 'Glass Depth', tagline: 'Floating glass over a sunrise', dark: true, swatch: 'linear-gradient(160deg, #e9a26e, #c9714a 50%, #5b4a5e)' },
  { id: 'signal', name: 'Signal', tagline: 'Precise, like an instrument', dark: true, swatch: 'repeating-linear-gradient(170deg, #0d0f12 0 6px, #3a3f46 6px 7px)' },
]

export function loadLook(): LookId {
  try {
    const v = localStorage.getItem('mindspace-look') as LookId | null
    return looks.some((l) => l.id === v) ? (v as LookId) : 'living'
  } catch { return 'living' }
}

export function applyLook(id: LookId) {
  document.documentElement.dataset.theme = id
  try { localStorage.setItem('mindspace-look', id) } catch { /* private mode */ }
  const dark = looks.find((l) => l.id === id)?.dark ?? true
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#07090c' : '#f3eee6')
  if (Capacitor.isNativePlatform()) StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => {})
  window.dispatchEvent(new CustomEvent('look-change', { detail: id }))
}
