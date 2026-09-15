import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, BookOpen, Heart, Sparkles, Wind, Brain, Calendar, ArrowRight } from 'lucide-react'
import { getMoods, getTodayMood } from '../lib/db'

const moodLabels = ['Struggling', 'Low', 'Okay', 'Good', 'Great']
const moodColors = ['#f0505c', '#f88820', '#f8b830', '#f8a030', '#6ab070']

export default function Home() {
  const [todayMood, setTodayMood] = useState<number | null>(null)
  const [streak, setStreak] = useState(0)
  const [recentMoods, setRecentMoods] = useState<{ date: string; mood: number }[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const today = await getTodayMood()
    if (today) setTodayMood(today.mood)

    const allMoods = await getMoods()
    setRecentMoods(allMoods.slice(-7))

    let s = 0
    const today_str = new Date().toISOString().split('T')[0]
    const moodDates = new Set(allMoods.map(m => m.date))
    let d = new Date(today_str)
    while (moodDates.has(d.toISOString().split('T')[0])) {
      s++
      d.setDate(d.getDate() - 1)
    }
    setStreak(s)
  }

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
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-deep)] flex items-center justify-center p-2" aria-hidden="true">
            <img src="/tbn-mark-white.png" alt="" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="font-bold text-[var(--text)] leading-tight">Mindspace</p>
            <p className="text-xs text-[var(--text-muted)]">A quiet place for you</p>
          </div>
        </div>

        <section className="relative min-h-[440px] md:min-h-[470px] rounded-[24px] overflow-hidden shadow-[var(--shadow-elevated)] fade-in mb-8">
          <img src="/mindspace-sunrise.jpg" alt="Sunrise over a quiet valley and winding river" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,245,223,0.92)_0%,rgba(255,245,223,0.58)_42%,rgba(17,25,35,0.12)_72%,rgba(17,25,35,0.65)_100%)] md:bg-[linear-gradient(90deg,rgba(255,245,223,0.94)_0%,rgba(255,245,223,0.62)_42%,rgba(255,245,223,0.08)_70%)]" aria-hidden="true" />

          <div className="relative z-10 flex min-h-[440px] md:min-h-[470px] flex-col p-6 md:p-10">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-primary)] mb-3">
              <Calendar size={14} aria-hidden="true" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="max-w-xl text-[2.2rem] md:text-5xl font-bold leading-[1.04] text-[var(--bg-deep)]">{greeting}.</h1>
            <p className="mt-3 max-w-md text-sm md:text-base text-[#3f4a52]">Take one small moment for yourself. Check in, write it out, or talk through what is on your mind.</p>

            <Link to="/chat" className="mt-6 btn-sunset inline-flex w-fit items-center justify-center gap-2 px-5 py-3 text-sm">
              <MessageCircle size={17} aria-hidden="true" />
              Start a conversation
            </Link>

            <div className="mt-auto grid grid-cols-3 overflow-hidden rounded-2xl border border-white/35 bg-[rgba(17,25,35,0.82)] text-white backdrop-blur-md">
              <Link to="/mood" className="min-w-0 px-3 py-3.5 md:px-5 border-r border-white/10 hover:bg-white/8 transition-colors">
                <span className="block text-[10px] uppercase font-bold tracking-[0.07em] text-white/55">Mood</span>
                <span className="mt-1 block truncate text-sm font-semibold">{todayMood !== null ? moodLabels[todayMood] : 'Check in'}</span>
              </Link>
              <div className="min-w-0 px-3 py-3.5 md:px-5 border-r border-white/10">
                <span className="block text-[10px] uppercase font-bold tracking-[0.07em] text-white/55">Streak</span>
                <span className="mt-1 block text-sm font-semibold">{streak} {streak === 1 ? 'day' : 'days'}</span>
              </div>
              <Link to="/exercises" className="min-w-0 px-3 py-3.5 md:px-5 hover:bg-white/8 transition-colors">
                <span className="block text-[10px] uppercase font-bold tracking-[0.07em] text-white/55">For today</span>
                <span className="mt-1 block truncate text-sm font-semibold">{todayExercise.name}</span>
              </Link>
            </div>
          </div>
        </section>

        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="page-kicker mb-1.5">Your space</p>
            <h2 className="text-2xl font-bold text-[var(--text)]">What do you need today?</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link to="/chat" className="card card-hover p-5 group">
            <div className="icon-tile w-11 h-11 mb-5"><MessageCircle size={21} aria-hidden="true" /></div>
            <h3 className="font-semibold text-lg text-[var(--text)]">Talk it through</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">A gentle, private conversation at your pace.</p>
            <ArrowRight size={18} className="mt-5 text-[var(--color-primary)] transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>

          <Link to="/journal" className="card card-hover p-5 group">
            <div className="icon-tile w-11 h-11 mb-5 !bg-[rgba(51,108,120,.1)] !border-[rgba(51,108,120,.14)] !text-[var(--color-secondary)]"><BookOpen size={21} aria-hidden="true" /></div>
            <h3 className="font-semibold text-lg text-[var(--text)]">Write freely</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Journal privately and request a reflection.</p>
            <ArrowRight size={18} className="mt-5 text-[var(--color-secondary)] transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>

          <Link to="/exercises" className="card card-hover p-5 group">
            <div className="icon-tile w-11 h-11 mb-5 !bg-[rgba(242,189,91,.18)] !border-[rgba(217,153,45,.2)] !text-[#93620f]"><todayExercise.icon size={21} aria-hidden="true" /></div>
            <h3 className="font-semibold text-lg text-[var(--text)]">Reset your body</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Try {todayExercise.name.toLowerCase()} for a few minutes.</p>
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
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-lg"
                      style={{ height: `${(m.mood / 4) * 100}%`, background: `linear-gradient(to top, ${moodColors[m.mood]}50, ${moodColors[m.mood]})` }}
                    />
                    <span className="text-xs text-[var(--color-on-surface-muted)]">{moodLabels[m.mood].slice(0, 1)}</span>
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
