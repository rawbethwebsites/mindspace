import { useEffect, useState } from 'react'
import LookHero from '../components/LookHero'
import { loadLook, type LookId } from '../lib/theme'
import { AI_ENABLED } from '../lib/ai'
import { Link } from 'react-router-dom'
import { MessageCircle, BookOpen, Heart, Sparkles, Wind, Brain, ArrowRight, Palette } from 'lucide-react'
import { getMoods, getTodayMood, localDay } from '../lib/db'

const moodLabels = ['Struggling', 'Low', 'Okay', 'Good', 'Great']
const moodColors = ['#f0505c', '#f88820', '#f8b830', '#f8a030', '#6ab070']

export default function Home() {
  const [todayMood, setTodayMood] = useState<number | null>(null)
  const [streak, setStreak] = useState(0)
  const [recentMoods, setRecentMoods] = useState<{ date: string; mood: number }[]>([])
  const [allMoods, setAllMoods] = useState<{ date: string; mood: number }[]>([])
  const [look, setLook] = useState<LookId>(loadLook())

  useEffect(() => {
    const on = (e: Event) => setLook((e as CustomEvent<LookId>).detail)
    window.addEventListener('look-change', on)
    return () => window.removeEventListener('look-change', on)
  }, [])

  const loadData = async () => {
    const today = await getTodayMood()
    if (today) setTodayMood(today.mood)

    const allMoods = await getMoods()
    setRecentMoods(allMoods.slice(-7))
    setAllMoods(allMoods.slice(-14))

    let s = 0
    const moodDates = new Set(allMoods.map(m => m.date))
    const d = new Date()
    while (moodDates.has(localDay(d))) {
      s++
      d.setDate(d.getDate() - 1)
    }
    setStreak(s)
  }

  useEffect(() => {
    loadData()
  }, [])

  const exercises = [
    { name: 'Box Breathing', desc: '4-4-4-4 breathing to calm your nervous system', icon: Wind },
    { name: '5-4-3-2-1 Grounding', desc: 'Use your senses to anchor to the present', icon: Brain },
    { name: 'CBT Thought Record', desc: 'Challenge unhelpful thoughts with evidence', icon: Sparkles },
    { name: 'Body Scan', desc: 'Progressive muscle relaxation exercise', icon: Heart },
  ]
  const todayExercise = exercises[new Date().getDay() % exercises.length]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="app-page">
      <div className="max-w-6xl mx-auto">
        <div className="md:hidden flex items-center gap-3 mb-5">
          <img src="/mindspace-icon.png" alt="" aria-hidden="true" className="w-10 h-10 rounded-xl shadow-sm" />
          <div className="flex-1">
            <p className="font-bold text-[var(--text)] leading-tight">Mindspace</p>
            <p className="text-xs text-[var(--text-muted)]">A quiet place for you</p>
          </div>
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-looks'))} aria-label="Change look" className="press min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center border border-[var(--border)] text-[var(--text)]">
            <Palette size={18} aria-hidden="true" />
          </button>
        </div>

        <LookHero look={look} data={{ greeting, todayMood, streak, moods: allMoods, exerciseName: todayExercise.name }} />

        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="page-kicker mb-1.5">Your space</p>
            <h2 className="text-2xl font-bold text-[var(--text)]">What do you need today?</h2>
          </div>
          <Link to="/tools" className="press shrink-0 text-sm font-semibold text-[var(--color-primary)] min-h-[44px] flex items-center gap-1">All tools <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {AI_ENABLED && <Link to="/chat" className="card card-hover p-5 group">
            <div className="icon-tile w-11 h-11 mb-5"><MessageCircle size={21} aria-hidden="true" /></div>
            <h3 className="font-semibold text-lg text-[var(--text)]">Talk it through</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">A gentle, private conversation at your pace.</p>
            <ArrowRight size={18} className="mt-5 text-[var(--color-primary)] transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>}

          <Link to="/journal" className="card card-hover p-5 group">
            <div className="icon-tile w-11 h-11 mb-5 !bg-[rgba(51,108,120,.1)] !border-[rgba(51,108,120,.14)] !text-[var(--color-secondary)]"><BookOpen size={21} aria-hidden="true" /></div>
            <h3 className="font-semibold text-lg text-[var(--text)]">Write freely</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{AI_ENABLED ? 'Journal privately and request a reflection.' : 'Journal privately. Everything stays on your phone.'}</p>
            <ArrowRight size={18} className="mt-5 text-[var(--color-secondary)] transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>

          <Link to="/exercises" className="card card-hover p-5 group">
            <div className="icon-tile w-11 h-11 mb-5 !bg-[rgba(242,189,91,.18)] !border-[rgba(217,153,45,.2)] !text-[#93620f]"><todayExercise.icon size={21} aria-hidden="true" /></div>
            <h3 className="font-semibold text-lg text-[var(--text)]">Reset your body</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Try {todayExercise.name} for a few minutes.</p>
            <ArrowRight size={18} className="mt-5 text-[#93620f] transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        {/* Mood trend + Exercise suggestion */}
        <div className="grid md:grid-cols-2 gap-4">
          {recentMoods.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="panel-label">Recent Mood Trend</h2>
                <Link to="/mood" className="text-xs text-[var(--color-primary)] hover:underline">View all →</Link>
              </div>
              <div className="flex items-end justify-between gap-2 h-24" role="img" aria-label={`Mood trend for last ${recentMoods.length} days: ${recentMoods.map(m => moodLabels[m.mood]).join(', ')}`}>
                {recentMoods.map((m, i) => (
                  <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
                    <div
                      className="bar-grow w-full rounded-t-lg rounded-b-sm"
                      style={{ height: `${14 + (m.mood / 4) * 86}%`, animationDelay: `${i * 40}ms`, background: `linear-gradient(to top, ${moodColors[m.mood]}50, ${moodColors[m.mood]})` }}
                    />
                    <span className="text-xs text-[var(--color-on-surface-muted)]" aria-hidden="true">{new Date(`${m.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card p-5 relative overflow-hidden">
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="icon-tile w-10 h-10">
                  <todayExercise.icon size={20} className="text-[var(--color-primary)]" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-on-surface)]">{todayExercise.name}</h3>
                  <p className="text-sm text-[var(--color-on-surface-muted)]">{todayExercise.desc}</p>
                </div>
              </div>
              <Link to="/exercises" className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-[var(--color-primary)] hover:underline min-h-[44px]">
                Try this exercise <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
