// The Mindspace brain: each region "houses" part of the app. One entry per scroll chapter,
// in travel order. `at` is the region's centre in brain space (x: right, y: up, z: forward),
// `view` is where the camera sits around the brain (degrees around, degrees up, distance).
// Facts are plain, textbook-level descriptions. No medical claims, never "therapy".

export interface Region {
  id: string
  name: string // anatomical name shown on the label
  houses: string[] // what lives here
  kicker: string
  title: string
  body: string
  fact?: string
  route?: string // where "Open" goes in the app
  cta?: string
  color: string
  at: [number, number, number] | null // null = the whole brain (intro, closing)
  radius: number // how far the region's glow reaches
  bilateral?: boolean // mirrored on both sides
  view: [number, number, number]
}

export const REGIONS: Region[] = [
  {
    id: 'mind', name: 'Mindspace', houses: [], kicker: 'Mindspace', title: 'Your mind, mapped.',
    body: 'Each point of light is a thought, each line a connection. The regions are signposts, not a scan of your mind. Scroll to travel, drag to turn.',
    color: '#f2bd5b', at: null, radius: 0, view: [-68, 12, 6.2],
  },
  {
    id: 'amygdala', name: 'Amygdala', houses: ['Mood check-in', 'Your patterns'], kicker: 'Amygdala · Feel',
    title: 'Start with how you feel.',
    body: 'One tap, five feelings, no judgment. Over the weeks, your patterns show up: sleep, exams, salary day, even power cuts.',
    fact: 'The amygdala helps process emotions and respond to threats.',
    route: '/mood', cta: 'Check in', color: '#ef7851', at: [0.5, -0.42, 0.32], radius: 0.36, bilateral: true, view: [52, 4, 3.6],
  },
  {
    id: 'hippocampus', name: 'Hippocampus', houses: ['Journal', 'Letter to future you', 'Memory you control'], kicker: 'Hippocampus · Remember',
    title: 'A journal that keeps your secrets.',
    body: 'Journal freely. Write a letter on a good day that finds you on a hard one. See, edit or delete what your companion remembers.',
    fact: 'The hippocampus helps turn new experiences into lasting memories.',
    route: '/journal', cta: 'Open the journal', color: '#a58bff', at: [0.55, -0.32, -0.2], radius: 0.38, bilateral: true, view: [105, 8, 3.7],
  },
  {
    id: 'temporal', name: 'Temporal lobe', houses: ['Five companions'], kicker: 'Temporal lobe · Talk',
    title: 'Five voices. Pick yours.',
    body: 'Sola listens. Kemi plans. Tobi cheers. Amara calms. Dayo keeps it real. In English, Pidgin and more. Good company, not therapy.',
    fact: 'The temporal lobes help process sounds and language.',
    route: '/chat', cta: 'Meet them', color: '#5fd3c4', at: [-1.02, -0.02, 0.42], radius: 0.42, view: [-72, 10, 3.9],
  },
  {
    id: 'prefrontal', name: 'Prefrontal cortex', houses: ['Rehearsal room', 'Burn it', 'Wins jar'], kicker: 'Prefrontal · Act',
    title: 'Practise. Let go. Count wins.',
    body: 'Rehearse a hard conversation before you have it. Burn a worry and watch it go. Fill a jar with small wins.',
    fact: 'The prefrontal cortex, behind your forehead, helps with planning, decisions and self-control.',
    route: '/tools', cta: 'See the tools', color: '#f2bd5b', at: [0, 0.32, 1.18], radius: 0.6, view: [8, 18, 4.0],
  },
  {
    id: 'brainstem', name: 'Brainstem', houses: ['Breathing', 'Grounding', 'Heart check'], kicker: 'Brainstem · Breathe',
    title: 'Four in. Four hold. Four out.',
    body: 'Box breathing, grounding and a body scan. Heart check estimates your heart rate with the camera, before and after. It is not a medical test.',
    fact: 'The brainstem helps regulate breathing and heart rate.',
    route: '/exercises', cta: 'Breathe now', color: '#6fb7ff', at: [0, -1.12, -0.42], radius: 0.4, view: [150, -10, 3.8],
  },
  {
    id: 'occipital', name: 'Occipital lobe', houses: ['Your week as music', 'Your patterns'], kicker: 'Occipital · See',
    title: 'See your week. Hear it too.',
    body: 'Your check-ins become a picture of your week, and a short ambient track. Calm weeks sound different from hard ones.',
    fact: 'The occipital lobe, at the back of your head, is where the brain makes sense of what you see.',
    route: '/week-music', cta: 'Play my week', color: '#ff8fb1', at: [0, 0.18, -1.25], radius: 0.55, view: [182, 16, 4.0],
  },
  {
    id: 'hypothalamus', name: 'Hypothalamus', houses: ['3 a.m. mode', "Tonight's story"], kicker: 'Hypothalamus · Rest',
    title: 'Let the day grow quiet.',
    body: "After midnight, 3 a.m. mode dims and slows everything down. Tonight's story helps you drift off when you are ready to rest.",
    fact: 'The hypothalamus helps regulate your sleep and waking cycle.',
    route: '/tonight-story', cta: "Tonight's story", color: '#b6e36a', at: [0, -0.46, 0.22], radius: 0.28, view: [-20, -24, 3.5],
  },
  {
    id: 'callosum', name: 'Corpus callosum', houses: ['Quiet signal', 'Bridge to real help', 'Crisis help'], kicker: 'Corpus callosum · Connect',
    title: "You don't have to go alone.",
    body: 'Share just your weather with up to three trusted people. Prepare a short summary for a professional. If you are ever in danger, call 112.',
    fact: "The corpus callosum lets the brain's two halves talk to each other.",
    route: '/your-people', cta: 'Your people', color: '#7fe0ff', at: [0, 0.28, -0.05], radius: 0.42, view: [-35, 52, 3.9],
  },
  {
    id: 'thalamus', name: 'Thalamus', houses: ['No account', 'Stays on your phone', 'Safe-at-home'], kicker: 'Thalamus · Guard',
    title: 'Yours alone.',
    body: 'No account. Everything you write stays on your phone. Safe-at-home mode can hide the app behind a calculator.',
    fact: 'The thalamus works like a relay station, passing signals from your senses on to the rest of the brain.',
    route: '/settings', cta: 'Privacy settings', color: '#ffd59a', at: [0, -0.04, 0], radius: 0.3, view: [-120, 26, 3.6],
  },
  {
    id: 'start', name: 'Mindspace', houses: [], kicker: 'Your mind', title: 'Start here.', body: '',
    color: '#f2bd5b', at: null, radius: 0, view: [-110, 18, 6.0],
  },
]
