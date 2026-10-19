import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '@fontsource-variable/inter'
import './index.css'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import Chat from './pages/Chat.tsx'
import { AI_ENABLED } from './lib/ai'
import Journal from './pages/Journal.tsx'
import Mood from './pages/Mood.tsx'
import Exercises from './pages/Exercises.tsx'
import Resources from './pages/Resources.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            {AI_ENABLED && <Route path="chat" element={<Chat />} />}
            <Route path="journal" element={<Journal />} />
            <Route path="mood" element={<Mood />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="resources" element={<Resources />} />
          </Route>
        </Routes>
      </BrowserRouter>
  </StrictMode>,
)