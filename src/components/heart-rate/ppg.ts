// Photoplethysmography (PPG) heart-rate estimate from a rear-camera finger video.
//
// Pure signal processing — no DOM, no camera, no React. The UI component drives it
// with red-channel means so the algorithm stays testable on its own.
//
// How it works: a fingertip pressed over the camera is lit by the flash/ambient
// light; every heartbeat pushes a small pulse of blood through the tissue, which
// changes how much red light is absorbed. We watch the MEAN RED CHANNEL BRIGHTNESS
// over ~20 seconds, filter out slow drift and high-frequency noise, then count the
// oscillation peaks. This is an ESTIMATE, not a medical reading.

/** One red-channel sample per frame: (timestampMs, mean brightness 0..255). */
export interface PpgSample {
  t: number
  r: number
  /** Optional mean green channel, used to check the finger's red dominance. */
  g?: number
}

export interface PpgResult {
  /** Estimated beats per minute, rounded. null when the signal was too poor. */
  bpm: number | null
  /** Why the estimate failed or is weak, in plain words. */
  problem?: 'no-finger' | 'too-noisy'
  /** Cleaned waveform (for a small chart). */
  wave: { t: number; v: number }[]
}

// ---- helpers ----

// Simple moving average of window w samples.
function movingAvg(xs: number[], w: number): number[] {
  const out: number[] = []
  let sum = 0
  for (let i = 0; i < xs.length; i++) {
    sum += xs[i]
    if (i >= w) sum -= xs[i - w]
    out.push(sum / Math.min(i + 1, w))
  }
  return out
}

// Detrend: subtract a slow moving average so only the pulse oscillation remains.
export function detrend(values: number[], windowMs: number, ts: number[]): number[] {
  // Approximate window size in samples from median frame gap.
  const gaps: number[] = []
  for (let i = 1; i < ts.length; i++) gaps.push(ts[i] - ts[i - 1])
  gaps.sort((a, b) => a - b)
  const medianGap = gaps[Math.floor(gaps.length / 2)] || 50
  const w = Math.max(3, Math.round(windowMs / medianGap))
  const baseline = movingAvg(values, w)
  return values.map((v, i) => v - baseline[i])
}

// Very small 3-point smoothing to kill single-frame noise before peak counting.
function smooth3(xs: number[]): number[] {
  return xs.map((x, i) => {
    const a = xs[i - 1] ?? x
    const b = xs[i + 1] ?? x
    return (a + 2 * x + b) / 4
  })
}

/**
 * Beat counting with a Schmitt trigger: a beat is counted only after the signal
 * (a) rises above +threshold, (b) reaches its local maximum, and (c) the NEXT beat
 * can only count after the signal has fallen below -threshold. The valley re-arm
 * is what stops the dicrotic bump inside one heartbeat being counted twice.
 * refractoryMs further ignores any rise within refractoryMs of the last beat.
 */
export function schmittBeats(xs: number[], ts: number[], threshold: number, refractoryMs = 333): number[] {
  const peaks: number[] = []
  let armed = true // ready to detect the next rise
  let lastPeakT = -Infinity
  for (let i = 1; i < xs.length - 1; i++) {
    if (armed && xs[i] > threshold && xs[i] >= xs[i + 1] && xs[i] > xs[i - 1]) {
      if (ts[i] - lastPeakT >= refractoryMs) {
        peaks.push(i)
        lastPeakT = ts[i]
        armed = false
      }
    } else if (!armed && xs[i] < -threshold) {
      armed = true
    }
  }
  return peaks
}

/** Quality gates for "is the finger actually on the camera". */
export function redIsUsable(samples: PpgSample[]): { ok: boolean; meanR: number; variance: number; redDominance: number } {
  if (samples.length === 0) return { ok: false, meanR: 0, variance: 0, redDominance: 0 }
  const rs = samples.map((s) => s.r)
  const meanR = rs.reduce((a, b) => a + b, 0) / rs.length
  const variance = rs.reduce((a, b) => a + (b - meanR) ** 2, 0) / rs.length
  // A fingertip over the lens is a dark, red-dominated field: red well above green,
  // neither near-black (occluded) nor near-white (unobstructed bright scene).
  const withG = samples.filter((s) => s.g !== undefined)
  const meanG = withG.length ? withG.reduce((a, s) => a + (s.g as number), 0) / withG.length : 0
  const redDominance = meanG > 0 ? meanR / meanG : 0
  const darkEnough = meanR > 12 && meanR < 235
  const redEnough = withG.length === 0 || redDominance >= 1.15 // finger blocks blue/green strongly
  return { ok: darkEnough && redEnough && variance > 0.02, meanR, variance, redDominance }
}

/**
 * Estimate BPM from collected samples.
 * Primary estimator: autocorrelation of the detrended signal — robust against
 * noise and the dicrotic bump inside each heartbeat. Peak counting then
 * cross-validates that the detected period is really present in the signal.
 */
export function estimateBpm(samples: PpgSample[], durationMs: number): PpgResult {
  const ts = samples.map((s) => s.t)
  const rs = samples.map((s) => s.r)
  const wave: { t: number; v: number }[] = []

  const usable = redIsUsable(samples)
  if (samples.length < 10 || !usable.ok) {
    return { bpm: null, problem: 'no-finger', wave }
  }

  // Detrend at ~2.5s window: kills breathing (slow) and hand drift, keeps 0.7–3 Hz pulse.
  const detrended = smooth3(detrend(rs, 2500, ts))
  for (let i = 0; i < detrended.length; i++) wave.push({ t: ts[i], v: detrended[i] })

  const spanMs = ts[ts.length - 1] - ts[0]
  if (spanMs < 8000) return { bpm: null, problem: 'too-noisy', wave }

  // -- Autocorrelation over the plausible IBI range (40–180 bpm → 333–1500 ms) --
  const stepMs = spanMs / detrended.length // median-ish frame gap
  const minLag = Math.max(2, Math.round(333 / stepMs))
  const maxLag = Math.min(detrended.length - 2, Math.round(1500 / stepMs))
  const mean = detrended.reduce((a, b) => a + b, 0) / detrended.length
  const centred = detrended.map((v) => v - mean)
  const energy = centred.reduce((a, v) => a + v * v, 0)
  if (energy <= 0) return { bpm: null, problem: 'too-noisy', wave }

  let bestR = -1
  let bestLag = -1
  const rByLag = new Map<number, number>()
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0
    for (let i = 0; i + lag < centred.length; i++) s += centred[i] * centred[i + lag]
    const r = s / energy // normalised autocorrelation
    rByLag.set(lag, r)
    if (r > bestR) { bestR = r; bestLag = lag }
  }
  // The pulse must actually be self-similar at the detected period.
  if (bestLag < 0 || bestR < 0.3) return { bpm: null, problem: 'too-noisy', wave }

  // Prefer the FIRST strong lag (half/double-period protection): shortest period
  // whose correlation reaches 80% of the best is the true fundamental.
  let fundamentalLag = bestLag
  for (let lag = minLag; lag < bestLag; lag++) {
    if ((rByLag.get(lag) ?? -1) >= 0.8 * bestR) { fundamentalLag = lag; break }
  }
  // Sub-frame precision: parabolic interpolation around the fundamental peak
  // (one frame step is ~6% of a 100bpm period; refine to ~1%).
  const rPrev = rByLag.get(fundamentalLag - 1) ?? -1
  const rHere = rByLag.get(fundamentalLag) ?? -1
  const rNext = rByLag.get(fundamentalLag + 1) ?? -1
  const denom = rPrev - 2 * rHere + rNext
  const delta = denom !== 0 ? (0.5 * (rPrev - rNext)) / denom : 0
  const ibiMs = (fundamentalLag + Math.max(-0.5, Math.min(0.5, delta))) * stepMs

  // -- Cross-validate with beat counting: Schmitt trigger, refractory 60% of IBI --
  const rms = Math.sqrt(energy / centred.length)
  const peaks = schmittBeats(detrended, ts, rms * 0.5, ibiMs * 0.6)
  const expectedBeats = spanMs / ibiMs
  if (peaks.length < 3 || Math.abs(peaks.length - expectedBeats) / expectedBeats > 0.45) {
    return { bpm: null, problem: 'too-noisy', wave }
  }

  const bpm = 60000 / ibiMs
  // A beat cannot arrive faster than 333ms; sanity-check against total duration too.
  if (bpm < 40 || bpm > 180 || durationMs / ibiMs < 2.5) {
    return { bpm: null, problem: 'too-noisy', wave }
  }

  return { bpm: Math.round(bpm), wave }
}

/** Human words for the result, used by both the camera UI and the before/after card. */
export function bpmLine(result: PpgResult): string {
  if (result.problem === 'no-finger') return "We couldn't see a fingertip — try resting your finger fully over the camera."
  if (result.problem === 'too-noisy') return 'That reading looked too unsteady. Try holding still for 20 seconds.'
  return `${result.bpm} bpm`
}