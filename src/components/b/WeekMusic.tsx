import { useEffect, useRef, useState } from 'react'
import { Music4, Play, Pause, Share2, Loader2 } from 'lucide-react'
import { getMoods } from '../../lib/db'
import { buildWeekSound, scheduleWeek, renderWeekWav, type WeekSound } from '../../features/b-weekmusic'
import './b-music.css'

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// Tools: "Your week as music" — the last 7 check-ins become a 30-60s ambient
// piece. Play/pause with a gentle visual; Save exports a WAV.
export default function WeekMusic() {
  const [week, setWeek] = useState<WeekSound | null>(null)
  const [playing, setPlaying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const ctxRef = useRef<AudioContext | null>(null)
  const stopAtRef = useRef<number>(0)

  useEffect(() => {
    getMoods().then((moods) => setWeek(buildWeekSound(moods)))
    return () => {
      ctxRef.current?.close().catch(() => {})
      ctxRef.current = null
    }
  }, [])

  const stopPlayback = () => {
    const ctx = ctxRef.current
    if (ctx) {
      ctx.close().catch(() => {})
      ctxRef.current = null
    }
    setPlaying(false)
  }

  const handlePlay = () => {
    if (playing) {
      stopPlayback()
      return
    }
    if (!week || !week.hasAny) return
    const ctx = new AudioContext()
    ctxRef.current = ctx
    ctx.resume().catch(() => {})
    scheduleWeek(ctx, week)
    const total = ctx.currentTime + week.duration + 0.5
    stopAtRef.current = total
    setPlaying(true)
    const tick = setInterval(() => {
      if (!ctxRef.current || ctxRef.current.currentTime >= total - 0.15) {
        clearInterval(tick)
        stopPlayback()
      }
    }, 400)
  }

  const handleSave = async () => {
    if (!week || !week.hasAny || saving) return
    setSaving(true)
    setMsg('')
    try {
      const blob = await renderWeekWav(week)
      const file = new File([blob], 'my-week-in-sound.wav', { type: 'audio/wav' })
      const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean }
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: 'My week in sound' })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 4000)
        setMsg('Saved as my-week-in-sound.wav')
      }
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) setMsg('Could not save the piece. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const emptyMsg = week && !week.hasAny

  return (
    <div className="app-page">
      <div className="max-w-3xl mx-auto">
        <header className="mb-7">
          <p className="page-kicker mb-2">Your week as music</p>
          <h1 className="page-title mb-2">Seven days, one small piece</h1>
          <p className="page-subtitle">
            Your last 7 check-ins become a slow ambient piece — the key, brightness and tempo come from your week.
            Quiet days are rests.
          </p>
        </header>

        <div className="card p-6">
          <div className="week-viz mb-6" aria-hidden={playing ? undefined : true}>
            {week?.segments.map((seg) => (
              <span
                key={seg.date}
                className={`week-bar ${seg.mood === null ? 'rest' : ''}`}
                style={{
                  height: `${seg.mood === null ? 10 : 18 + seg.mood * 9}%`,
                  animationPlayState: playing ? 'running' : 'paused',
                  animationDelay: `${seg.start * (0.55 / 6)}s`,
                }}
                title={seg.date}
              />
            ))}
          </div>

          {emptyMsg ? (
            <div>
              <div className="icon-tile w-10 h-10 mb-4"><Music4 size={20} aria-hidden="true" /></div>
              <h2 className="font-semibold text-lg text-[var(--text)] mb-1.5">No check-ins this week yet</h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Once you check in on the Mood page, your week starts becoming music. Days you skip simply become
                quiet rests.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlay}
                  aria-label={playing ? 'Pause the piece' : 'Play the piece'}
                  className="btn-sunset press min-w-[44px] min-h-[44px] w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0"
                >
                  {playing ? <Pause size={22} aria-hidden="true" /> : <Play size={22} aria-hidden="true" className="ml-0.5" />}
                </button>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {playing
                    ? 'Playing your week…'
                    : 'Play your week. A heavy week sounds deeper and slower; a good week lighter and brighter.'}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button onClick={handleSave} disabled={saving} className="btn-ghost press flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] flex-1">
                  {saving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}
                  {saving ? 'Saving…' : 'Save as WAV'}
                </button>
              </div>
              {msg && <p className="text-xs text-[var(--text-muted)]" role="status">{msg}</p>}
            </div>
          )}
        </div>

        {week && week.hasAny && (
          <div className="card p-5">
            <p className="panel-label mb-3">The week at a glance</p>
            <div className="flex justify-between gap-1.5">
              {week.segments.map((seg) => (
                <span key={seg.date} className="flex flex-col items-center gap-1 text-center flex-1">
                  <span className={`week-dot ${seg.mood === null ? 'rest' : ''}`} aria-hidden="true" />
                  <span className="text-[10px] font-medium text-[var(--text-subtle)]">{DAY_LETTERS[new Date(`${seg.date}T12:00:00`).getDay()]}</span>
                  <span className="text-[10px] text-[var(--text-subtle)]">
                    {seg.mood === null ? 'rest' : ['struggling', 'low', 'okay', 'good', 'great'][seg.mood]}
                  </span>
                </span>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-4">
              Made on your phone from your own check-ins — no audio files, nothing sent anywhere.{' '}
              {week.major ? 'This week leans bright; ' : 'This week leans soft and low; '}
              share only if you want to.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}