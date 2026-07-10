import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { getMoods, saveMood, getTodayMood } from '../lib/db'

const moodEmojis = ['😢', '😕', '😐', '🙂', '😊']
const moodLabels = ['Struggling', 'Low', 'Okay', 'Good', 'Great']
const moodColors = ['#c44', '#e88', '#aa9', '#7a9', '#5a7']

export default function Mood() {
  const [selected, setSelected] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [moods, setMoods] = useState<{ date: string; mood: number; note?: string }[]>([])
  const [todaySet, setTodaySet] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const today = await getTodayMood()
    if (today) {
      setSelected(today.mood)
      setNote(today.note || '')
      setTodaySet(true)
    }
    const all = await getMoods()
    setMoods(all)
  }

  const handleSave = async () => {
    if (selected === null) return
    await saveMood(selected, note.trim() || undefined)
    setSaved(true)
    setTodaySet(true)
    setTimeout(() => setSaved(false), 2000)
    loadData()
  }

  const streak = (() => {
    let s = 0
    const today = new Date().toISOString().split('T')[0]
    const dates = new Set(moods.map(m => m.date))
    let d = new Date(today)
    while (dates.has(d.toISOString().split('T')[0])) {
      s++
      d.setDate(d.getDate() - 1)
    }
    return s
  })()

  return (
    <div className="min-h-screen pb-12 px-6 md:px-12 pt-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">How are you feeling?</h1>
          <p className="text-sm text-[#6B6B6B]">Take a moment to check in with yourself. No judgment, just honesty.</p>
        </div>

        {/* Mood picker */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8E0D0] mb-6">
          <div className="flex justify-between gap-2 mb-6">
            {moodEmojis.map((emoji, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl transition-all ${
                  selected === i
                    ? 'bg-[#8BA889]/15 scale-105'
                    : 'hover:bg-[#8BA889]/8'
                }`}
              >
                <span className="text-4xl">{emoji}</span>
                <span className={`text-xs font-medium ${selected === i ? 'text-[#5F7A5E]' : 'text-[#6B6B6B]'}`}>{moodLabels[i]}</span>
              </button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's behind this feeling? (optional)"
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-[#F5F1EA] border border-[#E8E0D0] text-sm text-[#2C2C2C] placeholder:text-[#6B6B6B]/50 focus:outline-none focus:border-[#8BA889] transition-colors resize-none mb-4"
          />

          <button
            onClick={handleSave}
            disabled={selected === null}
            className="w-full py-3 rounded-xl bg-[#8BA889] text-white font-medium hover:bg-[#5F7A5E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saved ? '✓ Saved' : todaySet ? 'Update check-in' : 'Save check-in'}
          </button>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-[#8BA889]/10 to-[#A8C5D6]/10 rounded-xl">
          <TrendingUp size={20} className="text-[#5F7A5E]" />
          <span className="text-sm font-medium text-[#2C2C2C]">
            {streak > 0 ? `${streak}-day streak — keep it up! 🔥` : 'Check in daily to build your streak'}
          </span>
        </div>

        {/* History */}
        {moods.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0D0]">
            <h2 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wide mb-4">Mood History</h2>

            {/* Chart */}
            <div className="flex items-end justify-between gap-1 h-32 mb-6">
              {moods.slice(-14).map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full rounded-t-lg transition-all hover:opacity-80"
                    style={{
                      height: `${(m.mood / 4) * 100}%`,
                      backgroundColor: moodColors[m.mood],
                    }}
                  />
                  <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 whitespace-nowrap bg-[#2C2C2C] text-white text-[10px] px-2 py-1 rounded">
                    {moodLabels[m.mood]} · {m.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>

            {/* List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...moods].reverse().map((m, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-[#E8E0D0]/50 last:border-0">
                  <span className="text-2xl">{moodEmojis[m.mood]}</span>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-[#2C2C2C]">{moodLabels[m.mood]}</span>
                    {m.note && <p className="text-xs text-[#6B6B6B] mt-0.5">{m.note}</p>}
                  </div>
                  <span className="text-xs text-[#6B6B6B]">{m.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}