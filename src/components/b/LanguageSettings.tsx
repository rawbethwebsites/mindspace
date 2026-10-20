import { useState } from 'react'
import { Check } from 'lucide-react'
import { LANGUAGES, loadLang, saveLang, type BabelLang } from '../../features/b-prefs'

// Settings block: "Language". Saved locally; a systemAddons entry (b-prefs.ts)
// tells companions to reply in the chosen language.
export default function LanguageSettings() {
  const [lang, setLang] = useState<BabelLang>(loadLang())

  const choose = (id: BabelLang) => {
    saveLang(id)
    setLang(id)
  }

  return (
    <div role="radiogroup" aria-label="Language">
      <div className="space-y-1.5">
        {LANGUAGES.map((l) => (
          <button
            key={l.id}
            role="radio"
            aria-checked={lang === l.id}
            onClick={() => choose(l.id)}
            className={`press w-full flex items-center gap-3 p-3 rounded-2xl text-left ${lang === l.id ? 'bg-[var(--color-primary)]/10' : ''}`}
          >
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-[var(--color-on-surface)]">{l.name}</span>
              <span className="block text-[13px] text-[var(--color-on-surface-muted)] leading-snug">{l.note}</span>
            </span>
            {lang === l.id && <Check size={18} className="text-[var(--color-primary)] shrink-0" aria-label="Current" />}
          </button>
        ))}
      </div>
      <p className="text-xs text-[var(--color-on-surface-muted)] mt-3 leading-relaxed">
        Companions reply in this language, with local warmth where it fits. If you write to them in another language,
        they follow you.
      </p>
    </div>
  )
}