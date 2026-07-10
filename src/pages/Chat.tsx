import { useState, useRef, useEffect } from 'react'
import { Send, Plus, MessageCircle, Trash2, Loader2 } from 'lucide-react'
import { streamChat } from '../lib/ai'
import { detectCrisis } from '../lib/crisis'
import { saveConversation, getAllConversations, deleteConversation, type ChatMessage } from '../lib/db'

export default function Chat() {
  const [conversations, setConversations] = useState<{ id: string; title: string; createdAt: number }[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const [showConvList, setShowConvList] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
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

  const handleSend = async () => {
    if (!input.trim() || streaming) return

    if (detectCrisis(input)) {
      window.dispatchEvent(new CustomEvent('show-crisis'))
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: input.trim(),
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

      for await (const chunk of streamChat(aiMessages, abortRef.current.signal)) {
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
      await saveConversation(convId, title, finalMessages)
      loadConversations()
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const errMsg: ChatMessage = {
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: Date.now(),
        }
        setMessages([...newMessages, errMsg])
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
      setShowConvList(false)
    }
  }

  return (
    <div className="flex h-screen pb-7">
      {/* Conversation list */}
      <div className={`w-64 border-r border-[var(--color-border)] bg-[var(--color-background)] flex-col ${showConvList ? 'flex' : 'hidden'} md:flex`}>
        <button
          onClick={newConversation}
          aria-label="Start new conversation"
          className="m-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors min-h-[44px]"
        >
          <Plus size={16} aria-hidden="true" /> New conversation
        </button>
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {conversations.length === 0 && (
            <p className="text-xs text-[var(--color-on-surface-muted)] px-3 py-4 text-center">No conversations yet</p>
          )}
          {conversations.map(conv => (
            <div key={conv.id} className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors min-h-[44px] ${activeId === conv.id ? 'bg-[var(--color-primary)]/15' : 'hover:bg-[var(--color-primary)]/8'}`}>
              <button onClick={() => loadConv(conv.id)} className="flex-1 flex items-center gap-2 text-left text-sm text-[var(--color-on-surface)] truncate" aria-label={`Open conversation: ${conv.title}`}>
                <MessageCircle size={14} className="shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
                <span className="truncate">{conv.title}</span>
              </button>
              <button onClick={() => handleDelete(conv.id)} aria-label="Delete conversation" className="opacity-0 group-hover:opacity-100 text-[var(--color-on-surface-muted)] hover:text-[var(--color-error)] transition-all p-1 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3">
          <button onClick={() => setShowConvList(!showConvList)} aria-label="Toggle conversation list" className="md:hidden text-[var(--color-on-surface-muted)] min-w-[44px] min-h-[44px] flex items-center justify-center">
            <MessageCircle size={20} aria-hidden="true" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center" aria-hidden="true">
            <MessageCircle size={16} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--color-on-surface)] text-sm">Mindspace AI</h2>
            <p className="text-xs text-[var(--color-on-surface-muted)]">Supportive · Non-judgmental</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
          {messages.length === 0 && !streaming && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <MessageCircle size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-on-surface)] mb-2">How are you feeling today?</h3>
              <p className="text-sm text-[var(--color-on-surface-muted)] max-w-sm mx-auto mb-6">This is a safe space. Share whatever is on your mind — no judgment, just support.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["I've been feeling anxious", "I'm stressed about work", 'I feel lonely', 'I need someone to talk to'].map(s => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    aria-label={`Start with: ${s}`}
                    className="px-3 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-on-surface-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors min-h-[44px]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[var(--color-primary)] text-white rounded-br-md'
                  : 'bg-[var(--color-surface)] text-[var(--color-on-surface)] rounded-bl-md border border-[var(--color-border)]'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Streaming message with loading state */}
          {streaming && (
            <div className="flex justify-start fade-in">
              <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-bl-md bg-[var(--color-surface)] border border-[var(--color-border)] text-sm leading-relaxed text-[var(--color-on-surface)]">
                {streamContent || (
                  <span className="flex items-center gap-2 text-[var(--color-on-surface-muted)]" role="status" aria-live="polite">
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" /> Thinking...
                  </span>
                )}
                {streamContent && <span className="inline-block w-1.5 h-3.5 bg-[var(--color-primary)] ml-0.5 animate-pulse" aria-hidden="true" />}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[var(--color-border)] p-4 max-w-3xl mx-auto w-full">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Share what's on your mind..."
              rows={1}
              aria-label="Type your message"
              className="flex-1 resize-none px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-subtle)] focus:outline-none focus:border-[var(--color-primary)] transition-colors max-h-32"
              disabled={streaming}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              aria-label="Send message"
              className="w-12 h-12 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}