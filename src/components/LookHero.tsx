import { Link, useNavigate } from 'react-router-dom'
import { PenLine, Wind, MessageCircle, ArrowRight } from 'lucide-react'
import type { LookId } from '../lib/theme'
import { AI_ENABLED } from '../lib/ai'
import { getCompanion, loadCompanionId } from '../lib/companions'

const moodLabels = ['Struggling', 'Low', 'Okay', 'Good', 'Great']
const moodWords = ['Heavy.', 'Low.', 'Level.', 'Steady.', 'Bright.']
// Orb colours per mood: cool and dim when low, warm and bright when good
const orbTones: [string, string, string][] = [
  ['#c9d4e6', '#6f7fa6', '#2b3350'],
  ['#e6d2c9', '#a6796f', '#4a2f2b'],
  ['#fff1d6', '#f2bd5b', '#a8611f'],
  ['#fff3dc', '#ef7851', '#b43c1c'],
  ['#fffbe8', '#f6d36b', '#e0702a'],
]

export interface HeroData {
  greeting: string
  todayMood: number | null
  streak: number
  moods: { date: string; mood: number }[]
  exerciseName: string
}

const today = () => new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

export default function LookHero({ look, data }: { look: LookId; data: HeroData }) {
  if (look === 'paper') return <PaperHero data={data} />
  if (look === 'glass') return <GlassHero data={data} />
  if (look === 'signal') return <SignalHero data={data} />
  return <LivingHero data={data} />
}

/* A · Living Light: the orb is the check-in */
function LivingHero({ data }: { data: HeroData }) {
  const navigate = useNavigate()
  const tone = orbTones[data.todayMood ?? 3]
  const talk = AI_ENABLED ? getCompanion(loadCompanionId()).name : null
  return (
    <section className="living-hero">
      <p className="living-date">{today().toUpperCase()}</p>
      <button className="living-orb" onClick={() => navigate('/mood')} aria-label="Check in with yourself">
        <span className="halo" /><span className="ring" />
        <span className="core" style={{ background: `radial-gradient(circle at 38% 32%, ${tone[0]} 0%, ${tone[1]} 45%, ${tone[2]} 100%)`, boxShadow: `0 0 70px ${tone[1]}88, inset -18px -24px 50px rgba(0,0,0,.35)` }} />
      </button>
      <h1 className="living-title">{data.todayMood === null ? 'How are you today?' : `${data.greeting}.`}</h1>
      <p className="living-hint">{data.todayMood === null ? 'Touch the light to check in' : `Feeling ${moodLabels[data.todayMood].toLowerCase()} today`}</p>
      <div className="living-dots" aria-label={`${data.streak} day streak`}>
        {Array.from({ length: 14 }, (_, i) => <i key={i} className={i < Math.min(data.streak, 14) ? 'on' : ''} />)}
      </div>
      <div className="living-acts">
        <Link to="/journal" className="press"><PenLine size={16} aria-hidden="true" />Write</Link>
        <Link to="/exercises" className="press"><Wind size={16} aria-hidden="true" />Breathe</Link>
        {talk && <Link to="/chat" className="press"><MessageCircle size={16} aria-hidden="true" />{talk}</Link>}
      </div>
    </section>
  )
}

/* B · Horizon Paper: the sun sits where the day is */
function PaperHero({ data }: { data: HeroData }) {
  const h = new Date().getHours() + new Date().getMinutes() / 60
  const pos = Math.min(100, Math.max(0, ((h - 6) / 12) * 100))
  const talk = AI_ENABLED ? `Talk to ${getCompanion(loadCompanionId()).name}` : null
  const rows: [string, string][] = [['Check in with yourself', '/mood'], ['Write it out', '/journal'], [`Practice: ${data.exerciseName}`, '/exercises'], ...(talk ? [[talk, '/chat'] as [string, string]] : [])]
  return (
    <section className="paper-hero">
      <p className="paper-date">{today()}</p>
      <h1 className="paper-title">{data.greeting}<em>.</em></h1>
      <div className="paper-sky" aria-hidden="true">
        <span className="paper-sun" style={{ left: `calc(${pos}% - 32px)` }} />
        <span className="paper-line" />
        <span className="paper-tick" style={{ left: 0 }}>06:00</span><span className="paper-tick" style={{ left: '50%', transform: 'translateX(-50%)' }}>12:00</span><span className="paper-tick" style={{ right: 0 }}>18:00</span>
      </div>
      <ul className="paper-list">
        {rows.map(([label, to]) => <li key={to}><Link to={to} className="press">{label}<ArrowRight size={18} aria-hidden="true" /></Link></li>)}
      </ul>
      <p className="paper-streak">{data.streak} {data.streak === 1 ? 'DAY' : 'DAYS'} IN A ROW</p>
    </section>
  )
}

/* C · Glass Depth: a dial to check in */
function GlassHero({ data }: { data: HeroData }) {
  const navigate = useNavigate()
  const c = getCompanion(loadCompanionId())
  const pts = [[8, 118], [40, 42], [125, 8], [210, 42], [242, 118]]
  return (
    <section className="glass-hero">
      <div className="card glass-top"><small>{today().toUpperCase()}</small><b>{data.greeting}</b></div>
      <div className="card glass-dial">
        <div className="glass-arc">
          <svg viewBox="0 0 250 125" aria-hidden="true"><path d="M8 118 A117 117 0 0 1 242 118" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" /></svg>
          {pts.map(([x, y], i) => (
            <button key={i} onClick={() => navigate('/mood')} aria-label={`Check in: ${moodLabels[i]}`} className={`glass-pt ${data.todayMood === i ? 'on' : ''}`} style={{ left: x, top: y }} />
          ))}
        </div>
        <b>{data.todayMood === null ? 'How are you?' : `Feeling ${moodLabels[data.todayMood].toLowerCase()}`}</b>
        <small>Tap the arc to check in</small>
      </div>
      <div className="glass-tiles">
        <Link to="/exercises" className="card press"><Wind size={22} aria-hidden="true" /><b>Breathe</b><small>{data.exerciseName}</small></Link>
        <Link to="/journal" className="card press"><PenLine size={22} aria-hidden="true" /><b>Write freely</b><small>Stays on your phone</small></Link>
      </div>
      {AI_ENABLED && (
        <Link to="/chat" className="card press glass-comp">
          <span className="glass-av" style={{ background: `radial-gradient(circle at 35% 30%, #fff1d6, ${c.colors[1]} 40%, ${c.colors[0]})` }} />
          <span><b>{c.name}</b><small>{c.tagline} · Talk now</small></span>
        </Link>
      )}
    </section>
  )
}

/* D · Signal: mood drawn as contour lines from the last 14 check-ins */
function SignalHero({ data }: { data: HeroData }) {
  const series = data.moods.slice(-14)
  const W = 350, H = 240
  const vals = series.length ? series.map((m) => m.mood) : [2, 2]
  const step = W / Math.max(vals.length - 1, 1)
  const ridgeY = (v: number) => 150 - v * 26
  const path = (off: number, amp: number) => {
    const p = vals.map((v, i) => [i * step, ridgeY(v) * amp + off] as const)
    return p.reduce((d, [x, y], i) => {
      if (i === 0) return `M${x} ${y}`
      const [px, py] = p[i - 1]
      const cx = (px + x) / 2
      return `${d} C${cx} ${py} ${cx} ${y} ${x} ${y}`
    }, '')
  }
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length / 4
  const last = vals[vals.length - 1]
  const word = data.todayMood === null ? 'Waiting.' : moodWords[data.todayMood]
  return (
    <section className="signal-hero">
      <div className="signal-head"><span className="mono">N 06.52°</span><span className="mono">{new Date().toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: '2-digit' }).toUpperCase()}</span></div>
      <h1 className="signal-title">{word}</h1>
      <p className="mono">MOOD INDEX {avg.toFixed(2)} · {vals.length}D</p>
      <div className="signal-topo">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-label={`Mood over the last ${vals.length} days`}>
          {[-48, -24, 24, 48, 72].map((o, i) => <path key={i} d={path(o, 1)} style={{ animationDelay: `${i * 90}ms` }} />)}
          <path className="ridge" d={path(0, 1)} />
        </svg>
        <i className="signal-now" style={{ left: `calc(${((vals.length - 1) * step / W) * 100}% - 5px)`, top: `${(ridgeY(last) / H) * 100}%` }} />
      </div>
      <div className="signal-stats">
        <div className="mono">STREAK<b>{data.streak} D</b></div>
        <div className="mono">NEXT<b>{data.exerciseName.split(' ')[0].toUpperCase()}</b></div>
      </div>
      <div className="signal-btns">
        <Link to="/mood" className="press pri">CHECK IN <span>→</span></Link>
        <Link to="/exercises" className="press">BREATHE <span>→</span></Link>
        <Link to="/journal" className="press">WRITE <span>→</span></Link>
        {AI_ENABLED && <Link to="/chat" className="press">TALK <span>→</span></Link>}
      </div>
    </section>
  )
}
