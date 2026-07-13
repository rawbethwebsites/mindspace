import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, BookOpen, Heart, TrendingUp, Sparkles, Wind, Brain, Calendar, ArrowRight } from 'lucide-react'
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

  return (
    <div className="min-h-screen pb-12 px-6 md:px-10 pt-8" style={{ background: 'var(--gradient-warm-glow)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Greeting */}
        <div className="mb-8 fade-in">
          <p className="text-sm text-[var(--color-on-surface-muted)] mb-1.5 flex items-center gap-1.5">
            <Calendar size={14} aria-hidden="true" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-on-surface)] tracking-tight">Welcome back to <span className="text-sunset">Mindspace</span></h1>
        </div>

        {/* Stats grid — 3 cards with strong contrast */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Today's Mood */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center">
                <Heart size={18} className="text-[var(--color-primary)]" aria-hidden="true" />
              </div>
              <span className="text-xs font-medium text-[var(--color-on-surface-muted)] uppercase tracking-wide">Today's Mood</span>
            </div>
            {todayMood !== null ? (
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-[var(--color-on-surface)]">{moodLabels[todayMood]}</div>
                <div className="w-3 h-3 rounded-full" style={{ background: moodColors[todayMood] }} aria-hidden="true" />
              </div>
            ) : (
              <Link to="/mood" className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1">
                Check in <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {/* Streak */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center">
                <TrendingUp size={18} className="text-[var(--color-primary)]" aria-hidden="true" />
              </div>
              <span className="text-xs font-medium text-[var(--color-on-surface-muted)] uppercase tracking-wide">Streak</span>
            </div>
            <div className="text-3xl font-bold text-[var(--color-primary)]">{streak} <span className="text-sm font-normal text-[var(--color-on-surface-muted)]">days</span></div>
          </div>

          {/* Suggested */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/20 flex items-center justify-center">
                <Sparkles size={18} className="text-[var(--color-primary)]" aria-hidden="true" />
              </div>
              <span className="text-xs font-medium text-[var(--color-on-surface-muted)] uppercase tracking-wide">Suggested</span>
            </div>
            <Link to="/exercises" className="text-sm text-[var(--color-primary)] font-medium hover:underline flex items-center gap-1">
              {todayExercise.name} <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Primary action — Start a conversation (large gradient card) */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Link
            to="/chat"
            className="md:col-span-2 rounded-2xl p-6 relative overflow-hidden group min-h-[44px] transition-all hover:scale-[1.01]"
            style={{ background: 'var(--gradient-sunset)' }}
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" aria-hidden="true" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <MessageCircle size={24} className="text-white" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-xl text-white mb-1.5">Start a conversation</h3>
              <p className="text-sm text-white/85">Talk through what's on your mind with AI support</p>
            </div>
          </Link>

          <Link
            to="/journal"
            className="card card-hover p-6 group min-h-[44px]"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-light)] flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-[var(--color-secondary)]" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-lg text-[var(--color-on-surface)] mb-1.5">Write in journal</h3>
            <p className="text-sm text-[var(--color-on-surface-muted)]">Reflect and get an AI reflection</p>
          </Link>
        </div>

        {/* Mood trend + Exercise suggestion */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Mood trend mini chart */}
          {recentMoods.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-[var(--color-on-surface-muted)] uppercase tracking-wide">Recent Mood Trend</h2>
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

          {/* Exercise suggestion */}
          <div className="card p-5 relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'var(--gradient-sunset-soft)' }} aria-hidden="true" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/20 flex items-center justify-center">
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