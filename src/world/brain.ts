// Mindspace Brain: the website's front door. A 3D brain drawn the way Obsidian draws a knowledge
// graph (glowing nodes, thin links, little signals running between them), with each region
// housing a part of the app. Scrolling flies the camera from region to region; dragging turns it.
import * as THREE from 'three'
import { REGIONS } from './regions'

export interface BrainWorld {
  setProgress: (p: number) => void
  resize: () => void
  dispose: () => void
}

interface Opts { onPick?: (regionIndex: number) => void }

/* ---------- shape ---------- */
// A brain from soft ellipsoids: two hemispheres, temporal lobes, cerebellum, brainstem.
type Ell = { c: THREE.Vector3; r: THREE.Vector3; side?: number }
const ELLS: Ell[] = [
  { c: new THREE.Vector3(0.53, 0.12, 0.05), r: new THREE.Vector3(0.56, 0.74, 1.3), side: 1 },
  { c: new THREE.Vector3(-0.53, 0.12, 0.05), r: new THREE.Vector3(0.56, 0.74, 1.3), side: -1 },
  { c: new THREE.Vector3(0.74, -0.34, 0.12), r: new THREE.Vector3(0.36, 0.34, 0.78), side: 1 },
  { c: new THREE.Vector3(-0.74, -0.34, 0.12), r: new THREE.Vector3(0.36, 0.34, 0.78), side: -1 },
  { c: new THREE.Vector3(0.3, -0.56, -0.92), r: new THREE.Vector3(0.42, 0.32, 0.4) },
  { c: new THREE.Vector3(-0.3, -0.56, -0.92), r: new THREE.Vector3(0.42, 0.32, 0.4) },
]
const STEM_A = new THREE.Vector3(0, -0.4, -0.3), STEM_B = new THREE.Vector3(0, -1.5, -0.52), STEM_R = 0.17

// Gentle folds so the cortex is not a smooth egg.
function fold(p: THREE.Vector3) {
  return 1 + 0.045 * Math.sin(p.x * 9 + p.y * 4) * Math.sin(p.z * 8 - p.y * 5) + 0.02 * Math.sin(p.z * 17 + p.x * 11)
}
const tmp = new THREE.Vector3()
// q < 1 inside. Values near 1 sit on the surface.
function shapeQ(p: THREE.Vector3) {
  let q = Infinity
  for (const e of ELLS) {
    if (e.side && Math.sign(p.x) !== e.side) continue
    tmp.copy(p).sub(e.c).divide(e.r)
    q = Math.min(q, tmp.length())
  }
  if (Math.abs(p.x) < 0.035 && p.y > 0.46) q = Math.max(q, 1.2) // the gap between hemispheres
  const ab = tmp.copy(STEM_B).sub(STEM_A)
  const t = Math.min(1, Math.max(0, p.clone().sub(STEM_A).dot(ab) / ab.lengthSq()))
  const d = p.distanceTo(STEM_A.clone().addScaledVector(ab, t)) / STEM_R
  return Math.min(q * fold(p), d)
}

// Seeded random so the brain looks the same on every visit.
function rng(seed: number) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
}

export function createBrain(canvas: HTMLCanvasElement, opts: Opts = {}): BrainWorld {
  const small = Math.min(window.innerWidth, window.innerHeight) < 700
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const rand = rng(20261020)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 100)
  const brain = new THREE.Group()
  scene.add(brain)

  /* ---------- nodes ---------- */
  const pts: THREE.Vector3[] = []
  const cortexCount = small ? 1050 : 1600
  while (pts.length < cortexCount) {
    const p = new THREE.Vector3((rand() * 2 - 1) * 1.15, rand() * 1.8 - 1.0, (rand() * 2 - 1) * 1.4)
    const q = shapeQ(p)
    if (q > 0.84 && q < 1) pts.push(p)
  }
  // Deep regions (amygdala, hippocampus, thalamus...) get their own clusters inside.
  const deepPer = small ? 22 : 34
  const centres: { pos: THREE.Vector3; region: number }[] = []
  REGIONS.forEach((r, i) => {
    if (!r.at) return
    const sides = r.bilateral ? [1, -1] : [1]
    for (const s of sides) {
      const c = new THREE.Vector3(r.at[0] * s, r.at[1], r.at[2])
      centres.push({ pos: c, region: i })
      let n = 0, guard = 0
      while (n < deepPer && guard++ < 4000) {
        const g = () => (rand() + rand() + rand() - 1.5) * r.radius * 0.9
        const p = c.clone().add(new THREE.Vector3(g(), g(), g()))
        if (shapeQ(p) < 1) { pts.push(p); n++ }
      }
    }
  })

  const N = pts.length
  const region = new Float32Array(N)
  const strength = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    let best = 0, bestS = 0
    for (const c of centres) {
      const r = REGIONS[c.region].radius
      const s = 1 - pts[i].distanceTo(c.pos) / r
      if (s > bestS) { bestS = s; best = c.region }
    }
    region[i] = best
    strength[i] = Math.min(1, bestS * 1.6)
  }

  const neutral = new THREE.Color('#8ea6d6')
  const colors = new Float32Array(N * 3), sizes = new Float32Array(N), phases = new Float32Array(N), delays = new Float32Array(N)
  const pos = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const p = pts[i]
    pos.set([p.x, p.y, p.z], i * 3)
    const col = neutral.clone().lerp(new THREE.Color(REGIONS[region[i]].color), strength[i])
    colors.set([col.r, col.g, col.b], i * 3)
    sizes[i] = (0.75 + rand() * 1.0) * (1 + strength[i] * 0.5)
    phases[i] = rand() * Math.PI * 2
    delays[i] = (1.4 - p.z) / 2.8 + rand() * 0.15 // the light spreads front to back
  }

  /* ---------- links (k nearest, like a graph) ---------- */
  const K = 3, maxD = 0.3
  const pairs = new Set<string>()
  const edges: [number, number][] = []
  for (let i = 0; i < N; i++) {
    const near: [number, number][] = []
    for (let j = 0; j < N; j++) {
      if (i === j) continue
      const d = pts[i].distanceToSquared(pts[j])
      if (d > maxD * maxD) continue
      if (near.length < K) { near.push([d, j]); near.sort((a, b) => a[0] - b[0]) }
      else if (d < near[K - 1][0]) { near[K - 1] = [d, j]; near.sort((a, b) => a[0] - b[0]) }
    }
    for (const [, j] of near) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (!pairs.has(key)) { pairs.add(key); edges.push([i, j]) }
    }
  }

  /* ---------- hubs: one bright node per region, linked to its members ---------- */
  const hubs: { pos: THREE.Vector3; region: number; label: boolean }[] = []
  centres.forEach((c) => hubs.push({ pos: c.pos, region: c.region, label: c.pos.x >= 0 || !REGIONS[c.region].bilateral }))
  const hubEdges: [THREE.Vector3, THREE.Vector3, number][] = []
  for (const h of hubs) {
    const members = pts.map((p, i) => [p.distanceToSquared(h.pos), i] as [number, number])
      .filter(([, i]) => region[i] === h.region).sort((a, b) => a[0] - b[0]).slice(0, small ? 12 : 18)
    for (const [, i] of members) hubEdges.push([h.pos, pts[i], h.region])
  }

  const common = {
    uTime: { value: 0 }, uIntro: { value: 0 }, uPix: { value: renderer.getPixelRatio() },
    uLevel: { value: new Array(REGIONS.length).fill(1) as number[] },
  }

  const nodeGeo = new THREE.BufferGeometry()
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  nodeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  nodeGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  nodeGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  nodeGeo.setAttribute('aDelay', new THREE.BufferAttribute(delays, 1))
  nodeGeo.setAttribute('aRegion', new THREE.BufferAttribute(region, 1))
  const nodeMat = new THREE.ShaderMaterial({
    uniforms: { ...common, uScale: { value: 46 } },
    vertexShader: /* glsl */ `
      uniform float uTime, uIntro, uPix, uScale; uniform float uLevel[${REGIONS.length}];
      attribute vec3 color; attribute float aSize, aPhase, aDelay, aRegion;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float k = clamp(uIntro * 1.7 - aDelay, 0.0, 1.0); k = k * k * (3.0 - 2.0 * k);
        float lvl = uLevel[int(aRegion + 0.5)];
        float pulse = 0.78 + 0.22 * sin(uTime * 1.4 + aPhase);
        vec4 mv = modelViewMatrix * vec4(position * mix(0.86, 1.0, k), 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * pulse * mix(0.6, 1.45, clamp(lvl - 0.4, 0.0, 1.0)) * uPix * uScale / -mv.z;
        vColor = color * (0.35 + 0.75 * lvl);
        vAlpha = k * (0.35 + 0.65 * min(lvl, 1.0));
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float core = smoothstep(0.5, 0.0, d);
        float a = (pow(core, 3.0) + 0.25 * core) * vAlpha;
        if (a < 0.01) discard;
        gl_FragColor = vec4(vColor * (0.7 + 0.9 * pow(core, 6.0)), a);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })
  brain.add(new THREE.Points(nodeGeo, nodeMat))

  // Links: graph edges plus the hub spokes.
  const L = edges.length + hubEdges.length
  const lp = new Float32Array(L * 6), lc = new Float32Array(L * 6), lr = new Float32Array(L * 2), ld = new Float32Array(L * 2)
  edges.forEach(([a, b], e) => {
    lp.set([...pts[a].toArray(), ...pts[b].toArray()], e * 6)
    lc.set([colors[a * 3], colors[a * 3 + 1], colors[a * 3 + 2], colors[b * 3], colors[b * 3 + 1], colors[b * 3 + 2]], e * 6)
    lr.set([region[a], region[b]], e * 2)
    ld.set([delays[a], delays[b]], e * 2)
  })
  hubEdges.forEach(([a, b, r], h) => {
    const e = edges.length + h
    const c = new THREE.Color(REGIONS[r].color)
    lp.set([...a.toArray(), ...b.toArray()], e * 6)
    lc.set([c.r, c.g, c.b, c.r, c.g, c.b], e * 6)
    lr.set([r, r], e * 2)
    const dl = (1.4 - a.z) / 2.8
    ld.set([dl, dl], e * 2)
  })
  const linkGeo = new THREE.BufferGeometry()
  linkGeo.setAttribute('position', new THREE.BufferAttribute(lp, 3))
  linkGeo.setAttribute('color', new THREE.BufferAttribute(lc, 3))
  linkGeo.setAttribute('aRegion', new THREE.BufferAttribute(lr, 1))
  linkGeo.setAttribute('aDelay', new THREE.BufferAttribute(ld, 1))
  const linkMat = new THREE.ShaderMaterial({
    uniforms: common,
    vertexShader: /* glsl */ `
      uniform float uIntro; uniform float uLevel[${REGIONS.length}];
      attribute vec3 color; attribute float aRegion, aDelay;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float k = clamp(uIntro * 1.7 - aDelay - 0.25, 0.0, 1.0);
        float lvl = uLevel[int(aRegion + 0.5)];
        vColor = color; vAlpha = k * (0.05 + 0.2 * lvl * lvl);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor; varying float vAlpha;
      void main() { gl_FragColor = vec4(vColor, vAlpha); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })
  brain.add(new THREE.LineSegments(linkGeo, linkMat))

  // Hub cores: bigger, brighter points.
  const hp = new Float32Array(hubs.length * 3), hc = new Float32Array(hubs.length * 3), hr = new Float32Array(hubs.length)
  hubs.forEach((h, i) => {
    hp.set(h.pos.toArray(), i * 3)
    const c = new THREE.Color(REGIONS[h.region].color)
    hc.set([c.r, c.g, c.b], i * 3)
    hr[i] = h.region
  })
  const hubGeo = new THREE.BufferGeometry()
  hubGeo.setAttribute('position', new THREE.BufferAttribute(hp, 3))
  hubGeo.setAttribute('color', new THREE.BufferAttribute(hc, 3))
  hubGeo.setAttribute('aRegion', new THREE.BufferAttribute(hr, 1))
  const hubMat = new THREE.ShaderMaterial({
    uniforms: common,
    vertexShader: /* glsl */ `
      uniform float uTime, uIntro, uPix; uniform float uLevel[${REGIONS.length}];
      attribute vec3 color; attribute float aRegion;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float lvl = uLevel[int(aRegion + 0.5)];
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        float beat = 1.0 + 0.12 * sin(uTime * 2.2 + aRegion);
        gl_PointSize = (2.4 + 4.2 * clamp(lvl - 0.4, 0.0, 1.0)) * beat * uPix * 46.0 / -mv.z;
        vColor = color; vAlpha = clamp(uIntro * 1.5 - 0.6, 0.0, 1.0) * (0.45 + 0.55 * min(lvl, 1.0));
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor; varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float ring = smoothstep(0.06, 0.0, abs(d - 0.36)) * 0.8;
        float core = smoothstep(0.22, 0.0, d);
        float halo = smoothstep(0.5, 0.0, d) * 0.25;
        float a = (core + ring + halo) * vAlpha;
        if (a < 0.01) discard;
        gl_FragColor = vec4(mix(vColor, vec3(1.0), core * 0.6), a);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })
  brain.add(new THREE.Points(hubGeo, hubMat))

  /* ---------- labels ---------- */
  const labels: { sprite: THREE.Sprite; region: number; mat: THREE.SpriteMaterial }[] = []
  for (const h of hubs) {
    if (!h.label) continue
    const r = REGIONS[h.region]
    const cv = document.createElement('canvas')
    cv.width = 640; cv.height = 140
    const g = cv.getContext('2d')!
    g.font = '600 50px "Space Grotesk", system-ui, sans-serif'
    g.fillStyle = '#f7efe6'
    g.fillText(r.name, 8, 58)
    g.font = '400 30px "JetBrains Mono", ui-monospace, monospace'
    g.fillStyle = r.color
    g.fillText(r.houses.slice(0, 2).join(' · ').toUpperCase(), 8, 112)
    const tex = new THREE.CanvasTexture(cv)
    tex.colorSpace = THREE.SRGBColorSpace
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, opacity: 0 })
    const s = new THREE.Sprite(mat)
    s.center.set(0, 0)
    s.scale.set(0.82, 0.18, 1)
    s.position.copy(h.pos).add(new THREE.Vector3(0.07, 0.07, 0))
    brain.add(s)
    labels.push({ sprite: s, region: h.region, mat })
  }

  /* ---------- signals running along the links ---------- */
  const S = reduce ? 30 : small ? 90 : 150
  const sigPos = new Float32Array(S * 3), sigCol = new Float32Array(S * 3)
  const sig = Array.from({ length: S }, () => ({ e: Math.floor(rand() * edges.length), t: rand(), v: 0.5 + rand() * 0.9 }))
  const sigGeo = new THREE.BufferGeometry()
  sigGeo.setAttribute('position', new THREE.BufferAttribute(sigPos, 3))
  sigGeo.setAttribute('color', new THREE.BufferAttribute(sigCol, 3))
  const sigMat = new THREE.PointsMaterial({
    size: small ? 0.05 : 0.04, vertexColors: true, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, map: dotTexture(), opacity: 0,
  })
  brain.add(new THREE.Points(sigGeo, sigMat))
  const edgesByRegion = new Map<number, number[]>()
  edges.forEach(([a], e) => {
    const r = region[a]
    if (!r || strength[a] < 0.2) return
    if (!edgesByRegion.has(r)) edgesByRegion.set(r, [])
    edgesByRegion.get(r)!.push(e)
  })

  /* ---------- far dust ---------- */
  const dustN = small ? 260 : 480
  const dust = new Float32Array(dustN * 3)
  for (let i = 0; i < dustN; i++) {
    const v = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize().multiplyScalar(9 + rand() * 14)
    dust.set(v.toArray(), i * 3)
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dust, 3))
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.06, color: 0x9fb4ff, transparent: true, opacity: 0.35, depthWrite: false, map: dotTexture(), blending: THREE.AdditiveBlending,
  })))

  /* ---------- camera rig ---------- */
  let progress = 0
  let active = 0
  const center = new THREE.Vector3(0, -0.12, 0)
  const view = { az: REGIONS[0].view[0], el: REGIONS[0].view[1], dist: REGIONS[0].view[2], target: center.clone() }
  const want = { ...view, target: center.clone() }
  const regionTarget = (i: number) => {
    const r = REGIONS[i]
    if (!r.at) return center.clone()
    return center.clone().lerp(new THREE.Vector3(Math.abs(r.at[0]), r.at[1], r.at[2]), 0.55)
  }
  function rig(p: number) {
    const f = p * (REGIONS.length - 1)
    const i = Math.min(REGIONS.length - 2, Math.floor(f))
    let t = f - i
    t = t * t * (3 - 2 * t)
    const a = REGIONS[i].view, b = REGIONS[i + 1].view
    want.az = a[0] + (b[0] - a[0]) * t
    want.el = a[1] + (b[1] - a[1]) * t
    want.dist = a[2] + (b[2] - a[2]) * t
    want.target.copy(regionTarget(i)).lerp(regionTarget(i + 1), t)
    active = Math.round(f)
  }

  // Drag to turn the brain (horizontal only, so vertical swipes still scroll the page).
  let yaw = 0, dragging = false, lastX = 0, downX = 0, downY = 0
  const onDown = (e: PointerEvent) => { dragging = true; lastX = downX = e.clientX; downY = e.clientY }
  const onMove = (e: PointerEvent) => {
    if (dragging) { yaw += (e.clientX - lastX) * 0.35; lastX = e.clientX }
    canvas.style.cursor = pickAt(e.clientX, e.clientY) >= 0 ? 'pointer' : dragging ? 'grabbing' : 'grab'
  }
  const onUp = (e: PointerEvent) => {
    dragging = false
    if (Math.hypot(e.clientX - downX, e.clientY - downY) < 6) {
      const r = pickAt(e.clientX, e.clientY)
      if (r >= 0) opts.onPick?.(r)
    }
  }
  const onCancel = () => { dragging = false }
  canvas.addEventListener('pointerdown', onDown)
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onCancel)

  const proj = new THREE.Vector3()
  function pickAt(x: number, y: number) {
    const rect = canvas.getBoundingClientRect()
    let best = -1, bestD = (small ? 40 : 30) ** 2
    for (const h of hubs) {
      proj.copy(h.pos).applyMatrix4(brain.matrixWorld).project(camera)
      const sx = rect.left + (proj.x * 0.5 + 0.5) * rect.width
      const sy = rect.top + (-proj.y * 0.5 + 0.5) * rect.height
      const d = (sx - x) ** 2 + (sy - y) ** 2
      if (d < bestD) { bestD = d; best = h.region }
    }
    return best
  }

  /* ---------- frame ---------- */
  let raf = 0
  const clock = new THREE.Clock()
  const levels = common.uLevel.value
  const curTarget = center.clone()
  let introStart = -1, lastT = 0
  function frame() {
    const t = clock.getElapsedTime()
    if (introStart < 0) introStart = t
    common.uTime.value = t * (reduce ? 0.3 : 1)
    common.uIntro.value = reduce ? 1 : Math.min(1, (t - introStart) / 2.6)
    rig(progress)

    // Ease the camera toward where the scroll says it should be.
    const ease = 0.06
    view.az += (want.az - view.az) * ease
    view.el += (want.el - view.el) * ease
    view.dist += (want.dist - view.dist) * ease
    curTarget.lerp(want.target, ease)
    if (!dragging) yaw *= 0.985
    const drift = reduce ? 0 : Math.sin(t * 0.12) * 6
    const az = THREE.MathUtils.degToRad(view.az + yaw + drift)
    const el = THREE.MathUtils.degToRad(view.el)
    const portrait = camera.aspect < 1
    const dist = view.dist * (portrait ? Math.min(2.3, Math.max(1, 0.95 / camera.aspect)) : 1)
    camera.position.set(
      curTarget.x + dist * Math.sin(az) * Math.cos(el),
      curTarget.y + dist * Math.sin(el),
      curTarget.z + dist * Math.cos(az) * Math.cos(el),
    )
    camera.lookAt(curTarget)
    brain.scale.setScalar(1 + (reduce ? 0 : 0.012 * Math.sin(t * 0.9)))

    // Light up the active region, dim the rest.
    const focused = !!REGIONS[active].at
    for (let i = 0; i < levels.length; i++) {
      const goal = !focused ? 1 : i === active ? 1.9 : 0.42
      levels[i] += (goal - levels[i]) * 0.08
    }
    for (const l of labels) {
      const goal = focused && l.region === active ? 1 : 0
      l.mat.opacity += (goal * Math.min(1, Math.max(0, common.uIntro.value * 2 - 1.2)) - l.mat.opacity) * 0.1
    }

    // Move the signals; when a region is in focus most of them run inside it.
    const dt = Math.min(0.05, t - lastT)
    lastT = t
    const pool = focused ? edgesByRegion.get(active) : undefined
    for (let s = 0; s < S; s++) {
      const g = sig[s]
      g.t += g.v * dt * 1.4
      if (g.t >= 1) {
        g.t = 0
        g.e = pool && pool.length && rand() < 0.7 ? pool[Math.floor(rand() * pool.length)] : Math.floor(rand() * edges.length)
      }
      const [a, b] = edges[g.e]
      const pa = pts[a], pb = pts[b]
      sigPos[s * 3] = pa.x + (pb.x - pa.x) * g.t
      sigPos[s * 3 + 1] = pa.y + (pb.y - pa.y) * g.t
      sigPos[s * 3 + 2] = pa.z + (pb.z - pa.z) * g.t
      const glow = Math.sin(g.t * Math.PI)
      sigCol[s * 3] = (0.6 + colors[a * 3] * 0.6) * glow
      sigCol[s * 3 + 1] = (0.6 + colors[a * 3 + 1] * 0.6) * glow
      sigCol[s * 3 + 2] = (0.6 + colors[a * 3 + 2] * 0.6) * glow
    }
    sigGeo.attributes.position.needsUpdate = true
    sigGeo.attributes.color.needsUpdate = true
    sigMat.opacity = Math.min(1, Math.max(0, common.uIntro.value * 2 - 1))

    renderer.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // Keep the brain clear of the story card: higher on phones, to the right on wide screens.
    if (w < h) camera.setViewOffset(w, h, 0, h * 0.22, w, h)
    else if (w >= 900) camera.setViewOffset(w, h, -w * 0.13, 0, w, h)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
    nodeMat.uniforms.uScale.value = 46 * (h / 900)
  }
  resize()
  frame()

  return {
    setProgress: (p) => { progress = Math.min(1, Math.max(0, p)) },
    resize,
    dispose: () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onCancel)
      renderer.dispose()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose?.()
        const mat = m.material as (THREE.Material & { map?: THREE.Texture }) | undefined
        mat?.map?.dispose?.()
        mat?.dispose?.()
      })
    },
  }
}

let dot: THREE.Texture | null = null
function dotTexture() {
  if (dot) return dot
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.3, 'rgba(255,255,255,.5)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  dot = new THREE.CanvasTexture(c)
  return dot
}
