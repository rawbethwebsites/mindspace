// Mindspace World: a scroll-told dawn landscape (Three.js). Scrolling moves the camera from
// station to station; each station is one part of the app. The sun rises as you go.
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export interface Station {
  cam: [number, number, number]
  look: [number, number, number]
}

// Camera keyframes, one per story chapter (keep in sync with CHAPTERS in World.tsx).
export const STATIONS: Station[] = [
  { cam: [0, 22, 70], look: [0, 6, -60] }, // 0 valley at dawn
  { cam: [9, 5.5, 9], look: [0, 2.2, -10] }, // 1 mood lake
  { cam: [-17, 6.5, -33], look: [-30, 5, -52] }, // 2 journal grove
  { cam: [21, 7.5, -76], look: [10, 1.6, -92] }, // 3 breathing stones
  { cam: [-15, 6, -111], look: [-15, 3.2, -132] }, // 4 companions
  { cam: [26, 5.5, -149], look: [25, 2, -167] }, // 5 tools garden
  { cam: [-7, 6.5, -189], look: [-20, 3.6, -203] }, // 6 vault
  { cam: [1, 9, -216], look: [15, 8, -242] }, // 7 lighthouse
  { cam: [0, 26, -205], look: [0, 18, -330] }, // 8 sunrise over the sea
]

const SITES = {
  lake: new THREE.Vector2(0, -10),
  grove: new THREE.Vector2(-30, -52),
  stones: new THREE.Vector2(10, -92),
  companions: new THREE.Vector2(-15, -132),
  tools: new THREE.Vector2(25, -167),
  vault: new THREE.Vector2(-20, -203),
  lighthouse: new THREE.Vector2(15, -242),
}

/* ---------- noise ---------- */
function hash(x: number, z: number) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return s - Math.floor(s)
}
function vnoise(x: number, z: number) {
  const xi = Math.floor(x), zi = Math.floor(z)
  const xf = x - xi, zf = z - zi
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf)
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
function fbm(x: number, z: number) {
  let s = 0, amp = 0.5, f = 1
  for (let i = 0; i < 4; i++) { s += amp * vnoise(x * f, z * f); f *= 2.1; amp *= 0.5 }
  return s
}
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

// Ground height: rolling valley, flat pads at each station, a lake and the sea at the end.
export function heightAt(x: number, z: number) {
  let h = 1.0 + (fbm(x * 0.03 + 7, z * 0.03) - 0.5) * 5 + Math.max(0, Math.abs(x) - 42) * 0.45
  for (const [k, s] of Object.entries(SITES)) {
    if (k === 'lake' || k === 'lighthouse') continue
    const d = Math.hypot(x - s.x, z - s.y)
    h = h + (1.2 - h) * smooth(16, 7, d)
  }
  const dl = Math.hypot(x - SITES.lake.x, z - SITES.lake.y)
  h = h + (-2.6 - h) * smooth(17, 10, dl)
  h = h + (-3.2 - h) * smooth(-212, -232, z)
  const dr = Math.hypot(x - SITES.lighthouse.x, z - SITES.lighthouse.y)
  h = h + (2.6 - h) * smooth(9, 5, dr)
  return h
}

/* ---------- helpers ---------- */
function glowTexture(inner = 'rgba(255,240,210,1)', outer = 'rgba(255,170,90,0)') {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, inner)
  grd.addColorStop(0.35, inner.replace(/[\d.]+\)$/, '0.45)'))
  grd.addColorStop(1, outer)
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
function halo(color: string, size: number) {
  const m = new THREE.SpriteMaterial({ map: glowTexture(color, 'rgba(0,0,0,0)'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })
  const s = new THREE.Sprite(m)
  s.scale.set(size, size, 1)
  return s
}
function letterSprite(letter: string, color: string) {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = color
  g.font = '600 84px "Space Grotesk", system-ui, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(letter, 64, 70)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }))
  s.scale.set(1.4, 1.4, 1)
  return s
}
const std = (color: number | string, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, flatShading: true, ...extra })

/* ---------- world ---------- */
export interface World {
  setProgress: (p: number) => void
  resize: () => void
  dispose: () => void
}

export function createWorld(canvas: HTMLCanvasElement): World {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 900)
  const fogColor = new THREE.Color('#2a2238')
  scene.fog = new THREE.FogExp2(fogColor, 0.0085)

  /* sky: gradient dome whose colours warm as the sun rises */
  const skyUniforms = {
    uTop: { value: new THREE.Color('#0b1530') },
    uMid: { value: new THREE.Color('#5b3a5e') },
    uHorizon: { value: new THREE.Color('#e48a5a') },
    uSunDir: { value: new THREE.Vector3(0, 0.05, -1).normalize() },
    uSunColor: { value: new THREE.Color('#ffd59a') },
  }
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(600, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyUniforms,
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uTop,uMid,uHorizon,uSunDir,uSunColor; varying vec3 vDir;
        void main(){ float h = vDir.y;
          vec3 c = mix(uHorizon, uMid, smoothstep(-0.02, 0.22, h)); c = mix(c, uTop, smoothstep(0.18, 0.7, h));
          float s = max(dot(normalize(vDir), uSunDir), 0.0);
          c += uSunColor * (pow(s, 600.0) * 3.0 + pow(s, 24.0) * 0.35 + pow(s, 4.0) * 0.12);
          gl_FragColor = vec4(c, 1.0); }`,
    }),
  )
  scene.add(sky)

  const sunGlow = halo('rgba(255,226,170,1)', 120)
  scene.add(sunGlow)

  /* lights */
  const hemi = new THREE.HemisphereLight('#ffd7b0', '#1d2a33', 0.9)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight('#ffc48a', 1.6)
  scene.add(sun)

  /* terrain */
  const SIZE = 420, SEG = 150
  const tg = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG)
  tg.rotateX(-Math.PI / 2)
  tg.translate(0, 0, -130)
  const pos = tg.attributes.position as THREE.BufferAttribute
  const colors: number[] = []
  const low = new THREE.Color('#2f4a3d'), mid = new THREE.Color('#5a6b45'), high = new THREE.Color('#8a6a52'), sand = new THREE.Color('#b8956e')
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i)
    const y = heightAt(x, z)
    pos.setY(i, y)
    const c = y < 0.4 ? sand.clone() : y < 4 ? low.clone().lerp(mid, (y - 0.4) / 3.6) : mid.clone().lerp(high, Math.min(1, (y - 4) / 10))
    colors.push(c.r, c.g, c.b)
  }
  tg.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  tg.computeVertexNormals()
  scene.add(new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 })))

  /* water: lake + sea share one plane; colour from view angle plus a sun glint */
  const waterUniforms = { uTime: { value: 0 }, uSunDir: skyUniforms.uSunDir, uDeep: { value: new THREE.Color('#15243a') }, uShallow: { value: new THREE.Color('#e08a62') } }
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(900, 900, 1, 1).rotateX(-Math.PI / 2).translate(0, 0, -200),
    new THREE.ShaderMaterial({
      transparent: true, uniforms: waterUniforms,
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform float uTime; uniform vec3 uSunDir,uDeep,uShallow; varying vec3 vW;
        void main(){ vec3 v = normalize(cameraPosition - vW);
          // Several waves at odd angles and scales so the surface never looks tiled.
          float a = sin(dot(vW.xz, vec2(0.21, 0.13)) + uTime*0.7);
          float b = sin(dot(vW.xz, vec2(-0.11, 0.29)) - uTime*0.55);
          float w3 = sin(dot(vW.xz, vec2(0.47, -0.31)) + uTime*1.3) * 0.4;
          float w4 = sin(dot(vW.xz, vec2(-0.83, -0.57)) - uTime*1.9) * 0.2;
          vec3 n = normalize(vec3((a + w3) * 0.07, 1.0, (b + w4) * 0.07));
          float fres = pow(1.0 - max(dot(v, n), 0.0), 3.0);
          vec3 c = mix(uDeep, uShallow, fres*0.85);
          vec3 refl = reflect(-v, n); float g = pow(max(dot(refl, uSunDir), 0.0), 140.0);
          c += vec3(1.0,0.85,0.6) * g * 1.6;
          gl_FragColor = vec4(c, 0.92); }`,
    }),
  )
  scene.add(water)

  const animated: ((t: number) => void)[] = []
  const at = (x: number, z: number, lift = 0) => new THREE.Vector3(x, heightAt(x, z) + lift, z)

  /* 1 · mood lake: five feelings floating over the water */
  const moodColors = ['#f0505c', '#f88820', '#f8b830', '#f6a04a', '#6ab070']
  moodColors.forEach((col, i) => {
    const g = new THREE.Group()
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 16), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.9, roughness: 0.3 }))
    g.add(orb, halo(hexA(col, 1), 4))
    const angle = (i - 2) * 0.55
    g.position.set(SITES.lake.x + Math.sin(angle) * 6, 2.2, SITES.lake.y - Math.cos(angle) * 4)
    scene.add(g)
    animated.push((t) => { g.position.y = 2.2 + Math.sin(t * 0.9 + i) * 0.35 })
  })

  /* 2 · journal grove: trees and paper lanterns drifting up */
  const trunk = std('#3b2a22'), leaf = std('#2c5a46')
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2, r = 9 + hash(i, 3) * 9
    const x = SITES.grove.x + Math.cos(a) * r, z = SITES.grove.y + Math.sin(a) * r
    const t = new THREE.Group()
    const s = 0.8 + hash(i, 9) * 0.9
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 1.6, 6), trunk); tr.position.y = 0.8
    const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3.2, 7), leaf); c1.position.y = 2.8
    const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.4, 7), leaf); c2.position.y = 4.1
    t.add(tr, c1, c2); t.scale.setScalar(s); t.position.copy(at(x, z))
    scene.add(t)
  }
  for (let i = 0; i < 14; i++) {
    const lantern = new THREE.Group()
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.5, 8), new THREE.MeshStandardMaterial({ color: '#ffd9a0', emissive: '#ffb45c', emissiveIntensity: 1.4 }))
    lantern.add(body, halo('rgba(255,200,120,1)', 2.2))
    const ox = (hash(i, 1) - 0.5) * 14, oz = (hash(i, 2) - 0.5) * 12, speed = 0.25 + hash(i, 5) * 0.25, phase = hash(i, 7) * 10
    scene.add(lantern)
    animated.push((t) => {
      const y = ((t * speed + phase) % 9)
      lantern.position.set(SITES.grove.x + ox + Math.sin(t * 0.4 + i) * 0.4, 2 + y, SITES.grove.y + oz)
      ;(lantern.children[0] as THREE.Mesh).scale.setScalar(y > 7.5 ? Math.max(0, 1 - (y - 7.5) / 1.5) : 1)
    })
  }

  /* 3 · breathing stones: a ring that breathes 4-4-4-4 */
  const stoneMat = std('#6f6a66')
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2
    const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9 + hash(i, 4) * 0.5, 0), stoneMat)
    st.position.copy(at(SITES.stones.x + Math.cos(a) * 6, SITES.stones.y + Math.sin(a) * 6, 0.5))
    st.rotation.set(hash(i, 1) * 3, hash(i, 2) * 3, 0)
    scene.add(st)
  }
  const breathRing = new THREE.Mesh(new THREE.TorusGeometry(3, 0.12, 12, 64), new THREE.MeshStandardMaterial({ color: '#ffd59a', emissive: '#f2bd5b', emissiveIntensity: 1.8 }))
  breathRing.rotation.x = -Math.PI / 2
  breathRing.position.copy(at(SITES.stones.x, SITES.stones.y, 0.4))
  scene.add(breathRing)
  const breathGlow = halo('rgba(242,189,91,1)', 9)
  breathGlow.position.copy(breathRing.position).add(new THREE.Vector3(0, 0.6, 0))
  scene.add(breathGlow)
  animated.push((t) => {
    const ph = t % 16 // in 4 · hold 4 · out 4 · hold 4
    const k = ph < 4 ? ph / 4 : ph < 8 ? 1 : ph < 12 ? 1 - (ph - 8) / 4 : 0
    const e = k * k * (3 - 2 * k)
    breathRing.scale.setScalar(0.75 + e * 0.55)
    breathGlow.scale.setScalar(7 + e * 6)
  })

  /* 4 · companions: five lights on pedestals */
  const comps: [string, string, string][] = [['S', '#d9542b', '#f2bd5b'], ['K', '#2f6f73', '#7fb7a9'], ['T', '#e48a1f', '#f6d36b'], ['A', '#5b7fa6', '#a9c3dc'], ['D', '#4b5a6a', '#c9d2dc']]
  comps.forEach(([letter, c1, c2], i) => {
    const a = (i - 2) * 0.42
    const x = SITES.companions.x + Math.sin(a) * 9, z = SITES.companions.y - Math.cos(a) * 5
    const base = at(x, z)
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 1.6, 8), std('#3a3d44'))
    ped.position.copy(base).add(new THREE.Vector3(0, 0.8, 0))
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.85, 28, 18), new THREE.MeshStandardMaterial({ color: c2, emissive: c1, emissiveIntensity: 1.1, roughness: 0.35 }))
    const glow = halo(hexA(c2, 1), 5)
    const label = letterSprite(letter, '#fff7ec')
    scene.add(ped, orb, glow, label)
    animated.push((t) => {
      const y = base.y + 2.9 + Math.sin(t * 1.1 + i * 1.3) * 0.25
      orb.position.set(x, y, z); glow.position.set(x, y, z); label.position.set(x, y + 1.6, z)
    })
  })

  /* 5 · tools garden: a fire to burn worries, a jar of wins, a letter in the air */
  const fireBase = at(SITES.tools.x - 4, SITES.tools.y)
  for (let i = 0; i < 4; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.8, 6), std('#4a3326'))
    log.rotation.z = Math.PI / 2; log.rotation.y = (i / 4) * Math.PI
    log.position.copy(fireBase).add(new THREE.Vector3(0, 0.2, 0))
    scene.add(log)
  }
  const EMB = 160
  const ember = new THREE.BufferGeometry()
  const ep = new Float32Array(EMB * 3), seeds = new Float32Array(EMB)
  for (let i = 0; i < EMB; i++) seeds[i] = hash(i, 11)
  ember.setAttribute('position', new THREE.BufferAttribute(ep, 3))
  const emberPts = new THREE.Points(ember, new THREE.PointsMaterial({ size: 0.35, map: glowTexture('rgba(255,170,80,1)', 'rgba(255,80,20,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#ffb066' }))
  scene.add(emberPts)
  const fireGlow = halo('rgba(255,140,60,1)', 7); fireGlow.position.copy(fireBase).add(new THREE.Vector3(0, 1.2, 0)); scene.add(fireGlow)
  animated.push((t) => {
    for (let i = 0; i < EMB; i++) {
      const life = (t * (0.5 + seeds[i] * 0.6) + seeds[i] * 10) % 1
      const r = (1 - life) * 0.7
      ep[i * 3] = fireBase.x + Math.sin(seeds[i] * 40 + t * 2) * r
      ep[i * 3 + 1] = fireBase.y + 0.3 + life * 3.2
      ep[i * 3 + 2] = fireBase.z + Math.cos(seeds[i] * 33 + t * 2) * r
    }
    ember.attributes.position.needsUpdate = true
    fireGlow.scale.setScalar(6.5 + Math.sin(t * 9) * 0.5 + Math.sin(t * 13) * 0.3)
  })
  const jarPos = at(SITES.tools.x + 4, SITES.tools.y)
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.4, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#cfe6ff', transparent: true, opacity: 0.22, roughness: 0.05, side: THREE.DoubleSide }))
  jar.position.copy(jarPos).add(new THREE.Vector3(0, 1.2, 0))
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.25, 24), std('#8a6a52'))
  lid.position.copy(jarPos).add(new THREE.Vector3(0, 2.5, 0))
  scene.add(jar, lid)
  for (let i = 0; i < 14; i++) {
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshStandardMaterial({ color: '#fff3c4', emissive: '#f2bd5b', emissiveIntensity: 2 }))
    scene.add(w)
    const r = hash(i, 3) * 0.8, a0 = hash(i, 4) * 6.28, h0 = 0.3 + hash(i, 5) * 1.6
    animated.push((t) => { const a = a0 + t * 0.4; w.position.set(jarPos.x + Math.cos(a) * r, jarPos.y + h0 + Math.sin(t + i) * 0.1, jarPos.z + Math.sin(a) * r) })
  }
  const jarGlow = halo('rgba(255,220,140,1)', 5)
  jarGlow.position.copy(jarPos).add(new THREE.Vector3(0, 1.3, 0))
  scene.add(jarGlow)
  const envelope = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), new THREE.MeshStandardMaterial({ color: '#fff6ea', side: THREE.DoubleSide, emissive: '#3a2a1a', emissiveIntensity: 0.2 }))
  scene.add(envelope)
  animated.push((t) => { envelope.position.set(SITES.tools.x + Math.cos(t * 0.5) * 3, 4.2 + Math.sin(t) * 0.4, SITES.tools.y + Math.sin(t * 0.5) * 3); envelope.rotation.set(Math.sin(t) * 0.3, t * 0.5, Math.sin(t * 0.7) * 0.2) })

  /* 6 · the vault: everything stays inside */
  const vaultPos = at(SITES.vault.x, SITES.vault.y)
  const vault = new THREE.Mesh(new RoundedBoxGeometry(6, 5, 5, 4, 0.9), new THREE.MeshStandardMaterial({ color: '#b9aea4', roughness: 0.7, metalness: 0.05, emissive: '#3a2418', emissiveIntensity: 0.35 }))
  vault.position.copy(vaultPos).add(new THREE.Vector3(0, 2.5, 0))
  const door = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.3, 32), new THREE.MeshStandardMaterial({ color: '#2a2d33', metalness: 0.6, roughness: 0.35 }))
  door.rotation.x = Math.PI / 2; door.position.copy(vaultPos).add(new THREE.Vector3(0, 2.4, 2.6))
  const lockRing = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.09, 10, 48), new THREE.MeshStandardMaterial({ color: '#ef7851', emissive: '#d9542b', emissiveIntensity: 1.6 }))
  lockRing.position.copy(door.position).add(new THREE.Vector3(0, 0, 0.2))
  scene.add(vault, door, lockRing)
  for (let i = 0; i < 18; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshStandardMaterial({ color: '#ffe0b8', emissive: '#f2bd5b', emissiveIntensity: 2 }))
    scene.add(p)
    const r = 4.2 + hash(i, 1) * 1.2, sp = 0.3 + hash(i, 2) * 0.3, a0 = hash(i, 3) * 6.28, h = 1 + hash(i, 4) * 3.5
    animated.push((t) => { const a = a0 + t * sp; p.position.set(vaultPos.x + Math.cos(a) * r, vaultPos.y + h, vaultPos.z + Math.sin(a) * r) })
  }
  animated.push((t) => { lockRing.rotation.z = t * 0.6 })

  /* 7 · lighthouse: help is always lit */
  const lhBase = at(SITES.lighthouse.x, SITES.lighthouse.y)
  const tower = new THREE.Group()
  for (let i = 0; i < 5; i++) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(1.25 - i * 0.12, 1.37 - i * 0.12, 2, 16), std(i % 2 ? '#d9542b' : '#f4efe8'))
    seg.position.y = 1 + i * 2
    tower.add(seg)
  }
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 12), new THREE.MeshStandardMaterial({ color: '#fff4d6', emissive: '#ffd59a', emissiveIntensity: 3 }))
  lamp.position.y = 10.8
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.3, 16), std('#2a2d33')); cap.position.y = 12
  tower.add(lamp, cap)
  tower.position.copy(lhBase)
  scene.add(tower)
  const lampGlow = halo('rgba(255,230,180,1)', 9); lampGlow.position.copy(lhBase).add(new THREE.Vector3(0, 10.8, 0)); scene.add(lampGlow)
  const beam = new THREE.Mesh(new THREE.ConeGeometry(3.2, 40, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#ffe3b0', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }))
  beam.geometry.translate(0, -20, 0)
  beam.rotation.z = Math.PI / 2
  const beamPivot = new THREE.Group(); beamPivot.position.copy(lamp.position).add(lhBase); beamPivot.add(beam); scene.add(beamPivot)
  animated.push((t) => { beamPivot.rotation.y = t * 0.7 })

  /* fireflies along the whole path */
  const FF = 380
  const ffGeo = new THREE.BufferGeometry()
  const ffPos = new Float32Array(FF * 3)
  const ffBase: [number, number, number, number][] = []
  for (let i = 0; i < FF; i++) {
    const z = 20 - hash(i, 1) * 250, x = (hash(i, 2) - 0.5) * 70
    ffBase.push([x, Math.max(0.5, heightAt(x, z)) + 1 + hash(i, 3) * 6, z, hash(i, 4) * 10])
  }
  ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3))
  const ffMat = new THREE.PointsMaterial({ size: 0.5, map: glowTexture('rgba(255,235,190,1)', 'rgba(255,200,120,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  scene.add(new THREE.Points(ffGeo, ffMat))
  animated.push((t) => {
    for (let i = 0; i < FF; i++) {
      const [x, y, z, s] = ffBase[i]
      ffPos[i * 3] = x + Math.sin(t * 0.3 + s) * 1.2
      ffPos[i * 3 + 1] = y + Math.sin(t * 0.5 + s * 2) * 0.6
      ffPos[i * 3 + 2] = z + Math.cos(t * 0.27 + s) * 1.2
    }
    ffGeo.attributes.position.needsUpdate = true
    ffMat.opacity = 0.65 + Math.sin(t * 2) * 0.2
  })

  /* progress → camera, sun and sky */
  let progress = 0
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3()
  const curPos = new THREE.Vector3(...STATIONS[0].cam), curLook = new THREE.Vector3(...STATIONS[0].look)
  const sunCol = new THREE.Color()
  function rig(p: number) {
    const n = STATIONS.length - 1
    const f = Math.min(n - 1e-6, Math.max(0, p * n))
    const i = Math.floor(f)
    const local = smooth(0.18, 0.82, f - i) // pause at each station
    const a = STATIONS[i], b = STATIONS[i + 1]
    camPos.set(a.cam[0] + (b.cam[0] - a.cam[0]) * local, a.cam[1] + (b.cam[1] - a.cam[1]) * local + Math.sin(local * Math.PI) * 4, a.cam[2] + (b.cam[2] - a.cam[2]) * local)
    camLook.set(a.look[0] + (b.look[0] - a.look[0]) * local, a.look[1] + (b.look[1] - a.look[1]) * local, a.look[2] + (b.look[2] - a.look[2]) * local)

    // The sun climbs from just under the horizon to well above it across the story.
    const elev = -0.03 + p * 0.3
    const dir = new THREE.Vector3(0.12, elev, -1).normalize()
    skyUniforms.uSunDir.value.copy(dir)
    sunGlow.position.copy(dir.clone().multiplyScalar(520))
    sun.position.copy(dir.clone().multiplyScalar(100))
    const warm = smooth(0, 1, p)
    skyUniforms.uTop.value.set('#0b1530').lerp(new THREE.Color('#3f6d9c'), warm)
    skyUniforms.uMid.value.set('#5b3a5e').lerp(new THREE.Color('#f0a07a'), warm)
    skyUniforms.uHorizon.value.set('#e48a5a').lerp(new THREE.Color('#ffd59a'), warm)
    fogColor.set('#2a2238').lerp(new THREE.Color('#e9b49a'), warm * 0.85)
    sunCol.set('#ff9d6a').lerp(new THREE.Color('#fff1d6'), warm)
    sun.color.copy(sunCol)
    sun.intensity = 0.9 + warm * 1.4
    hemi.intensity = 0.55 + warm * 0.75
    renderer.toneMappingExposure = 0.95 + warm * 0.2
    waterUniforms.uShallow.value.set('#c76a52').lerp(new THREE.Color('#ffc58f'), warm)
    waterUniforms.uDeep.value.set('#101b2e').lerp(new THREE.Color('#2a5a7a'), warm)
  }
  rig(0)

  let raf = 0
  const clock = new THREE.Clock()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  function frame() {
    const t = clock.getElapsedTime() * (reduce ? 0.25 : 1)
    rig(progress)
    // Ease the camera toward its target so wheel steps glide instead of jump.
    curPos.lerp(camPos, 0.08)
    curLook.lerp(camLook, 0.08)
    camera.position.copy(curPos)
    camera.lookAt(curLook)
    waterUniforms.uTime.value = t
    for (const fn of animated) fn(t)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.fov = w < h ? 68 : 55 // phones see a little wider
    camera.updateProjectionMatrix()
  }
  resize()
  frame()

  return {
    setProgress: (p) => { progress = Math.min(1, Math.max(0, p)) },
    resize,
    dispose: () => {
      cancelAnimationFrame(raf)
      renderer.dispose()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose?.()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose?.()
      })
    },
  }
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}
