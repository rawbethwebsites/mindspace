import { useEffect, useRef, useState } from 'react'
import { ArrowUp, PauseCircle, RotateCcw } from 'lucide-react'
import { streamChat, AI_ENABLED } from '../lib/ai'
import { detectCrisis } from '../lib/crisis'
import { getCompanion, loadCompanionId } from '../lib/companions'

type Role = 'boss' | 'parent' | 'partner' | 'friend' | 'other'
type Mode = 'setup' | 'play' | 'debrief'

interface Msg { role: 'user' | 'assistant'; content: string }

const roles: { id: Role; label: string }[] = [
  { id: 'boss', label: 'My boss' },
  { id: 'parent', label: 'My parent' },
  { id: 'partner', label: 'My partner' },
  { id: 'friend', label: 'A friend' },
  { id: 'other', label: 'Someone else' },
]

const buildRoleVoice = (role: Role, context: string, want: string) => {
  const who =
    role === 'boss' ? "the user's boss at work" :
    role === 'parent' ? "one of the user's parents" :
    role === 'partner' ? "the user's partner" :
    role === 'friend' ? "a friend of the user" :
    "someone the user is about to talk to"
  return `You are role-playing as ${who} inside a rehearsal room in the Mindspace app. Stay in character and react realistically — with feeling, hesitation, defensiveness or warmth where a real person would — but never be cruel, abusive, threatening or humiliating. Do not lecture. Keep replies short (1-4 sentences), the way a real person would speak. Context from the user: "${context}". What the user wants to say in this conversation: "${want}". If the conversation naturally reaches a resolution, say so and gently suggest pausing to reflect. Never claim to be a therapist. Never diagnose.`
}

export default function RehearsalRoom() {
  const [mode, setMode] = useState<Mode>('setup')
  const [role, setRole] = useState<Role>('boss')
  const [context, setContext] = useState('')
  const [want, setWant] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [debrief, setDebrief] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const companion = getCompanion(loadCompanionId())

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, debrief, streamText])

  useEffect(() => () => abortRef.current?.abort(), [])

  if (!AI_ENABLED) {
    return (
      <div className="app-page">
        <div className="max-w-2xl mx-auto">
          <p className="page-kicker mb-2">Rehearsal room</p>
          <h1 className="page-title mb-2">Practice the hard conversation</h1>
          <p className="page-subtitle">The rehearsal room needs the companion's voice, which is resting on this build.</p>
        </div>
      </div>
    )
  }

  const send = async (target: 'play' | 'debrief') => {
    const text = input.trim()
    if (!text || streaming) return
    if (detectCrisis(text)) {
      window.dispatchEvent(new CustomEvent('show-crisis'))
      return
    }
    const userMsg: Msg = { role: 'user', content: text }
    const current = target === 'play' ? messages : debrief
    const next = [...current, userMsg]
    if (target === 'play') setMessages(next); else setDebrief(next)
    setInput('')
    setStreaming(true)
    setStreamText('')
    abortRef.current = new AbortController()

    const voiceOverride =
      target === 'play'
        ? buildRoleVoice(role, context || '(not provided)', want || '(not provided)')
        : undefined

    try {
      let full = ''
      for await (const chunk of streamChat(next, abortRef.current.signal, companion.id, voiceOverride)) {
        full += chunk
        setStreamText(full)
      }
      const reply: Msg = { role: 'assistant', content: full || '…' }
      if (target === 'play') setMessages([...next, reply]); else setDebrief([...next, reply])
    } catch {
      const reply: Msg = { role: 'assistant', content: 'I had trouble replying just then. Try again?' }
      if (target === 'play') setMessages([...next, reply]); else setDebrief([...next, reply])
    } finally {
      setStreaming(false)
      setStreamText('')
    }
  }

  const list = mode === 'play' ? messages : debrief

  if (mode === 'setup') {
    return (
      <div className="app-page">
        <div className="max-w-2xl mx-auto">
          <p className="page-kicker mb-2">Rehearsal room</p>
          <h1 className="page-title mb-2">Say it here first</h1>
          <p className="page-subtitle mb-8">
            Pick who you want to practice with. Your companion plays that person — realistically, but kind.
          </p>

          <div className="card p-5 mb-4">
            <h2 className="panel-label mb-3">Who?</h2>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  aria-pressed={role === r.id}
                  className={`press px-4 py-3 rounded-lg border text-sm font-medium min-h-[48px] ${
                    role === r.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-on-surface)]'
                      : 'border-[var(--color-border)] text-[var(--color-on-surface-muted)] hover:border-[var(--border-bright)]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5 mb-4">
            <label htmlFor="rehearse-context" className="panel-label mb-3 block">One line of context</label>
            <input
              id="rehearse-context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder='e.g. "They keep moving my deadlines" or "I need to set a boundary"'
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-subtle)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>

          <div className="card p-5 mb-6">
            <label htmlFor="rehearse-want" className="panel-label mb-3 block">What do you want to say?</label>
            <textarea
              id="rehearse-want"
              value={want}
              onChange={(e) => setWant(e.target.value)}
              rows={4}
              placeholder="The thing that's hard to say out loud."
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-subtle)] focus:outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
            />
          </div>

          <button
            onClick={() => setMode('play')}
            disabled={!want.trim()}
            className="btn-sunset w-full py-3 disabled:opacity-40 min-h-[48px]"
          >
            Begin rehearsal
          </button>
        </div>
      </div>
    )
  }

  const roleLabel = roles.find((r) => r.id === role)?.label ?? 'Them'

  return (
    <div className="chat-shell flex flex-col bg-[var(--bg)]">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--color-border)] chat-head backdrop-blur-xl">
        {mode === 'play' ? (
          <>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[15px] text-[var(--color-on-surface)]">{roleLabel}</p>
              <p className="text-xs text-[var(--color-on-surface-muted)]">Rehearsing</p>
            </div>
            <button
              onClick={() => setMode('debrief')}
              className="press shrink-0 flex items-center gap-1.5 text-[13px] font-semibold px-3.5 rounded-full min-h-[38px] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
            >
              <PauseCircle size={15} aria-hidden="true" /> Pause & debrief
            </button>
          </>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[15px] text-[var(--color-on-surface)]">{companion.name}</p>
              <p className="text-xs text-[var(--color-on-surface-muted)]">Reflecting with you</p>
            </div>
            <button
              onClick={() => setMode('play')}
              className="press shrink-0 flex items-center gap-1.5 text-[13px] font-semibold px-3.5 rounded-full min-h-[38px] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
            >
              <RotateCcw size={15} aria-hidden="true" /> Back to rehearsal
            </button>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-3 space-y-3 max-w-3xl mx-auto w-full">
        {list.length === 0 && (
          <p className="text-sm text-[var(--color-on-surface-muted)] text-center pt-8 px-6">
            {mode === 'play'
              ? `Start the conversation. Imagine ${roleLabel.toLowerCase()} is right there.`
              : `How did that feel? What's one thing to try next time?`}
          </p>
        )}
        {list.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end msg-in' : 'flex msg-in'}>
            <div
              className={`max-w-[80%] px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'rounded-[20px] rounded-br-md bubble-user'
                  : 'rounded-[20px] rounded-bl-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-on-surface)]'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {streaming && (
          <div className="flex msg-in">
            <div className="max-w-[80%] px-4 py-2.5 rounded-[20px] rounded-bl-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-on-surface)] text-[15px] leading-relaxed whitespace-pre-wrap">
              {streamText || <span className="typing-dots" aria-label="Thinking"><i /><i /><i /></span>}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="px-3 pt-2 pb-3 max-w-3xl mx-auto w-full space-y-2">
        {mode === 'debrief' && (
          <p className="text-xs text-[var(--color-on-surface-muted)] px-2">
            Debrief isn't saved. If you want to keep anything, write it in your journal.
          </p>
        )}
        <div className="chat-bar flex items-end gap-2 pl-4 pr-1.5 py-1.5 rounded-[26px] bg-[var(--color-surface)] border border-[var(--color-border)]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send(mode)
              }
            }}
            placeholder={mode === 'play' ? 'Say it to them…' : "How did that go?"}
            rows={1}
            aria-label="Message"
            className="flex-1 resize-none bg-transparent py-2.5 text-[15px] text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-subtle)] focus:outline-none max-h-32 disabled:opacity-60"
            disabled={streaming}
          />
          <button
            onClick={() => send(mode)}
            disabled={!input.trim() || streaming}
            aria-label="Send"
            className={`press w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              input.trim() && !streaming
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]/60'
            }`}
          >
            <ArrowUp size={19} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
        <button
          onClick={() => { abortRef.current?.abort(); setMessages([]); setDebrief([]); setMode('setup') }}
          className="press w-full flex items-center justify-center gap-2 text-xs text-[var(--color-on-surface-muted)] hover:text-[var(--color-on-surface)] min-h-[40px]"
        >
          <RotateCcw size={12} aria-hidden="true" />
          Start a different rehearsal
        </button>
      </div>
    </div>
  )
}
