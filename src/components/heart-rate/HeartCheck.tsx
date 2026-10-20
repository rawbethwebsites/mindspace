import { useEffect, useRef, useState } from 'react'
import { HeartPulse, RefreshCw } from 'lucide-react'
import { estimateBpm, type PpgSample } from './ppg'
import { logActivity } from '../../lib/db'

/**
 * Finger-on-camera heart-rate estimate (rear camera, red channel, ~20 s).
 * Purely local: frames are drawn to an offscreen canvas, averaged, and discarded.
 * Nothing is recorded or saved — only the final bpm number is logged (activityLog).
 */

const MEASURE_MS = 20000

type Phase = 'intro' | 'measuring' | 'result' | 'error'

export default function HeartCheck({ onDone }: { onDone?: (bpm: number | null) => void }) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [error, setError] = useState('')
  const [bpm, setBpm] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [liveHint, setLiveHint] = useState<'waiting' | 'finger' | 'measuring'>('waiting')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const stopRef = useRef(false)

  useEffect(() => () => cleanup(), [])

  function cleanup() {
    stopRef.current = true
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  async function start() {
    setPhase('measuring')
    setBpm(null)
    setError('')
    setProgress(0)
    setLiveHint('waiting')
    stopRef.current = false

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 320 }, height: { ideal: 240 } },
        audio: false,
      })
    } catch {
      setPhase('error')
      setError(
        navigator.mediaDevices
          ? "We couldn't reach the camera. Check that Mindspace has permission, then try again."
          : 'This device or browser has no camera available, so the heart check cannot run here.',
      )
      return
    }
    streamRef.current = stream
    const video = videoRef.current
    if (!video) return
    video.srcObject = stream
    await video.play().catch(() => {})

    // Small offscreen canvas: we only need the mean red value of each frame.
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 24
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) { cleanup(); setPhase('error'); setError('This browser cannot read camera frames.'); return }

    const samples: PpgSample[] = []
    const startT = performance.now()

    const frame = () => {
      if (stopRef.current) return
      const now = performance.now()
      const elapsed = now - startT
      setProgress(Math.min(1, elapsed / MEASURE_MS))

      if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let rSum = 0
        let gSum = 0
        for (let i = 0; i < data.length; i += 4) { rSum += data[i]; gSum += data[i + 1] }
        const px = data.length / 4
        samples.push({ t: Math.round(now), r: rSum / px, g: gSum / px })
        // Live hint from the running mean red level: dark-ish red = finger present.
        const last = samples.slice(-30)
        const meanR = last.reduce((a, s) => a + s.r, 0) / last.length
        setLiveHint(meanR > 12 && meanR < 235 ? 'finger' : 'waiting')
      }

      if (elapsed < MEASURE_MS) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        finish(samples)
      }
    }
    rafRef.current = requestAnimationFrame(frame)
  }

  function finish(samples: PpgSample[]) {
    cleanup()
    const res = estimateBpm(samples, MEASURE_MS)
    setBpm(res.bpm)
    if (res.bpm === null) {
      setError(
        res.problem === 'no-finger'
          ? "We couldn't see a fingertip. Rest your finger gently and fully over the camera lens, and keep it still."
          : 'That reading looked too unsteady to estimate. Hold still and press lightly — a gentle touch works better than a hard press.',
      )
      setPhase('error')
      onDone?.(null)
      return
    }
    setPhase('result')
    void logActivity('heart-check', { bpm: res.bpm })
    onDone?.(res.bpm)
  }

  const retry = () => start()

  // ─── Intro ───
  if (phase === 'intro' || phase === 'error') {
    return (
      <div className="card p-6 text-center">
        <span className="icon-tile w-14 h-14 mx-auto mb-4"><HeartPulse size={24} aria-hidden="true" /></span>
        {phase === 'intro' ? (
          <>
            <h3 className="text-lg font-bold text-[var(--text)] mb-1.5">Check your heart</h3>
            <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mb-5 leading-relaxed">
              Rest a fingertip fully over the rear camera and hold still for about 20 seconds.
              Many people find it calming to see their body settle after a breathing exercise.
            </p>
          </>
        ) : (
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mb-5 leading-relaxed" role="alert">
            {error}
          </p>
        )}
        <button onClick={start} className="btn-sunset press px-6 py-2.5 text-sm min-h-[44px] inline-flex items-center gap-2">
          {phase === 'error' ? <><RefreshCw size={16} aria-hidden="true" /> Try again</> : <>Start the check</>}
        </button>
        {phase === 'error' && (
          <button onClick={() => { setPhase('intro'); setError('') }} className="btn-ghost press px-4 py-2 text-sm min-h-[44px] ml-2">
            Back
          </button>
        )}
      </div>
    )
  }

  // ─── Measuring: video must stay in the DOM but is visually contained ───
  return (
    <div className="card p-6">
      <div className="relative mx-auto mb-4" style={{ maxWidth: 260 }}>
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-full rounded-xl bg-black"
          style={{ aspectRatio: '4/3', objectFit: 'cover', filter: 'grayscale(1) brightness(0.7)' }}
          aria-hidden="true"
        />
        <p className="text-center text-xs text-[var(--text-muted)] mt-2" aria-live="polite" role="status">
          {liveHint === 'finger' ? 'Finger detected — hold still…' : 'Rest your fingertip over the camera…'}
        </p>
        <div className="mt-3 h-1.5 rounded-full bg-[var(--border)] overflow-hidden" aria-hidden="true">
          <div
            className="h-full rounded-full"
            style={{ width: `${progress * 100}%`, background: 'var(--gradient-sunset)', transition: 'width 120ms linear' }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--text-subtle)]">Estimate only — not a medical reading.</p>
        <button
          onClick={() => { cleanup(); setPhase('intro'); setProgress(0) }}
          className="press text-sm text-[var(--text-muted)] min-h-[44px] px-2"
        >
          Cancel
        </button>
      </div>
    </div>
  )

  // ─── Result ───
  if (phase === 'result') {
    return (
      <div className="card p-6 text-center">
        <span className="icon-tile w-14 h-14 mx-auto mb-4"><HeartPulse size={24} aria-hidden="true" /></span>
        <h3 className="text-lg font-bold text-[var(--text)] mb-1.5">{bpm} bpm</h3>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mb-4 leading-relaxed">
          This is a fingertip camera estimate, not a medical measurement. Use it to notice how
          your body responds after a breathing exercise — it often slows within a few minutes.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
          <button onClick={retry} className="btn-ghost press px-4 py-2.5 text-sm min-h-[44px]">
            <RefreshCw size={16} aria-hidden="true" /> Check again
          </button>
        </div>
      </div>
    )
  }
}