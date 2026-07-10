import { useState, useEffect, useRef } from 'react'
import { Wind, Brain, Eye, Hand, Ear, Coffee } from 'lucide-react'

export default function Exercises() {
  const [active, setActive] = useState<string | null>(null)

  const exercises = [
    { id: 'breathing', name: 'Box Breathing', icon: Wind, desc: '4-4-4-4 breathing to calm your nervous system', time: '2 min' },
    { id: 'grounding', name: '5-4-3-2-1 Grounding', icon: Brain, desc: 'Use your senses to anchor to the present', time: '3 min' },
    { id: 'cbt', name: 'CBT Thought Record', icon: Brain, desc: 'Challenge unhelpful thoughts with evidence', time: '5 min' },
    { id: 'body-scan', name: 'Body Scan', icon: Wind, desc: 'Progressive muscle relaxation', time: '5 min' },
  ]

  if (active === 'breathing') return <BreathingExercise onBack={() => setActive(null)} />
  if (active === 'grounding') return <GroundingExercise onBack={() => setActive(null)} />
  if (active === 'cbt') return <CBTExercise onBack={() => setActive(null)} />
  if (active === 'body-scan') return <BodyScanExercise onBack={() => setActive(null)} />

  return (
    <div className="min-h-screen pb-12 px-6 md:px-12 pt-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">Guided Exercises</h1>
          <p className="text-sm text-[#6B6B6B]">Simple practices to help you find calm and clarity.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {exercises.map(ex => (
            <button
              key={ex.id}
              onClick={() => setActive(ex.id)}
              className="bg-white rounded-2xl p-6 border border-[#E8E0D0] text-left hover:border-[#8BA889]/40 hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#8BA889]/10 flex items-center justify-center">
                  <ex.icon size={20} className="text-[#5F7A5E]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C2C2C]">{ex.name}</h3>
                  <span className="text-xs text-[#6B6B6B]">{ex.time}</span>
                </div>
              </div>
              <p className="text-sm text-[#6B6B6B]">{ex.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function BreathingExercise({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale')
  const [count, setCount] = useState(4)
  const [cycles, setCycles] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          setPhase(p => {
            if (p === 'inhale') return 'hold1'
            if (p === 'hold1') return 'exhale'
            if (p === 'exhale') { setCycles(cy => cy + 1); return 'hold2' }
            return 'inhale'
          })
          return 4
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [running])

  const phaseText = { inhale: 'Breathe in', hold1: 'Hold', exhale: 'Breathe out', hold2: 'Hold' }
  const scale = phase === 'inhale' ? 1.4 : phase === 'exhale' ? 0.8 : phase === 'hold1' ? 1.4 : 0.8

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pb-12 px-6">
      <button onClick={onBack} className="absolute top-4 left-4 text-sm text-[#6B6B6B] hover:text-[#2C2C2C]">← Back</button>
      <h1 className="text-2xl font-bold text-[#2C2C2C] mb-2">Box Breathing</h1>
      <p className="text-sm text-[#6B6B6B] mb-12">4 seconds inhale, hold, exhale, hold</p>

      <div className="relative flex items-center justify-center mb-12" style={{ width: 250, height: 250 }}>
        <div className="absolute inset-0 rounded-full bg-[#8BA889]/10" />
        <div
          className="rounded-full bg-gradient-to-br from-[#8BA889] to-[#6B9BB5] flex items-center justify-center transition-all duration-1000 ease-in-out"
          style={{ width: 150, height: 150, transform: `scale(${running ? scale : 1})` }}
        >
          <div className="text-center text-white">
            <p className="text-lg font-semibold">{running ? phaseText[phase] : 'Ready?'}</p>
            <p className="text-3xl font-bold">{running ? count : ''}</p>
          </div>
        </div>
      </div>

      {!running ? (
        <button onClick={() => setRunning(true)} className="px-8 py-3 rounded-xl bg-[#8BA889] text-white font-medium hover:bg-[#5F7A5E] transition-colors">
          Start
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-[#6B6B6B]">{cycles} cycles completed</p>
          <button onClick={() => { setRunning(false); setPhase('inhale'); setCount(4); setCycles(0) }} className="px-6 py-2 rounded-xl bg-white border border-[#E8E0D0] text-sm text-[#6B6B6B] hover:border-[#8BA889] transition-colors">
            Stop
          </button>
        </div>
      )}
    </div>
  )
}

function GroundingExercise({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0)
  const steps = [
    { sense: 'See', icon: Eye, prompt: 'Name 5 things you can see around you right now.', count: 5 },
    { sense: 'Touch', icon: Hand, prompt: 'Name 4 things you can physically feel.', count: 4 },
    { sense: 'Hear', icon: Ear, prompt: 'Name 3 sounds you can hear right now.', count: 3 },
    { sense: 'Smell', icon: Coffee, prompt: 'Name 2 things you can smell (or 2 smells you like).', count: 2 },
    { sense: 'Taste', icon: Coffee, prompt: 'Name 1 thing you can taste right now.', count: 1 },
  ]

  if (step >= steps.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <button onClick={onBack} className="absolute top-4 left-4 text-sm text-[#6B6B6B]">← Back</button>
        <div className="text-center">
          <div className="text-5xl mb-4">🌿</div>
          <h1 className="text-2xl font-bold text-[#2C2C2C] mb-2">You're here.</h1>
          <p className="text-sm text-[#6B6B6B] mb-6 max-w-sm">You've grounded yourself using your senses. Notice how you feel now compared to when you started.</p>
          <button onClick={onBack} className="px-6 py-3 rounded-xl bg-[#8BA889] text-white font-medium hover:bg-[#5F7A5E] transition-colors">
            Done
          </button>
        </div>
      </div>
    )
  }

  const s = steps[step]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <button onClick={onBack} className="absolute top-4 left-4 text-sm text-[#6B6B6B]">← Back</button>
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-[#8BA889]/10 flex items-center justify-center mx-auto mb-4">
          <s.icon size={28} className="text-[#5F7A5E]" />
        </div>
        <p className="text-sm text-[#6B6B6B] uppercase tracking-wide mb-2">Step {step + 1} of 5</p>
        <h1 className="text-2xl font-bold text-[#2C2C2C] mb-3">Things you can {s.sense}</h1>
        <p className="text-[#6B6B6B] mb-8">{s.prompt}</p>

        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: s.count }).map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-[#8BA889]/20 border border-[#8BA889]/30" />
          ))}
        </div>

        <button onClick={() => setStep(step + 1)} className="px-8 py-3 rounded-xl bg-[#8BA889] text-white font-medium hover:bg-[#5F7A5E] transition-colors">
          {step === 4 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  )
}

function CBTExercise({ onBack }: { onBack: () => void }) {
  const [situation, setSituation] = useState('')
  const [thought, setThought] = useState('')
  const [emotion, setEmotion] = useState('')
  const [evidenceFor, setEvidenceFor] = useState('')
  const [evidenceAgainst, setEvidenceAgainst] = useState('')
  const [balanced, setBalanced] = useState('')
  const [showResult, setShowResult] = useState(false)

  return (
    <div className="min-h-screen pb-12 px-6 md:px-12 pt-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="text-sm text-[#6B6B6B] hover:text-[#2C2C2C] mb-4">← Back</button>
        <h1 className="text-2xl font-bold text-[#2C2C2C] mb-2">CBT Thought Record</h1>
        <p className="text-sm text-[#6B6B6B] mb-6">Identify and challenge unhelpful thoughts with evidence.</p>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E8E0D0]">
            <label className="text-sm font-semibold text-[#2C2C2C] mb-2 block">1. What happened? (Situation)</label>
            <textarea value={situation} onChange={(e) => setSituation(e.target.value)} rows={2} placeholder="Describe the situation..." className="w-full px-3 py-2 rounded-lg bg-[#F5F1EA] border border-[#E8E0D0] text-sm focus:outline-none focus:border-[#8BA889] resize-none" />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8E0D0]">
            <label className="text-sm font-semibold text-[#2C2C2C] mb-2 block">2. What thought came up?</label>
            <textarea value={thought} onChange={(e) => setThought(e.target.value)} rows={2} placeholder="What were you thinking?" className="w-full px-3 py-2 rounded-lg bg-[#F5F1EA] border border-[#E8E0D0] text-sm focus:outline-none focus:border-[#8BA889] resize-none" />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8E0D0]">
            <label className="text-sm font-semibold text-[#2C2C2C] mb-2 block">3. How did you feel?</label>
            <input value={emotion} onChange={(e) => setEmotion(e.target.value)} placeholder="e.g., anxious, sad, angry..." className="w-full px-3 py-2 rounded-lg bg-[#F5F1EA] border border-[#E8E0D0] text-sm focus:outline-none focus:border-[#8BA889]" />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8E0D0]">
            <label className="text-sm font-semibold text-[#2C2C2C] mb-2 block">4. Evidence FOR this thought</label>
            <textarea value={evidenceFor} onChange={(e) => setEvidenceFor(e.target.value)} rows={2} placeholder="What supports this thought?" className="w-full px-3 py-2 rounded-lg bg-[#F5F1EA] border border-[#E8E0D0] text-sm focus:outline-none focus:border-[#8BA889] resize-none" />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8E0D0]">
            <label className="text-sm font-semibold text-[#2C2C2C] mb-2 block">5. Evidence AGAINST this thought</label>
            <textarea value={evidenceAgainst} onChange={(e) => setEvidenceAgainst(e.target.value)} rows={2} placeholder="What contradicts this thought?" className="w-full px-3 py-2 rounded-lg bg-[#F5F1EA] border border-[#E8E0D0] text-sm focus:outline-none focus:border-[#8BA889] resize-none" />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8E0D0]">
            <label className="text-sm font-semibold text-[#2C2C2C] mb-2 block">6. Balanced thought</label>
            <textarea value={balanced} onChange={(e) => setBalanced(e.target.value)} rows={3} placeholder="Considering all evidence, what's a more balanced way to think about this?" className="w-full px-3 py-2 rounded-lg bg-[#F5F1EA] border border-[#E8E0D0] text-sm focus:outline-none focus:border-[#8BA889] resize-none" />
          </div>

          <button onClick={() => setShowResult(true)} className="w-full py-3 rounded-xl bg-[#8BA889] text-white font-medium hover:bg-[#5F7A5E] transition-colors">
            Complete Exercise
          </button>
        </div>

        {showResult && (
          <div className="mt-6 bg-gradient-to-br from-[#8BA889]/10 to-[#A8C5D6]/10 rounded-2xl p-5 border border-[#8BA889]/20 fade-in">
            <h3 className="font-semibold text-[#5F7A5E] mb-2">Well done 🌿</h3>
            <p className="text-sm text-[#2C2C2C]">You've taken an important step. By examining the evidence, you've given yourself a more balanced perspective. Remember: thoughts are not facts.</p>
            <button onClick={onBack} className="mt-4 text-sm text-[#6B9BB5] hover:underline">Back to exercises →</button>
          </div>
        )}
      </div>
    </div>
  )
}

function BodyScanExercise({ onBack }: { onBack: () => void }) {
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(0)
  const steps = [
    'Find a comfortable position. Close your eyes if you like.',
    'Bring attention to your feet. Notice any tension. Release it.',
    'Move to your legs and knees. Relax any tightness.',
    'Notice your stomach and lower back. Let them soften.',
    'Bring awareness to your chest and shoulders. Drop your shoulders.',
    'Notice your arms and hands. Let them go limp.',
    'Feel your neck and jaw. Unclench your jaw.',
    'Notice your face and forehead. Smooth your brow.',
    'Take a deep breath. Notice your whole body, relaxed.',
  ]

  useEffect(() => {
    if (!running) return
    if (step >= steps.length) return
    const timer = setTimeout(() => setStep(step + 1), 8000)
    return () => clearTimeout(timer)
  }, [running, step])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <button onClick={onBack} className="absolute top-4 left-4 text-sm text-[#6B6B6B]">← Back</button>
      <h1 className="text-2xl font-bold text-[#2C2C2C] mb-2">Body Scan</h1>
      <p className="text-sm text-[#6B6B6B] mb-12">Progressive muscle relaxation — 5 minutes</p>

      <div className="max-w-md text-center">
        {!running ? (
          <button onClick={() => setRunning(true)} className="px-8 py-3 rounded-xl bg-[#8BA889] text-white font-medium hover:bg-[#5F7A5E] transition-colors">
            Begin
          </button>
        ) : step < steps.length ? (
          <div className="fade-in">
            <div className="w-32 h-32 rounded-full bg-[#8BA889]/15 flex items-center justify-center mx-auto mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8BA889] to-[#6B9BB5] animate-pulse" />
            </div>
            <p className="text-lg text-[#2C2C2C] leading-relaxed">{steps[step]}</p>
            <p className="text-xs text-[#6B6B6B] mt-4">Step {step + 1} of {steps.length}</p>
          </div>
        ) : (
          <div className="fade-in">
            <div className="text-5xl mb-4">🌿</div>
            <h2 className="text-xl font-semibold text-[#2C2C2C] mb-2">Complete</h2>
            <p className="text-sm text-[#6B6B6B] mb-6">Notice how your body feels now. Carry this calm with you.</p>
            <button onClick={() => { setRunning(false); setStep(0); onBack() }} className="px-6 py-3 rounded-xl bg-[#8BA889] text-white font-medium hover:bg-[#5F7A5E] transition-colors">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}