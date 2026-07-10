import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, BookOpen, Heart, Wind, TrendingUp, Sparkles } from 'lucide-react'
import { getMoods, getTodayMood } from '../lib/db'

const moodEmojis = ['😢', '😕', '😐', '🙂', '😊']
const moodLabels = ['Struggling', 'Low', 'Okay', 'Good', 'Great']

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

    // Calculate streak
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
    { name: 'Box Breathing', desc: '4-4-4-4 breathing to calm your nervous system', icon: '🫁' },
    { name: '5-4-3-2-1 Grounding', desc: 'Use your senses to anchor to the present', icon: '🌳' },
    { name: 'CBT Thought Record', desc: 'Challenge unhelpful thoughts with evidence', icon: '🧠' },
    { name: 'Body Scan', desc: 'Progressive muscle relaxation exercise', icon: '💆' },
  ]
  const todayExercise = exercises[new Date().getDay() % exercises.length]

  return (
    <div className="min-h-screen pb-12 px-6 md:px-12 pt-8">
      <div className="max-w-4xl mx-auto">
        {/* Greeting */}
        <div className="mb-8 fade-in">
          <p className="text-sm text-[#6B6B6B] mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1 className="text-3xl font-bold text-[#2C2C2C]">Welcome back to Mindspace</h1>
        </div>

        {/* Quick stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-[#E8E0D0]">
            <div className="flex items-center gap-2 mb-2">
              <Heart size={16} className="text-[#8BA889]" />
              <span className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">Today's Mood</span>
            </div>
            {todayMood !== null ? (
              <div className="text-3xl mb-1">{moodEmojis[todayMood]}</div>
            ) : (
              <Link to="/mood" className="text-sm text-[#6B9BB5] hover:underline">Check in →</Link>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8E0D0]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-[#8BA889]" />
              <span className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">Streak</span>
            </div>
            <div className="text-3xl font-bold text-[#2C2C2C]">{streak} <span className="text-sm font-normal text-[#6B6B6B]">days</span></div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8E0D0]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-[#8BA889]" />
              <span className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">Suggested</span>
            </div>
            <Link to="/exercises" className="text-sm text-[#5F7A5E] font-medium hover:underline">{todayExercise.name} →</Link>
          </div>
        </div>

        {/* Quick actions */}
        <h2 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link to="/chat" className="bg-gradient-to-br from-[#8BA889] to-[#5F7A5E] rounded-2xl p-6 text-white hover:scale-[1.02] transition-transform">
            <MessageCircle size={24} className="mb-3" />
            <h3 className="font-semibold text-lg mb-1">Start a conversation</h3>
            <p className="text-sm text-white/80">Talk through what's on your mind with AI support</p>
          </Link>
          <Link to="/journal" className="bg-white rounded-2xl p-6 border border-[#E8E0D0] hover:border-[#8BA889]/40 transition-colors">
            <BookOpen size={24} className="mb-3 text-[#6B9BB5]" />
            <h3 className="font-semibold text-lg mb-1 text-[#2C2C2C]">Write in journal</h3>
            <p className="text-sm text-[#6B6B6B]">Reflect and get an AI reflection on your entry</p>
          </Link>
        </div>

        {/* Mood trend mini chart */}
        {recentMoods.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-[#E8E0D0] mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wide">Recent Mood Trend</h2>
              <Link to="/mood" className="text-xs text-[#6B9BB5] hover:underline">View all →</Link>
            </div>
            <div className="flex items-end justify-between gap-2 h-24">
              {recentMoods.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#8BA889]/40 to-[#8BA889]"
                    style={{ height: `${(m.mood / 4) * 100}%` }}
                  />
                  <span className="text-xs">{moodEmojis[m.mood]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercise suggestion */}
        <div className="bg-gradient-to-br from-[#A8C5D6]/20 to-[#8BA889]/15 rounded-2xl p-5 border border-[#A8C5D6]/30">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{todayExercise.icon}</span>
            <div>
              <h3 className="font-semibold text-[#2C2C2C]">{todayExercise.name}</h3>
              <p className="text-sm text-[#6B6B6B]">{todayExercise.desc}</p>
            </div>
          </div>
          <Link to="/exercises" className="inline-block mt-2 text-sm font-medium text-[#5F7A5E] hover:underline">
            Try this exercise →
          </Link>
        </div>
      </div>
    </div>
  )
}