// "3 a.m. mode" (Batch B). On by default; between 00:00 and 05:00 local time
// the app dims and slows down (global helper in components/b/NightMode.tsx).
// mindspace-night-test=1 lets a reviewer force the night state to see it —
// listed in the build REPORT as a testing affordance.

export function loadNightMode(): boolean {
  try {
    const v = localStorage.getItem('mindspace-night-mode')
    return v === null ? true : v === '1'
  } catch {
    return true
  }
}

export function saveNightMode(on: boolean) {
  try {
    localStorage.setItem('mindspace-night-mode', on ? '1' : '0')
  } catch {
    /* private mode */
  }
}

// Between 00:00 and 05:00 on the person's own clock.
export function isNightHour(d: Date = new Date()): boolean {
  const h = d.getHours()
  return h >= 0 && h < 5
}

export function nightTestOn(): boolean {
  try {
    return localStorage.getItem('mindspace-night-test') === '1'
  } catch {
    return false
  }
}