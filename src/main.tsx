import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '@fontsource-variable/inter'
import './index.css'
import '@fontsource/space-grotesk/300.css'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import './looks.css'
import { applyLook, loadLook } from './lib/theme'
import App from './App.tsx'
import { Capacitor } from '@capacitor/core'
import { Keyboard } from '@capacitor/keyboard'
import Home from './pages/Home.tsx'
import Chat from './pages/Chat.tsx'
import { AI_ENABLED } from './lib/ai'
import Journal from './pages/Journal.tsx'
import Mood from './pages/Mood.tsx'
import Exercises from './pages/Exercises.tsx'
import Resources from './pages/Resources.tsx'
import Tools from './pages/Tools.tsx'
import Settings from './pages/Settings.tsx'
import { features } from './features'
const World = lazy(() => import('./world/World'))

if (import.meta.env.VITE_DEMO_SEED === 'true') {
  localStorage.setItem('mindspace-ack', 'true')
  import('./lib/db').then(({ seedDemoData }) => seedDemoData())
}

// On phones: hide the tab bar while typing, and drop the keyboard's ^ v ✓ accessory bar.
if (Capacitor.isNativePlatform()) {
  Keyboard.setAccessoryBarVisible({ isVisible: false }).catch(() => {})
  Keyboard.addListener('keyboardWillShow', () => document.body.classList.add('kb-open'))
  Keyboard.addListener('keyboardWillHide', () => document.body.classList.remove('kb-open'))
}

applyLook(loadLook())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/world" element={<Suspense fallback={<div style={{ minHeight: '100vh', background: '#120f1c' }} />}><World /></Suspense>} />
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            {AI_ENABLED && <Route path="chat" element={<Chat />} />}
            <Route path="journal" element={<Journal />} />
            <Route path="mood" element={<Mood />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="resources" element={<Resources />} />
            <Route path="tools" element={<Tools />} />
            <Route path="settings" element={<Settings />} />
            {features.map((f) => <Route key={f.id} path={f.route.replace(/^\//, '')} element={f.element} />)}
          </Route>
        </Routes>
      </BrowserRouter>
  </StrictMode>,
)