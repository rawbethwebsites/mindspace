import { useEffect, useState } from 'react'
import { FileText, Download, Share2, Printer, LifeBuoy, AlertTriangle, Heart, Brain, Loader2 } from 'lucide-react'
import { buildFourteenDayBrief, formatBriefForClinician, formatBriefForShare, type FourteenDayBrief } from './brief'
import { NIGERIA_GUIDE, shareNigeriaGuide, printNigeriaGuide } from './nigeria-guide'

export default function BridgeHelp() {
  const [brief, setBrief] = useState<FourteenDayBrief | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    buildFourteenDayBrief().then((b) => { setBrief(b); setLoading(false) })
  }, [])

  const copyClinician = async () => {
    if (!brief) return
    await navigator.clipboard.writeText(formatBriefForClinician(brief))
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const copyShare = async () => {
    if (!brief) return
    await navigator.clipboard.writeText(formatBriefForShare(brief))
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const shareNative = async () => {
    if (!brief) return
    if (navigator.share) {
      try { await navigator.share({ title: 'My Mindspace 14-Day Summary', text: formatBriefForShare(brief) }) } catch {}
    } else {
      await copyShare()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LifeBuoy size={22} className="text-[var(--color-primary)]" aria-hidden="true" />
            <h1 className="text-lg font-semibold text-[var(--color-on-surface)]">Bridge to real help</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-[var(--color-warning-light)] border border-[var(--color-warning)]/30 flex gap-3">
          <AlertTriangle size={20} className="text-[var(--color-warning)] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm text-[var(--color-on-surface)]">
            <strong>This app is not a crisis service.</strong> If you are in danger now, call <strong>112</strong> or go to the nearest emergency department.
          </div>
        </div>

        {/* 14-Day Summary Card */}
        <section className="space-y-4" aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="flex items-center gap-2 text-[var(--color-on-surface)]">
            <FileText size={20} className="text-[var(--color-primary)]" aria-hidden="true" />
            Your 14-day summary
          </h2>

          <div className="card p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <StatBox label="Mood check-ins" value={brief!.moodCount} icon={<Heart size={18} aria-hidden="true" />} />
              <StatBox label="Journal entries" value={brief!.journalCount} icon={<FileText size={18} aria-hidden="true" />} />
              <StatBox label="Positive days" value={brief!.positiveDays} className="text-[var(--color-success)]" />
              <StatBox label="Struggling days" value={brief!.strugglingDays} className="text-[var(--color-error)]" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2 border-t border-[var(--color-border)]">
              <StatBox label="Breathing sessions" value={brief!.breathingSessions} icon={<Brain size={18} aria-hidden="true" />} />
              <StatBox label="Heart checks" value={brief!.heartChecks} />
              <StatBox label="Avg heart-rate" value={brief!.avgBpm ? `${brief!.avgBpm} bpm` : '—'} />
              <StatBox label="Trusted contacts" value={brief!.trustedPeople} />
            </div>

            {brief!.mostCommonTag && (
              <p className="text-sm text-[var(--color-on-surface-muted)]">
                Most common mood tag: <strong>{brief!.mostCommonTag}</strong>
              </p>
            )}

            <p className="text-xs text-[var(--color-on-surface-muted)] text-center">
              Generated {new Date(brief!.generatedAt).toLocaleString()}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button onClick={copyClinician} className="btn-primary press flex-1 min-w-[140px] min-h-[44px] flex items-center justify-center gap-2" aria-label="Copy clinician summary">
                <FileText size={16} aria-hidden="true" />
                {copied ? 'Copied!' : 'Copy for clinician'}
              </button>
              <button onClick={copyShare} className="btn-secondary press flex-1 min-w-[140px] min-h-[44px] flex items-center justify-center gap-2" aria-label="Copy share text">
                <Share2 size={16} aria-hidden="true" />
                Copy to share
              </button>
              <button onClick={shareNative} className="btn-secondary press flex-1 min-w-[140px] min-h-[44px] flex items-center justify-center gap-2" aria-label="Share via system sheet">
                <Share2 size={16} aria-hidden="true" />
                Share…
              </button>
              <button onClick={() => printClinician(brief!)} className="btn-secondary press flex-1 min-w-[140px] min-h-[44px] flex items-center justify-center gap-2" aria-label="Print clinician summary">
                <Printer size={16} aria-hidden="true" />
                Print
              </button>
            </div>
          </div>
        </section>

        {/* Nigeria Guide Card */}
        <section className="space-y-4" aria-labelledby="guide-heading">
          <h2 id="guide-heading" className="flex items-center gap-2 text-[var(--color-on-surface)]">
            <LifeBuoy size={20} className="text-[var(--color-primary)]" aria-hidden="true" />
            Nigeria — Mental health help you can use today
          </h2>

          <div className="card p-5 space-y-4">
            <p className="text-sm text-[var(--color-on-surface-muted)]">
              Where to find care in Nigeria, what to say at your first visit, and how family can help.
            </p>

            <div className="flex flex-wrap gap-2">
              <button onClick={shareNigeriaGuide} className="btn-primary press flex-1 min-w-[140px] min-h-[44px] flex items-center justify-center gap-2" aria-label="Share Nigeria guide via system sheet">
                <Share2 size={16} aria-hidden="true" />
                Share guide
              </button>
              <button onClick={printNigeriaGuide} className="btn-secondary press flex-1 min-w-[140px] min-h-[44px] flex items-center justify-center gap-2" aria-label="Print Nigeria guide">
                <Printer size={16} aria-hidden="true" />
                Print guide
              </button>
              <button onClick={() => navigator.clipboard.writeText(NIGERIA_GUIDE).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })} className="btn-secondary press flex-1 min-w-[140px] min-h-[44px] flex items-center justify-center gap-2" aria-label="Copy Nigeria guide to clipboard">
                <Download size={16} aria-hidden="true" />
                Copy guide
              </button>
            </div>

            <details className="text-sm text-[var(--color-on-surface-muted)] border-t border-[var(--color-border)] pt-4">
              <summary className="cursor-pointer font-medium text-[var(--color-on-surface)]">Preview guide (tap to expand)</summary>
              <pre className="mt-3 whitespace-pre-wrap font-mono text-xs overflow-x-auto max-h-64 overflow-y-auto">{NIGERIA_GUIDE}</pre>
            </details>
          </div>
        </section>

        {/* Reminder */}
        <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center text-sm text-[var(--color-on-surface-muted)]">
          <p>All data stays on your phone. Nothing is sent anywhere.</p>
          <p className="mt-1">Heart-rate estimates are from a phone-camera sensor — <strong>estimates only, not medical readings.</strong></p>
        </div>
      </main>
    </div>
  )
}

function StatBox({ label, value, icon, className = '' }: { label: string; value: string | number; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={`p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] ${className}`}>
      {icon && <div className="flex justify-center text-[var(--color-primary)] mb-1">{icon}</div>}
      <div className="text-2xl font-bold text-[var(--color-on-surface)]">{value}</div>
      <div className="text-xs text-[var(--color-on-surface-muted)]">{label}</div>
    </div>
  )
}

function printClinician(b: FourteenDayBrief) {
  const win = window.open('', '_blank')
  if (win) {
    win.document.write(`<pre style="font-family: system-ui; white-space: pre-wrap; padding: 1rem;">${formatBriefForClinician(b)}</pre>`)
    win.document.close()
    win.print()
  }
}