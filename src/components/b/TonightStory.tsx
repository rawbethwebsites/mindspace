import { useState } from 'react'
import { MoonStar, Loader2 } from 'lucide-react'
import { getTodayMood, getJournalEntries } from '../../lib/db'
import { streamChat, AI_ENABLED } from '../../lib/ai'

const STORY_VOICE = `You are a slow, soothing storyteller for the very end of the day. Speak softly, in short calm sentences with long, easy rhythm. You are telling one person a very short bedtime story that wraps up their own day with warmth. No questions, no advice, no techniques, no lists. Nothing scary, nothing stimulating, no mentions of tasks or the morning. The story must end resting. Plain kind words, like a lullaby in prose. 120-180 words, in the language the person's Mindspace is set to.`

// Tools: "Tonight's story" — a short calm sleep story built from today's
// check-in and journal titles only. Nothing is stored anywhere.
export default function TonightStory() {
  const [asked, setAsked] = useState(false)
  const [story, setStory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    if (loading) return
    setLoading(true)
    setError('')
    setStory('')
    setAsked(true)
    try {
      const [today, journal] = await Promise.all([getTodayMood(), getJournalEntries()])
      const dayBits: string[] = []
      if (today) dayBits.push(`Today's check-in said they felt ${['struggling', 'low', 'okay', 'good', 'great'][today.mood]}.`)
      const todayTitles = journal.filter((j) => j.title.trim()).slice(0, 3).map((j) => `a piece called "${j.title.trim()}"`)
      if (todayTitles.length) dayBits.push(`Earlier they wrote ${todayTitles.join(' and ')}.`)
      const seed = dayBits.length
        ? `Here is what today held for this person: ${dayBits.join(' ')} Weave a soft, dreamlike version of this day into a short bedtime story. Change names and details freely; keep it gentle and low.`
        : 'The person checked nothing in today. Tell a short, soft bedtime story about a quiet day with no weight to carry at all.'
      let full = ''
      for await (const chunk of streamChat([{ role: 'user', content: seed }], undefined, undefined, STORY_VOICE)) {
        full += chunk
        setStory(full)
      }
      if (!full.trim()) setError('The story did not arrive. Please try again in a moment.')
    } catch {
      setError('The story did not arrive. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-page">
      <div className="max-w-3xl mx-auto">
        <header className="mb-7">
          <p className="page-kicker mb-2">3 a.m. mode</p>
          <h1 className="page-title mb-2">Tonight&rsquo;s story</h1>
          <p className="page-subtitle">
            A tiny sleep story, spoken slowly, made from your own day — your check-in and the titles of what you wrote.
            Nothing is kept afterwards.
          </p>
        </header>

        <div className="card p-6">
          <div className="story-moon icon-tile w-12 h-12 mb-5">
            <MoonStar size={24} aria-hidden="true" />
          </div>

          {!asked && (
            <>
              <h2 className="font-semibold text-lg text-[var(--text)] mb-1.5">Ready when you are</h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-5">
                I&rsquo;ll take today&rsquo;s check-in and the titles you gave your journal pieces — nothing else — and
                turn them into something calm to fall asleep to. It isn&rsquo;t saved anywhere. Shall I tell it?
              </p>
              <button onClick={generate} className="btn-sunset press w-full py-3 min-h-[48px]" disabled={!AI_ENABLED}>
                Tell me tonight&rsquo;s story
              </button>
            </>
          )}

          {(loading || story) && (
            <div aria-live="polite">
              <h2 className="font-semibold text-lg text-[var(--text)] mb-2">{loading && !story ? 'Settling in…' : 'Tonight'}</h2>
              <p className="text-[15.5px] leading-[1.85] text-[var(--text)] whitespace-pre-wrap">{story || '…'}</p>
              {loading && (
                <p className="flex items-center gap-2 text-sm text-[var(--text-muted)] mt-4" role="status">
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" /> Telling it slowly…
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4">
              <p className="text-sm text-[var(--text-muted)] mb-4" role="alert">{error}</p>
              <button onClick={generate} className="btn-ghost press w-full py-3 min-h-[48px]">Try again</button>
            </div>
          )}

          {asked && !loading && !error && (
            <button onClick={generate} className="btn-ghost press w-full py-3 min-h-[48px] mt-6">Another story</button>
          )}
        </div>

        <p className="text-xs text-[var(--text-muted)] mt-4 px-1">A self-care wind-down, not therapy. If you can&rsquo;t sleep night after night, a doctor or counsellor can help.</p>
      </div>
    </div>
  )
}