import type { ElementType } from 'react'
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
  { name: 'Cognitive Behavioral Therapy', abbr: 'CBT', desc: 'Identifies and changes unhelpful thought patterns and behaviors.', icon: Brain },
  { name: 'Dialectical Behavior Therapy', abbr: 'DBT', desc: 'Focuses on emotional regulation, distress tolerance, and mindfulness.', icon: Heart },
  { name: 'Psychodynamic Therapy', abbr: 'PSY', desc: 'Explores how past experiences and the unconscious mind affect present behavior.', icon: Sparkles },
  { name: 'Humanistic Therapy', abbr: 'HUM', desc: 'Focuses on self-actualization, personal growth, and self-exploration.', icon: Users },
  { name: 'EMDR', abbr: 'EMDR', desc: 'Helps process traumatic memories using eye movement desensitization.', icon: Eye },
  { name: 'Interpersonal Therapy', abbr: 'IPT', desc: 'Focuses on relationships and communication patterns.', icon: MessageSquare },
]

const therapistDirectories = [
  { name: 'Psychology Today', url: 'https://www.psychologytoday.com', desc: 'Largest therapist directory', tags: ['Directory', 'Licensed'], icon: Search },
  { name: 'BetterHelp', url: 'https://www.betterhelp.com', desc: 'Online therapy platform', tags: ['Online', 'Licensed'], icon: Video },
  { name: 'Talkspace', url: 'https://www.talkspace.com', desc: 'Online therapy with licensed therapists', tags: ['Online', 'Licensed'], icon: MessageSquare },
  { name: 'Open Path Collective', url: 'https://openpathcollective.org', desc: 'Affordable therapy ($30–$80/session)', tags: ['Affordable', 'Directory'], icon: Heart },
]

const emergencyNumbers = [
  { region: 'US', num: '911' },
  { region: 'UK', num: '999' },
  { region: 'Europe', num: '112' },
]

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function getCrisisBadge(r: typeof crisisResources[0]) {
  if (r.description.includes('24/7')) return { label: '24/7', className: 'pill-error' }
  if (r.regions.includes('Global')) return { label: 'Global', className: 'pill-gold' }
  return { label: r.regions.join(', '), className: 'pill-cream' }
}

// Turns "Text 988" / "Text HOME to 741741" into a real sms: link so it's
// actually actionable, not just styled like a button.
function getSmsHref(text: string): string | null {
  let m = text.match(/^Text\s+(\d+)$/i)
  if (m) return `sms:${m[1]}`
  m = text.match(/^Text\s+(\w+)\s+to\s+([\d-]+)$/i)
  if (m) return `sms:${m[2].replace(/-/g, '')}?&body=${encodeURIComponent(m[1])}`
  return null
}

const sectionTones = {
  error: { bg: 'rgba(240,80,92,0.12)', border: 'rgba(240,80,92,0.18)', icon: 'var(--color-error)' },
  sunset: { bg: 'rgba(248,143,34,0.12)', border: 'rgba(248,143,34,0.18)', icon: 'var(--accent-2)' },
  gold: { bg: 'rgba(251,185,49,0.12)', border: 'rgba(251,185,49,0.18)', icon: 'var(--accent-3)' },
  cream: { bg: 'rgba(255,227,179,0.1)', border: 'rgba(255,227,179,0.15)', icon: 'var(--accent-4)' },
} as const

// ─────────────────────────────────────────────
// Shared section header (was duplicated 4x)
// ─────────────────────────────────────────────
function SectionHeader({ icon: Icon, tone, headingId, title, subtitle }: {
  icon: ElementType
  tone: keyof typeof sectionTones
  headingId: string
  title: string
  subtitle: string
}) {
  const t = sectionTones[tone]
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: t.bg, border: `1px solid ${t.border}` }}
      >
        <Icon size={18} style={{ color: t.icon }} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h2 id={headingId} className="text-lg font-semibold text-[var(--text)] tracking-tight">{title}</h2>
        <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Cards
// ─────────────────────────────────────────────
function CrisisCard({ r, priority }: { r: typeof crisisResources[0]; priority: boolean }) {
  const badge = getCrisisBadge(r)
  const smsHref = r.text ? getSmsHref(r.text) : null

  return (
    <div className={`glass p-5 flex flex-col gap-3 h-full ${priority ? 'border-[rgba(240,80,92,0.35)] bg-[rgba(240,80,92,0.04)]' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-[var(--text)] text-base leading-snug">{r.name}</h3>
        <span className={`pill ${badge.className} shrink-0`}>{badge.label}</span>
      </div>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1">{r.description}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        {r.phone && (
          <a href={`tel:${r.phone}`} className="btn-sunset flex items-center gap-1.5 px-3.5 py-2.5 text-sm min-h-[44px]" aria-label={`Call ${r.name} at ${r.phone}`}>
            <Phone size={14} aria-hidden="true" /> {r.phone}
          </a>
        )}
        {r.text && smsHref && (
          <a href={smsHref} className="btn-ghost flex items-center gap-1.5 px-3.5 py-2.5 text-sm min-h-[44px]" aria-label={`${r.text} to reach ${r.name}`}>
            <MessageSquare size={14} aria-hidden="true" /> {r.text}
          </a>
        )}
        {r.text && !smsHref && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm text-[var(--text-muted)]">
            <MessageSquare size={14} aria-hidden="true" /> {r.text}
          </span>
        )}
        {r.url && (
          <a href={r.url} target="_blank" rel="noreferrer" className="btn-ghost flex items-center gap-1.5 px-3.5 py-2.5 text-sm min-h-[44px]" aria-label={`Visit ${r.name} website`}>
            <Globe size={14} aria-hidden="true" /> Website <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  )
}

function TherapyTypeCard({ t }: { t: typeof therapyTypes[0] }) {
  return (
    <div className="glass-2 p-4 h-full hover:border-[var(--border-bright)] transition-colors">
      <div className="flex items-start gap-3 mb-2.5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[rgba(248,143,34,0.12)] border border-[rgba(248,143,34,0.2)]">
          <t.icon size={16} className="text-[var(--accent-2)]" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[var(--text)] leading-tight">{t.name}</h3>
          <span className="pill pill-sunset mt-1.5">{t.abbr}</span>
        </div>
      </div>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{t.desc}</p>
    </div>
  )
}

function TherapistCard({ s }: { s: typeof therapistDirectories[0] }) {
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noreferrer"
      className="glass-2 p-4 flex flex-col gap-3 h-full hover:border-[var(--border-bright)] transition-all hover:-translate-y-0.5 group"
      aria-label={`Visit ${s.name} (opens in a new tab)`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-[rgba(248,143,34,0.1)] border border-[rgba(248,143,34,0.15)] flex items-center justify-center shrink-0">
          <s.icon size={16} className="text-[var(--accent-2)]" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--text)]">{s.name}</h3>
      </div>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1">{s.desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {s.tags.map(tag => (
          <span key={tag} className="pill pill-cream">{tag}</span>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--accent-2)] pt-2 mt-auto border-t border-[var(--border)] group-hover:text-[var(--accent-1)] transition-colors">
        Visit website
        <ArrowUpRight size={13} aria-hidden="true" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
    <div className="min-h-screen pb-16 px-5 md:px-8 pt-8 glow-bg">
      <div className="max-w-6xl mx-auto">

        {/* ═══ Hero ═══ */}
        <header className="mb-10 md:mb-14 fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-1)] to-[var(--accent-3)] flex items-center justify-center glow-soft" aria-hidden="true">
              <Shield size={16} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Support Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] tracking-tight mb-2">Resources</h1>
          <p className="text-base text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Crisis support, professional guidance, and therapy resources — all in one place.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-[var(--text-subtle)]">
            <span className="inline-flex items-center gap-1.5"><Clock size={14} aria-hidden="true" /> 24/7 crisis lines</span>
            <span className="inline-flex items-center gap-1.5"><BookOpen size={14} aria-hidden="true" /> 6 therapy guides</span>
            <span className="inline-flex items-center gap-1.5"><Search size={14} aria-hidden="true" /> 4 therapist directories</span>
          </div>
        </header>

        {/* ═══ Crisis Support — strongest visual anchor ═══ */}
        <section aria-labelledby="crisis-heading" className="mb-14 md:mb-16">
          <SectionHeader
            icon={AlertTriangle}
            tone="error"
            headingId="crisis-heading"
            title="Crisis Support — Available Now"
            subtitle="Free and confidential. If you're in crisis, reach out immediately."
          />

          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
            {sortedCrisis.map((r) => (
              <li key={r.name}>
                <CrisisCard r={r} priority={r.description.includes('24/7')} />
              </li>
            ))}
          </ul>

          {/* Emergency numbers — real tel: links, given weight matching its importance */}
          <div
            className="mt-4 glass p-4 sm:p-5"
            style={{ borderColor: 'rgba(240,80,92,0.28)', background: 'rgba(240,80,92,0.05)' }}
            role="note"
            aria-label="Emergency numbers"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-[var(--color-error)] shrink-0" aria-hidden="true" />
              <p className="text-sm font-semibold text-[var(--text)]">In immediate danger? Call your local emergency number.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {emergencyNumbers.map((e) => (
                <a
                  key={e.num}
                  href={`tel:${e.num}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold min-h-[44px] rounded-xl border transition-colors hover:bg-[rgba(240,80,92,0.1)]"
                  style={{ borderColor: 'rgba(240,80,92,0.3)', color: 'var(--color-error)' }}
                  aria-label={`Call emergency services in ${e.region} at ${e.num}`}
                >
                  <Phone size={14} aria-hidden="true" /> {e.num}
                  <span className="font-normal text-[var(--text-muted)]">({e.region})</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Two-column: When to Seek Help + Therapy Types ═══ */}
        <div className="grid lg:grid-cols-5 gap-6 mb-14 md:mb-16">

          {/* When to seek help — advisory panel (2 cols) */}
          <section aria-labelledby="help-heading" className="lg:col-span-2 glass p-6">
            <SectionHeader
              icon={Search}
              tone="sunset"
              headingId="help-heading"
              title="When to Seek Professional Help"
              subtitle="Signs it's time to reach out"
            />
            <ul className="space-y-3" role="list">
              {professionalHelpSigns.map((sign, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-[rgba(248,143,34,0.1)] border border-[rgba(248,143,34,0.15)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={11} className="text-[var(--accent-2)]" aria-hidden="true" />
                  </div>
                  <span className="text-sm text-[var(--text-muted)] leading-relaxed">{sign}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 pt-4 border-t border-[var(--border)] text-sm text-[var(--accent-3)] font-medium">
              Seeking help is a sign of strength, not weakness.
            </p>
          </section>

          {/* Therapy types — card grid (3 cols) */}
          <section aria-labelledby="therapy-heading" className="lg:col-span-3">
            <SectionHeader
              icon={BookOpen}
              tone="gold"
              headingId="therapy-heading"
              title="Types of Therapy"
              subtitle="Common approaches explained"
            />
            <ul className="grid sm:grid-cols-2 gap-3" role="list">
              {therapyTypes.map(t => (
                <li key={t.name}><TherapyTypeCard t={t} /></li>
              ))}
            </ul>
          </section>
        </div>

        {/* ═══ Find a Therapist ═══ */}
        <section aria-labelledby="therapist-heading" className="mb-14 md:mb-16">
          <SectionHeader
            icon={Stethoscope}
            tone="cream"
            headingId="therapist-heading"
            title="Find a Therapist"
            subtitle="Directories and platforms to connect with licensed professionals"
          />
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" role="list">
            {therapistDirectories.map(s => (
              <li key={s.name}><TherapistCard s={s} /></li>
            ))}
          </ul>
        </section>

        {/* ═══ Footer Disclaimer ═══ */}
        <footer className="glass-2 p-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[rgba(251,185,49,0.1)] border border-[rgba(251,185,49,0.15)] flex items-center justify-center shrink-0">
            <Shield size={15} className="text-[var(--accent-3)]" aria-hidden="true" />
          </div>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            <span className="text-[var(--text)] font-medium">Safety notice:</span> Mindspace is not a replacement for professional therapy or medical care. If you're in crisis, call{' '}
            <a href="tel:988" className="text-[var(--color-error)] font-semibold hover:underline">988</a> (US) or your local emergency number. These resources are provided for informational purposes and do not constitute medical advice.
          </p>
        </footer>
      </div>
    </div>
  )
}
