// "Your week as music" (Batch B). Turns the last 7 check-ins into a 30-60s
// calm ambient piece with the Web Audio API. No audio files, nothing external.
//
// Mapping: the week's average mood sets the key (root note), brightness
// (major vs minor colour) and tempo (swell length). Each checked-in day becomes
// a slow chord swell; missing days become rests. A soft drone holds the key.
import { localDay } from '../lib/db'

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

export interface WeekSegment {
  date: string
  weekday: string
  mood: number | null // null = missing day (rest)
  start: number
  len: number
}

export interface WeekSound {
  segments: WeekSegment[]
  duration: number
  baseMidi: number
  major: boolean
  hasAny: boolean
}

// The last 7 calendar days (oldest first), ending today, with the mood for
// each day from the moods list (date -> mood).
export function buildWeekSound(moods: { date: string; mood: number }[]): WeekSound {
  const byDate = new Map(moods.map((m) => [m.date, m.mood]))
  const segments: WeekSegment[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const date = localDay(d)
    segments.push({
      date,
      weekday: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
      mood: byDate.has(date) ? (byDate.get(date) as number) : null,
      start: 0, // set below
      len: 0,
    })
  }

  const checked = segments.filter((s) => s.mood !== null) as { mood: number }[]
  const hasAny = checked.length > 0
  const avg = hasAny ? checked.reduce((s, c) => s + c.mood, 0) / checked.length : 2

  // Key from the week's average mood: darker and lower for hard weeks,
  // brighter and higher for good ones.
  const baseMidi = [45, 48, 50, 53, 55][Math.max(0, Math.min(4, Math.round(avg)))]
  const major = avg >= 2.5
  // Tempo: slower swells on heavy weeks, a touch more movement on bright ones.
  const segLen = 6.4 - avg * 0.5
  segments.forEach((s, i) => {
    s.start = i * segLen
    s.len = segLen
  })
  const duration = 7 * segLen + 3 // + a tail to let the last swell fade

  return { segments, duration, baseMidi, major, hasAny }
}

type Ctx = BaseAudioContext

function tone(ctx: Ctx, dest: AudioNode, t: number, midi: number, len: number, peak: number, pan: number, type: OscillatorType = 'sine') {
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.linearRampToValueAtTime(peak, t + len * 0.42)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + len * 1.9)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 1100
  filter.Q.value = 0.4

  let out: AudioNode = filter
  if (typeof (ctx as Ctx & { createStereoPanner?: unknown }).createStereoPanner === 'function') {
    const p = ctx.createStereoPanner()
    p.pan.value = pan
    filter.connect(p)
    out = p
  }
  out.connect(gain)
  gain.connect(dest)

  const o1 = ctx.createOscillator()
  o1.type = type
  o1.frequency.value = midiToFreq(midi)
  const o2 = ctx.createOscillator()
  o2.type = 'sine'
  o2.frequency.value = midiToFreq(midi) * 1.0018 // slight detune for warmth
  o1.connect(filter)
  o2.connect(filter)
  o1.start(t)
  o2.start(t)
  o1.stop(t + len * 2)
  o2.stop(t + len * 2)
}

// Schedules the whole piece onto any context (online or offline).
export function scheduleWeek(ctx: Ctx, ws: WeekSound) {
  const t0 = ctx.currentTime + 0.08
  const master = ctx.createGain()
  master.gain.value = 0.9
  const soften = ctx.createBiquadFilter()
  soften.type = 'lowpass'
  soften.frequency.value = 1800
  soften.connect(master)
  master.connect(ctx.destination)

  // A soft drone holds the key for the whole piece.
  const droneGain = ctx.createGain()
  droneGain.gain.setValueAtTime(0.0001, t0)
  droneGain.gain.linearRampToValueAtTime(0.05, t0 + ws.duration * 0.45)
  droneGain.gain.linearRampToValueAtTime(0.0001, t0 + ws.duration)
  const drone = ctx.createOscillator()
  drone.type = 'sine'
  drone.frequency.value = midiToFreq(ws.baseMidi)
  const drone5 = ctx.createOscillator()
  drone5.type = 'sine'
  drone5.frequency.value = midiToFreq(ws.baseMidi + 12)
  drone.connect(droneGain)
  drone5.connect(droneGain)
  droneGain.connect(soften)
  drone.start(t0)
  drone5.start(t0)
  drone.stop(t0 + ws.duration)
  drone5.stop(t0 + ws.duration)

  ws.segments.forEach((seg, i) => {
    if (seg.mood === null) return // a missing day is a rest
    const t = t0 + seg.start
    const pan = (i / 6) * 1.2 - 0.6
    // Alternate the resting tone of the chord so the week keeps moving.
    const root = ws.baseMidi + (i % 2 === 0 ? 0 : 5)
    tone(ctx, soften, t, root, seg.len, 0.14, pan)
    tone(ctx, soften, t, root + 7, seg.len, 0.1, pan)
    // Colour: a good day leans major, a hard day leans minor.
    const third = seg.mood >= 3 ? 4 : 3
    tone(ctx, soften, t, root + 12 + third, seg.len, 0.08, pan * 0.5)
    if (seg.mood >= 3) tone(ctx, soften, t, root + 24, seg.len, 0.035, pan * 0.3)
  })
}

// Renders the piece to an AudioBuffer (for the WAV export).
export async function renderWeekWav(ws: WeekSound): Promise<Blob> {
  const sampleRate = 44100
  const offline = new OfflineAudioContext(2, Math.ceil(sampleRate * (ws.duration + 0.5)), sampleRate)
  scheduleWeek(offline, ws)
  const buffer = await offline.startRendering()
  return encodeWav(buffer)
}

// Standard 16-bit PCM WAV encoder.
function encodeWav(buffer: AudioBuffer): Blob {
  const numCh = Math.min(2, buffer.numberOfChannels)
  const len = buffer.length
  const bytesPerSample = 2
  const blockAlign = numCh * bytesPerSample
  const dataSize = len * blockAlign
  const ab = new ArrayBuffer(44 + dataSize)
  const view = new DataView(ab)
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i))
  }
  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, numCh, true)
  view.setUint32(24, buffer.sampleRate, true)
  view.setUint32(28, buffer.sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)
  writeStr(36, 'data')
  view.setUint32(40, dataSize, true)

  const chans: Float32Array[] = []
  for (let c = 0; c < numCh; c++) chans.push(buffer.getChannelData(c))
  let off = 44
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, chans[c][i]))
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true)
      off += 2
    }
  }
  return new Blob([ab], { type: 'audio/wav' })
}