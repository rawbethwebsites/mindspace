import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, BookOpen, Heart, TrendingUp, Sparkles, Wind, Brain, Smile, Calendar } from 'lucide-react'
import { getMoods, getTodayMood } from '../lib/db'

const moodIcons = [Heart, Heart, Heart, Heart, Heart] // will use color + label for differentiation
const moodLabels = ['Struggling', 'Low', 'Okay', 'Good', 'Great']
const moodColors = ['#c44', '#e88', '#aa9', '#7a9', '#5a7']

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
    <div className="min-h-screen pb-12 px-6 md:px-12 pt-8">
      <div className="max-w-4xl mx-auto">
        {/* Greeting */}
        <div className="mb-8 fade-in">
          <p className="text-sm text-[var(--color-on-surface-muted)] mb-1 flex items-center gap-1.5">
            <Calendar size={14} aria-hidden="true" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-bold text-[var(--color-on-surface)]">Welcome back to Mindspace</h1>
        </div>

        {/* Quick stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-2">
              <Heart size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
              <span className="text-xs font-medium text-[var(--color-on-surface-muted)] uppercase tracking-wide">Today&apos;s Mood</span>
            </div>
            {todayMood !== null ? (
              <div className="text-2xl font-bold text-[var(--color-on-surface)]">{moodLabels[todayMood]}</div>
            ) : (
              <Link to="/mood" className="text-sm text-[var(--color-secondary)] hover:underline">Check in →</Link>
            )}
          </div>

          <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
              <span className="text-xs font-medium text-[var(--color-on-surface-muted)] uppercase tracking-wide">Streak</span>
            </div>
            <div className="text-3xl font-bold text-[var(--color-on-surface)]">{streak} <span className="text-sm font-normal text-[var(--color-on-surface-muted)]">days</span></div>
          </div>

          <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
              <span className="text-xs font-medium text-[var(--color-on-surface-muted)] uppercase tracking-wide">Suggested</span>
            </div>
            <Link to="/exercises" className="text-sm text-[var(--color-primary-dark)] font-medium hover:underline">{todayExercise.name} →</Link>
          </div>
        </div>

        {/* Quick actions */}
        <h2 className="text-sm font-semibold text-[var(--color-on-surface-muted)] uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/chat"
            className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-2xl p-6 text-white hover:scale-[1.01] transition-transform min-h-[44px]"
          >
            <MessageCircle size={24} className="mb-3" aria-hidden="true" />
            <h3 className="font-semibold text-lg mb-1">Start a conversation</h3>
            <p className="text-sm text-white/80">Talk through what&apos;s on your mind with AI support</p>
          </Link>
          <Link
            to="/journal"
            className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 transition-colors min-h-[44px]"
          >
            <BookOpen size={24} className="mb-3 text-[var(--color-secondary)]" aria-hidden="true" />
            <h3 className="font-semibold text-lg mb-1 text-[var(--color-on-surface)]">Write in journal</h3>
            <p className="text-sm text-[var(--color-on-surface-muted)]">Reflect and get an AI reflection on your entry</p>
          </Link>
        </div>

        {/* Mood trend mini chart */}
        {recentMoods.length > 0 && (
          <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)] mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--color-on-surface-muted)] uppercase tracking-wide">Recent Mood Trend</h2>
              <Link to="/mood" className="text-xs text-[var(--color-secondary)] hover:underline">View all →</Link>
            </div>
            {/* Accessible chart with text alternative */}
            <div className="flex items-end justify-between gap-2 h-24" role="img" aria-label={`Mood trend for last ${recentMoods.length} days: ${recentMoods.map(m => moodLabels[m.mood]).join(', ')}`}>
              {recentMoods.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[var(--color-primary)]/40 to-[var(--color-primary)]"
                    style={{ height: `${(m.mood / 4) * 100}%` }}
                  />
                  <span className="text-xs text-[var(--color-on-surface-muted)]">{moodLabels[m.mood].slice(0, 1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercise suggestion */}
        <div className="bg-gradient-to-br from-[var(--color-secondary)]/15 to-[var(--color-primary)]/12 rounded-2xl p-5 border border-[var(--color-secondary)]/25">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/15 flex items-center justify-center">
              <todayExercise.icon size={20} className="text-[var(--color-primary-dark)]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-on-surface)]">{todayExercise.name}</h3>
              <p className="text-sm text-[var(--color-on-surface-muted)]">{todayExercise.desc}</p>
            </div>
          </div>
          <Link to="/exercises" className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-[var(--color-primary-dark)] hover:underline min-h-[44px]">
            Try this exercise →
          </Link>
        </div>
      </div>
    </div>
  )
}