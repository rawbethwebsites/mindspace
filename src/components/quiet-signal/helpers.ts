// Quiet Signal helpers — trusted people and the "my weather" message.
// Everything stays on the phone: names/phones live in IndexedDB, sharing happens
// only through the phone's own share sheet or an sms: link the person presses send on.

export type Weather = 'sunny' | 'cloudy' | 'stormy'

export const weatherOptions: { id: Weather; label: string; emoji: string; color: string }[] = [
  { id: 'sunny', label: 'Sunny', emoji: '☀️', color: '#f2bd5b' },
  { id: 'cloudy', label: 'Cloudy', emoji: '⛅', color: '#8fa3b8' },
  { id: 'stormy', label: 'Stormy', emoji: '⛈️', color: '#7d8189' },
]

// Short, honest, no pressure on the receiver. The person always presses send themselves.
export function weatherMessage(w: Weather, name: string): string {
  const lines: Record<Weather, string> = {
    sunny: `Hi ${name}, just sharing my weather today: I'm doing okay — sunny. No need to reply, just wanted you to know. 💛`,
    cloudy: `Hi ${name}, sharing my weather today: I'm having a cloudy day — a bit low, but I'm okay. You don't have to fix anything; knowing you're there helps.`,
    stormy: `Hi ${name}, today feels stormy for me. I'm not in danger, just having a hard day and wanted to tell you. If you have a moment, I'd love to hear from you.`,
  }
  return lines[w]
}

// Share via the phone's own sheet when available, else open an sms: link.
// Returns the path taken so the UI can say what happened.
export async function shareWeather(
  weather: Weather,
  person: { name: string; phone: string },
): Promise<'share' | 'sms' | 'copy'> {
  const message = weatherMessage(weather, person.name)
  if (navigator.share) {
    try {
      await navigator.share({ text: message })
      return 'share'
    } catch (err) {
      // User closing the sheet throws AbortError; fall through to sms only on real failure.
      if ((err as DOMException)?.name === 'AbortError') return 'share'
    }
  }
  try {
    window.location.href = `sms:${person.phone.replace(/[^+\d]/g, '')}?&body=${encodeURIComponent(message)}`
    return 'sms'
  } catch {
    await navigator.clipboard.writeText(message).catch(() => {})
    return 'copy'
  }
}

// The Home banner rule: last 3 check-ins all Low (1) or Struggling (0).
export function isWeatherBannerDue(last3Moods: number[]): boolean {
  return last3Moods.length >= 3 && last3Moods.slice(-3).every((m) => m <= 1)
}