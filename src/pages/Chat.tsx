import { useState, useRef, useEffect } from 'react'
import { Plus, MessageCircle, Trash2, LifeBuoy, History, ArrowUp, ChevronDown, Check } from 'lucide-react'
import { streamChat, checkOllamaConnection } from '../lib/ai'
import { detectCrisis } from '../lib/crisis'
import { saveConversation, getAllConversations, deleteConversation, type ChatMessage } from '../lib/db'
import { companions, getCompanion, loadCompanionId, saveCompanionId, type Companion } from '../lib/companions'

// Replies may use **bold**; show it as bold instead of raw asterisks (text only, no HTML).
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return <>{parts.map((p, i) => (p.startsWith('**') && p.endsWith('**') && p.length > 4 ? <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>))}</>
}

function CompanionAvatar({ c, size = 36 }: { c: Companion; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="shrink-0 rounded-full flex items-center justify-center font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.42, background: `linear-gradient(135deg, ${c.colors[0]}, ${c.colors[1]})` }}
    >
      {c.name[0]}
    </span>
  )
}

export default function Chat() {
  const [conversations, setConversations] = useState<{ id: string; title: string; createdAt: number }[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const [showConvList, setShowConvList] = useState(false)
  const [online, setOnline] = useState<boolean | null>(null)
  const [companionId, setCompanionId] = useState<string>(() => getCompanion(loadCompanionId()).id)
  const [showPicker, setShowPicker] = useState(false)
  const companion = getCompanion(companionId)

  const chooseCompanion = (id: string) => {
    if (id !== companionId && messages.length > 0) {
      // A new voice starts a fresh conversation; the old one stays in history.
      setActiveId(null)
      setMessages([])
    }
    setCompanionId(id)
    saveCompanionId(id)
    setShowPicker(false)
  }
  const abortRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      const ok = await checkOllamaConnection()
      if (!cancelled) setOnline(ok)
    }
    poll()
    const interval = setInterval(poll, 20000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamContent])

  const loadConversations = async () => {
    const convs = await getAllConversations()
    setConversations(convs.map(c => ({ id: c.id, title: c.title, createdAt: c.createdAt })))
  }

  const newConversation = () => {
    const id = `chat-${Date.now()}`
    setActiveId(id)
    setMessages([])
    setShowConvList(false)
  }

  const handleSend = async (preset?: string) => {
    const text = (preset ?? input).trim()
    if (!text || streaming) return

    if (detectCrisis(text)) {
      window.dispatchEvent(new CustomEvent('show-crisis'))
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }

    let convId = activeId
    if (!convId) {
      convId = `chat-${Date.now()}`
      setActiveId(convId)
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)
    setStreamContent('')

    abortRef.current = new AbortController()

    try {
      let fullContent = ''
      const aiMessages = newMessages.map(m => ({ role: m.role, content: m.content }))

      for await (const chunk of streamChat(aiMessages, abortRef.current.signal, companionId)) {
        fullContent += chunk
        setStreamContent(fullContent)
      }

      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: fullContent || "I hear you. Can you tell me more about what you're feeling?",
        timestamp: Date.now(),
      }

      const finalMessages = [...newMessages, aiMsg]
      setMessages(finalMessages)
      setStreamContent('')

      const title = newMessages[0].content.slice(0, 50) + (newMessages[0].content.length > 50 ? '...' : '')
      await saveConversation(convId, title, finalMessages, companionId)
      loadConversations()
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const errMsg: ChatMessage = {
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: Date.now(),
        }
        setMessages([...newMessages, errMsg])
        checkOllamaConnection().then(setOnline)
      }
    } finally {
      setStreaming(false)
      setStreamContent('')
    }
  }

  const handleDelete = async (id: string) => {
    await deleteConversation(id)
    if (activeId === id) {
      setActiveId(null)
      setMessages([])
    }
    loadConversations()
  }

  const loadConv = async (id: string) => {
    const convs = await getAllConversations()
    const conv = convs.find(c => c.id === id)
    if (conv) {
      setActiveId(id)
      setMessages(conv.messages)
      if (conv.companion) setCompanionId(getCompanion(conv.companion).id)
      setShowConvList(false)
    }
  }

  const suggestions = ["I've been feeling anxious", "Work is stressing me out", 'I feel lonely', 'I just need to talk']

  return (
    <div className="chat-shell flex bg-[var(--bg)] relative">
      {/* Conversation list: drawer on phones, column on desktop */}
      {showConvList && <button aria-label="Close conversations" onClick={() => setShowConvList(false)} className="md:hidden absolute inset-0 z-20 bg-black/25 fade-in" />}
      <div className={`absolute inset-y-0 left-0 z-30 w-72 border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl flex-col md:static md:shadow-none ${showConvList ? 'flex drawer-in' : 'hidden'} md:flex`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <button
          onClick={newConversation}
          aria-label="Start new conversation"
          className="m-3 btn-sunset flex items-center justify-center gap-2 px-3 py-2.5 text-sm min-h-[44px]"
        >
          <Plus size={16} aria-hidden="true" /> New conversation
        </button>
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {conversations.length === 0 && (
            <p className="text-xs text-[var(--color-on-surface-muted)] px-3 py-4 text-center">No conversations yet</p>
          )}
          {conversations.map(conv => (
            <div key={conv.id} className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors min-h-[44px] ${activeId === conv.id ? 'bg-[var(--color-primary)]/12' : 'hover:bg-[var(--color-surface-hover)]'}`}>
              <button onClick={() => loadConv(conv.id)} className="flex-1 flex items-center gap-2 text-left text-sm text-[var(--color-on-surface)] truncate" aria-label={`Open conversation: ${conv.title}`}>
                <MessageCircle size={14} className="shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
                <span className="truncate">{conv.title}</span>
              </button>
              <button onClick={() => handleDelete(conv.id)} aria-label="Delete conversation" className="md:opacity-0 md:group-hover:opacity-100 text-[var(--color-on-surface-muted)] hover:text-[var(--color-error)] transition-all p-1 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <h1 className="sr-only">Mindspace chat</h1>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--color-border)] bg-[rgba(255,253,248,0.9)] backdrop-blur-xl">
          <button onClick={() => setShowConvList(!showConvList)} aria-label="Your conversations" className="press md:hidden text-[var(--color-on-surface-muted)] min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center">
            <History size={20} aria-hidden="true" />
          </button>
          <button onClick={() => setShowPicker(true)} aria-label={`Talking with ${companion.name}. Change companion`} className="press min-w-0 flex-1 flex items-center gap-2.5 text-left rounded-xl py-0.5">
            <span key={companion.id} className="swap-in"><CompanionAvatar c={companion} size={38} /></span>
            <span className="min-w-0">
              <span className="flex items-center gap-1 font-semibold text-[15px] leading-tight text-[var(--color-on-surface)]">
                {companion.name} <ChevronDown size={14} className="text-[var(--color-on-surface-muted)]" aria-hidden="true" />
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--color-on-surface-muted)] truncate" role="status">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${online === false ? 'bg-[var(--color-on-surface-subtle)]' : 'bg-[var(--color-success)]'}`} aria-hidden="true" />
                {online === false ? 'Resting right now' : companion.tagline}
              </span>
            </span>
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('show-crisis'))}
            aria-label="Get help now"
            className="press shrink-0 flex items-center gap-1.5 text-[13px] font-semibold px-3.5 rounded-full min-h-[38px] text-[var(--color-error)] bg-[var(--color-error-light)]"
          >
            <LifeBuoy size={15} aria-hidden="true" /> Help
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-3 space-y-3 max-w-3xl mx-auto w-full">
          {messages.length === 0 && !streaming && (
            <div className="pt-4 pb-6">
              <h3 className="text-[22px] font-bold tracking-tight text-[var(--color-on-surface)] text-center mb-1">Who would you like to talk to?</h3>
              <p className="text-sm text-[var(--color-on-surface-muted)] text-center mb-4">Same care, different styles. You can switch any time.</p>
              <div className="companion-row -mx-4 px-4 flex gap-2.5 overflow-x-auto pb-2 mb-5" role="radiogroup" aria-label="Choose a companion">
                {companions.map((c, i) => (
                  <button
                    key={c.id}
                    role="radio"
                    aria-checked={c.id === companionId}
                    onClick={() => chooseCompanion(c.id)}
                    style={{ animationDelay: `${i * 45}ms` }}
                    className={`rise-in press shrink-0 w-[132px] text-left rounded-2xl p-3 border bg-[var(--color-surface)] ${c.id === companionId ? 'border-[var(--color-primary)] shadow-[0_0_0_3px_rgba(217,84,43,.12)]' : 'border-[var(--color-border)]'}`}
                  >
                    <CompanionAvatar c={c} size={40} />
                    <span className="block mt-2 font-semibold text-[15px] text-[var(--color-on-surface)]">{c.name}</span>
                    <span className="block text-xs text-[var(--color-on-surface-muted)] leading-snug">{c.tagline}</span>
                  </button>
                ))}
              </div>
              <div key={companion.id} className="msg-in flex items-end gap-2 mb-5">
                <CompanionAvatar c={companion} size={28} />
                <div className="max-w-[80%] px-4 py-2.5 rounded-[20px] rounded-bl-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[15px] leading-relaxed text-[var(--color-on-surface)]">
                  {companion.opener}
                  <span className="block mt-1.5 text-xs text-[var(--color-on-surface-muted)]">{companion.approach}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 max-w-xs ml-9">
                {suggestions.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    style={{ animationDelay: `${120 + i * 50}ms` }}
                    className="rise-in press text-left px-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[15px] text-[var(--color-on-surface)] min-h-[48px] flex items-center justify-between gap-3"
                  >
                    {s} <ArrowUp size={16} className="text-[var(--color-primary)] rotate-45 shrink-0" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            msg.role === 'user' ? (
              <div key={i} className="flex justify-end msg-in">
                <div className="max-w-[80%] px-4 py-2.5 rounded-[20px] rounded-br-md bg-[var(--bg-deep)] text-[#fffaf1] text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              </div>
            ) : (
              <div key={i} className="flex items-end gap-2 msg-in">
                <span className="mb-0.5"><CompanionAvatar c={companion} size={28} /></span>
                <div className="max-w-[80%] px-4 py-2.5 rounded-[20px] rounded-bl-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-on-surface)] text-[15px] leading-relaxed whitespace-pre-wrap"><RichText text={msg.content} /></div>
              </div>
            )
          ))}

          {streaming && (
            <div className="flex items-end gap-2 msg-in">
              <span className="mb-0.5"><CompanionAvatar c={companion} size={28} /></span>
              <div className="max-w-[80%] px-4 py-2.5 rounded-[20px] rounded-bl-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-on-surface)] text-[15px] leading-relaxed whitespace-pre-wrap">
                {streamContent ? <RichText text={streamContent} /> : (
                  <span className="typing-dots" role="status" aria-label={`${companion.name} is thinking`}><i /><i /><i /></span>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-3 pt-2 pb-3 max-w-3xl mx-auto w-full">
          {online === false && (
            <p className="text-xs text-[var(--color-on-surface-muted)] mb-2 px-2" role="status">
              Chat is resting right now. Your journal, check-ins and exercises still work.
            </p>
          )}
          <div className="chat-bar flex items-end gap-2 pl-4 pr-1.5 py-1.5 rounded-[26px] bg-[var(--color-surface)] border border-[var(--color-border)]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Write a message"
              rows={1}
              aria-label="Type your message"
              className="flex-1 resize-none bg-transparent py-2.5 text-[15px] text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-subtle)] focus:outline-none max-h-32 disabled:opacity-60"
              disabled={streaming || online === false}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || streaming || online === false}
              aria-label="Send message"
              className={`press w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${input.trim() && !streaming ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]/60'}`}
            >
              <ArrowUp size={19} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      {showPicker && (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label="Choose a companion">
          <button aria-label="Close" onClick={() => setShowPicker(false)} className="absolute inset-0 bg-black/30 fade-in" />
          <div className="sheet-in relative w-full md:max-w-md bg-[var(--color-surface)] rounded-t-[28px] md:rounded-[28px] p-5" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
            <div className="w-10 h-1 rounded-full bg-[var(--color-border)] mx-auto mb-4 md:hidden" aria-hidden="true" />
            <h3 className="text-lg font-bold text-[var(--color-on-surface)] mb-3">Talk with</h3>
            <div className="space-y-1.5">
              {companions.map((c) => (
                <button key={c.id} onClick={() => chooseCompanion(c.id)} className={`press w-full flex items-center gap-3 p-3 rounded-2xl text-left ${c.id === companionId ? 'bg-[var(--color-primary)]/10' : ''}`}>
                  <CompanionAvatar c={c} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-[var(--color-on-surface)]">{c.name} <span className="font-normal text-[var(--color-on-surface-muted)]">· {c.tagline}</span></span>
                    <span className="block text-[13px] text-[var(--color-on-surface-muted)] leading-snug">{c.approach}</span>
                  </span>
                  {c.id === companionId && <Check size={18} className="text-[var(--color-primary)] shrink-0" aria-label="Current" />}
                </button>
              ))}
            </div>
            {messages.length > 0 && <p className="text-xs text-[var(--color-on-surface-muted)] mt-3">Switching starts a new conversation. This one stays in your history.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
