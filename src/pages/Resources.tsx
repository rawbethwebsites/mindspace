import {
  Phone, MessageSquare, Globe, Heart, Search, BookOpen,
  AlertTriangle, Clock, Shield, ArrowUpRight, Check,
  Brain, Sparkles, Users, Stethoscope, Video, Eye,
} from 'lucide-react'
import { crisisResources } from '../lib/crisis'

// ─────────────────────────────────────────────
// Content data (preserved from original)
// ─────────────────────────────────────────────
const professionalHelpSigns = [
  'Feelings of sadness, anxiety, or worry that persist for weeks',
  'Difficulty performing daily activities (work, school, relationships)',
  'Changes in sleep, appetite, or energy levels',
  'Thoughts of self-harm or suicide',
  'Substance use as a coping mechanism',
  'Feeling stuck or unable to resolve issues on your own',
  'Experiencing trauma or loss that feels overwhelming',
]

const therapyTypes = [
  { name: 'Cognitive Behavioral Therapy', abbr: 'CBT', desc: 'Identifies and changes unhelpful thought patterns and behaviors.', icon: Brain, color: '#F88F22' },
  { name: 'Dialectical Behavior Therapy', abbr: 'DBT', desc: 'Focuses on emotional regulation, distress tolerance, and mindfulness.', icon: Heart, color: '#EA6113' },
  { name: 'Psychodynamic Therapy', abbr: 'PSY', desc: 'Explores how past experiences and the unconscious mind affect present behavior.', icon: Sparkles, color: '#FBB931' },
  { name: 'Humanistic Therapy', abbr: 'HUM', desc: 'Focuses on self-actualization, personal growth, and self-exploration.', icon: Users, color: '#FFE3B3' },
  { name: 'EMDR', abbr: 'EMDR', desc: 'Helps process traumatic memories using eye movement desensitization.', icon: Eye, color: '#F88F22' },
  { name: 'Interpersonal Therapy', abbr: 'IPT', desc: 'Focuses on relationships and communication patterns.', icon: MessageSquare, color: '#EA6113' },
]

const therapistDirectories = [
  { name: 'Psychology Today', url: 'https://www.psychologytoday.com', desc: 'Largest therapist directory', tags: ['Directory', 'Licensed'], icon: Search },
  { name: 'BetterHelp', url: 'https://www.betterhelp.com', desc: 'Online therapy platform', tags: ['Online', 'Licensed'], icon: Video },
  { name: 'Talkspace', url: 'https://www.talkspace.com', desc: 'Online therapy with licensed therapists', tags: ['Online', 'Licensed'], icon: MessageSquare },
  { name: 'Open Path Collective', url: 'https://openpathcollective.org', desc: 'Affordable therapy ($30–$80/session)', tags: ['Affordable', 'Directory'], icon: Heart },
]

// ─────────────────────────────────────────────
// Helper: availability badge for crisis resources
// ─────────────────────────────────────────────
function getCrisisBadge(r: typeof crisisResources[0]) {
  if (r.description.includes('24/7')) return { label: '24/7', className: 'pill-error' }
  if (r.regions.includes('Global')) return { label: 'Global', className: 'pill-gold' }
  return { label: r.regions.join(', '), className: 'pill-cream' }
}

// ─────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────

function StatCard({ icon: Icon, value, label, accent }: {
  icon: React.ElementType; value: string; label: string; accent: string
}) {
  return (
    <div className="glass p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
        <Icon size={18} style={{ color: accent }} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-bold text-[var(--text)] leading-tight">{value}</div>
        <div className="text-xs text-[var(--text-muted)] truncate">{label}</div>
      </div>
    </div>
  )
}

function CrisisCard({ r, priority }: { r: typeof crisisResources[0]; priority: boolean }) {
  const badge = getCrisisBadge(r)
  return (
    <div className={`glass p-5 flex flex-col gap-3 ${priority ? 'border-[rgba(240,80,92,0.2)]' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-[var(--text)] text-sm leading-snug">{r.name}</h3>
        <span className={`pill ${badge.className} shrink-0`}>{badge.label}</span>
      </div>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{r.description}</p>
      <div className="flex flex-wrap gap-2 mt-auto pt-1">
        {r.phone && (
          <a href={`tel:${r.phone}`} className="btn-sunset flex items-center gap-1.5 px-3 py-2 text-xs min-h-[36px]" aria-label={`Call ${r.name} at ${r.phone}`}>
            <Phone size={13} aria-hidden="true" /> {r.phone}
          </a>
        )}
        {r.text && (
          <span className="btn-ghost flex items-center gap-1.5 px-3 py-2 text-xs min-h-[36px]">
            <MessageSquare size={13} aria-hidden="true" /> {r.text}
          </span>
        )}
        {r.url && (
          <a href={r.url} target="_blank" rel="noreferrer" className="btn-ghost flex items-center gap-1.5 px-3 py-2 text-xs min-h-[36px]" aria-label={`Visit ${r.name} website`}>
            <Globe size={13} aria-hidden="true" /> Website <ArrowUpRight size={11} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  )
}

function TherapyTypeCard({ t }: { t: typeof therapyTypes[0] }) {
  return (
    <div className="glass-2 p-4 hover:border-[var(--border-bright)] transition-colors">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
             style={{ background: `${t.color}12`, border: `1px solid ${t.color}20` }}>
          <t.icon size={16} style={{ color: t.color }} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-semibold text-[var(--text)] leading-tight">{t.name}</h4>
          <span className="text-[10px] font-medium text-[var(--text-subtle)]">{t.abbr}</span>
        </div>
      </div>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{t.desc}</p>
    </div>
  )
}

function TherapistCard({ s }: { s: typeof therapistDirectories[0] }) {
  return (
    <a href={s.url} target="_blank" rel="noreferrer"
       className="glass-2 p-4 flex flex-col gap-3 hover:border-[var(--border-bright)] transition-all hover:-translate-y-0.5 group min-h-[44px]"
       aria-label={`Visit ${s.name}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[rgba(248,143,34,0.1)] border border-[rgba(248,143,34,0.15)] flex items-center justify-center shrink-0">
            <s.icon size={16} className="text-[var(--accent-2)]" aria-hidden="true" />
          </div>
          <h4 className="text-sm font-semibold text-[var(--text)]">{s.name}</h4>
        </div>
        <ArrowUpRight size={15} className="text-[var(--text-subtle)] group-hover:text-[var(--accent-2)] transition-colors" aria-hidden="true" />
      </div>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{s.desc}</p>
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {s.tags.map(tag => (
          <span key={tag} className="pill pill-cream">{tag}</span>
        ))}
      </div>
    </a>
  )
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function Resources() {
  // Sort: 24/7 crisis first, then others
  const sortedCrisis = [...crisisResources].sort((a, b) => {
    const aPriority = a.description.includes('24/7') ? 0 : 1
    const bPriority = b.description.includes('24/7') ? 0 : 1
    return aPriority - bPriority
  })

  return (
    <div className="min-h-screen pb-12 px-5 md:px-8 pt-7 glow-bg">
      <div className="max-w-6xl mx-auto">

        {/* ═══ Hero ═══ */}
        <div className="mb-6 fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-1)] to-[var(--accent-3)] flex items-center justify-center glow-soft">
              <Shield size={16} className="text-white" aria-hidden="true" />
            </div>
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Support Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] tracking-tight mb-1">Resources</h1>
          <p className="text-sm text-[var(--text-muted)]">Crisis support, professional guidance, and therapy resources — all in one place.</p>
        </div>

        {/* ═══ Stat Cards ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Clock} value="24/7" label="Crisis Support" accent="#EA6113" />
          <StatCard icon={AlertTriangle} value="5" label="Crisis Lines" accent="#F88F22" />
          <StatCard icon={BookOpen} value="6" label="Therapy Guides" accent="#FBB931" />
          <StatCard icon={Search} value="4" label="Therapist Directories" accent="#FFE3B3" />
        </div>

        {/* ═══ Crisis Support — strongest visual anchor ═══ */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[rgba(240,80,92,0.12)] border border-[rgba(240,80,92,0.18)] flex items-center justify-center">
              <AlertTriangle size={18} className="text-[var(--color-error)]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text)]">Crisis Support — Available Now</h2>
              <p className="text-xs text-[var(--text-muted)]">Free and confidential. If you're in crisis, reach out immediately.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedCrisis.map((r) => (
              <CrisisCard key={r.name} r={r} priority={r.description.includes('24/7')} />
            ))}
          </div>

          {/* Emergency notice strip */}
          <div className="mt-3 glass-2 p-3 flex items-center gap-3 border-[rgba(240,80,92,0.15)]">
            <Phone size={14} className="text-[var(--color-error)] shrink-0" aria-hidden="true" />
            <p className="text-xs text-[var(--text-muted)]">
              <span className="text-[var(--text)] font-medium">Immediate danger?</span> Call your local emergency number: <span className="text-[var(--color-error)] font-semibold">911</span> (US) · <span className="text-[var(--color-error)] font-semibold">999</span> (UK) · <span className="text-[var(--color-error)] font-semibold">112</span> (Europe)
            </p>
          </div>
        </div>

        {/* ═══ Two-column: When to Seek Help + Therapy Types ═══ */}
        <div className="grid lg:grid-cols-5 gap-4 mb-8">

          {/* When to seek help — advisory panel (2 cols) */}
          <div className="lg:col-span-2 glass p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[rgba(248,143,34,0.12)] border border-[rgba(248,143,34,0.18)] flex items-center justify-center">
                <Search size={18} className="text-[var(--accent-2)]" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[var(--text)]">When to Seek Professional Help</h2>
                <p className="text-xs text-[var(--text-muted)]">Signs it's time to reach out</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {professionalHelpSigns.map((sign, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-[rgba(248,143,34,0.1)] border border-[rgba(248,143,34,0.15)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={11} className="text-[var(--accent-2)]" aria-hidden="true" />
                  </div>
                  <span className="text-xs text-[var(--text-muted)] leading-relaxed">{sign}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--accent-3)] font-medium">Seeking help is a sign of strength, not weakness.</p>
            </div>
          </div>

          {/* Therapy types — card grid (3 cols) */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[rgba(251,185,49,0.12)] border border-[rgba(251,185,49,0.18)] flex items-center justify-center">
                <BookOpen size={18} className="text-[var(--accent-3)]" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[var(--text)]">Types of Therapy</h2>
                <p className="text-xs text-[var(--text-muted)]">Common approaches explained</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {therapyTypes.map(t => (
                <TherapyTypeCard key={t.name} t={t} />
              ))}
            </div>
          </div>
        </div>

        {/* ═══ Find a Therapist ═══ */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[rgba(255,227,179,0.1)] border border-[rgba(255,227,179,0.15)] flex items-center justify-center">
              <Stethoscope size={18} className="text-[var(--accent-4)]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text)]">Find a Therapist</h2>
              <p className="text-xs text-[var(--text-muted)]">Directories and platforms to connect with licensed professionals</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {therapistDirectories.map(s => (
              <TherapistCard key={s.name} s={s} />
            ))}
          </div>
        </div>

        {/* ═══ Footer Disclaimer ═══ */}
        <div className="glass-2 p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[rgba(251,185,49,0.1)] border border-[rgba(251,185,49,0.15)] flex items-center justify-center shrink-0">
            <Shield size={14} className="text-[var(--accent-3)]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              <span className="text-[var(--text)] font-medium">Safety notice:</span> Mindspace is not a replacement for professional therapy or medical care. If you're in crisis, call <span className="text-[var(--color-error)] font-semibold">988</span> (US) or your local emergency number. These resources are provided for informational purposes and do not constitute medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

