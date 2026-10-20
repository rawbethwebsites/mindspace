// Batch B preferences: language, faith, night mode, mood tags.
// Plain localStorage helpers so pages, settings and companion instructions
// all read the same choice. Imports nothing from the app — safe from anywhere.

export type BabelLang = 'en' | 'pcm' | 'yo' | 'ig' | 'ha'

export const LANGUAGES: { id: BabelLang; name: string; note: string }[] = [
  { id: 'en', name: 'English', note: 'The default. Companions already speak it.' },
  { id: 'pcm', name: 'Naija Pidgin', note: 'Everyday Nigerian Pidgin, warm and natural.' },
  { id: 'yo', name: 'Yorùbá', note: 'Companions greet and reply in Yorùbá.' },
  { id: 'ig', name: 'Igbo', note: 'Companions greet and reply in Igbo.' },
  { id: 'ha', name: 'Hausa', note: 'Companions greet and reply in Hausa.' },
]

export function loadLang(): BabelLang {
  try {
    const v = localStorage.getItem('mindspace-lang') as BabelLang | null
    return LANGUAGES.some((l) => l.id === v) ? (v as BabelLang) : 'en'
  } catch {
    return 'en'
  }
}

export function saveLang(id: BabelLang) {
  try {
    localStorage.setItem('mindspace-lang', id)
  } catch {
    /* private mode */
  }
}

// systemAddons entry (registered in src/features/b.tsx). '' when English.
export function languageAddon(): string {
  const lang = loadLang()
  if (lang === 'en') return ''
  const name = LANGUAGES.find((l) => l.id === lang)?.name ?? 'English'
  return `Language: the person chose ${name}. Reply fully and naturally in ${name}, the way a warm, well-spoken Nigerian friend would — local expressions are welcome where they fit, never mocking, never stereotyped. Greet them kindly when it fits. If the person writes in another language, follow their language instead. Keep every safety rule exactly as written, including crisis resources.`
}