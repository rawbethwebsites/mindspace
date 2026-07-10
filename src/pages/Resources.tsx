import { Phone, MessageSquare, Globe, Heart, Search, BookOpen } from 'lucide-react'
import { crisisResources } from '../lib/crisis'

export default function Resources() {
  return (
    <div className="min-h-screen pb-12 px-6 md:px-12 pt-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-on-surface)] mb-2">Resources</h1>
          <p className="text-sm text-[var(--color-on-surface-muted)]">Crisis support, professional help, and mental health information.</p>
        </div>

        {/* Crisis resources */}
        <div className="bg-red-50 rounded-2xl p-6 border border-red-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={20} className="text-red-500" />
            <h2 className="text-lg font-semibold text-[var(--color-on-surface)]">Crisis Support — Available Now</h2>
          </div>
          <p className="text-sm text-[var(--color-on-surface-muted)] mb-4">If you or someone you know is in crisis, reach out immediately. These services are free and confidential.</p>
          <div className="space-y-3">
            {crisisResources.map(r => (
              <div key={r.name} className="bg-white rounded-xl p-4 border border-red-50">
                <h3 className="font-semibold text-[var(--color-on-surface)] mb-1">{r.name}</h3>
                <p className="text-sm text-[var(--color-on-surface-muted)] mb-2">{r.description}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {r.phone && <a href={`tel:${r.phone}`} className="flex items-center gap-1.5 text-[#c44] font-medium hover:underline"><Phone size={14} /> {r.phone}</a>}
                  {r.text && <span className="flex items-center gap-1.5 text-[#c44] font-medium"><MessageSquare size={14} /> {r.text}</span>}
                  {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[var(--color-secondary)] font-medium hover:underline"><Globe size={14} /> Website</a>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* When to seek professional help */}
        <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)] mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search size={20} className="text-[var(--color-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--color-on-surface)]">When to Seek Professional Help</h2>
          </div>
          <ul className="text-sm text-[var(--color-on-surface-muted)] space-y-2.5">
            <li>• Feelings of sadness, anxiety, or worry that persist for weeks</li>
            <li>• Difficulty performing daily activities (work, school, relationships)</li>
            <li>• Changes in sleep, appetite, or energy levels</li>
            <li>• Thoughts of self-harm or suicide</li>
            <li>• Substance use as a coping mechanism</li>
            <li>• Feeling stuck or unable to resolve issues on your own</li>
            <li>• Experiencing trauma or loss that feels overwhelming</li>
          </ul>
          <p className="text-sm text-[var(--color-primary-dark)] mt-4 font-medium">Seeking help is a sign of strength, not weakness.</p>
        </div>

        {/* Types of therapy */}
        <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)] mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={20} className="text-[var(--color-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--color-on-surface)]">Types of Therapy</h2>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Cognitive Behavioral Therapy (CBT)', desc: 'Identifies and changes unhelpful thought patterns and behaviors.' },
              { name: 'Dialectical Behavior Therapy (DBT)', desc: 'Focuses on emotional regulation, distress tolerance, and mindfulness.' },
              { name: 'Psychodynamic Therapy', desc: 'Explores how past experiences and the unconscious mind affect present behavior.' },
              { name: 'Humanistic Therapy', desc: 'Focuses on self-actualization, personal growth, and self-exploration.' },
              { name: 'EMDR', desc: 'Helps process traumatic memories using eye movement desensitization.' },
              { name: 'Interpersonal Therapy', desc: 'Focuses on relationships and communication patterns.' },
            ].map(t => (
              <div key={t.name} className="border-b border-[var(--color-border)]/50 last:border-0 pb-3 last:pb-0">
                <h3 className="font-medium text-[var(--color-on-surface)] text-sm">{t.name}</h3>
                <p className="text-sm text-[var(--color-on-surface-muted)] mt-0.5">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Find a therapist */}
        <div className="bg-gradient-to-br from-[var(--color-primary)]/10 to-[#A8C5D6]/10 rounded-2xl p-6 border border-[var(--color-primary)]/20">
          <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-4">Find a Therapist</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { name: 'Psychology Today', url: 'https://www.psychologytoday.com', desc: 'Largest therapist directory' },
              { name: 'BetterHelp', url: 'https://www.betterhelp.com', desc: 'Online therapy platform' },
              { name: 'Talkspace', url: 'https://www.talkspace.com', desc: 'Online therapy with licensed therapists' },
              { name: 'Open Path Collective', url: 'https://openpathcollective.org', desc: 'Affordable therapy ($30-$80/session)' },
            ].map(s => (
              <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="bg-white rounded-xl p-4 border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 transition-colors block">
                <h3 className="font-medium text-[var(--color-on-surface)] text-sm">{s.name}</h3>
                <p className="text-xs text-[var(--color-on-surface-muted)] mt-0.5">{s.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}