import { useState, useEffect } from 'react'
import HeroSection from './sections/HeroSection'
import EconomicSection from './sections/EconomicSection'
import ViewershipSection from './sections/ViewershipSection'
import WrestlersSection from './sections/WrestlersSection'

const NAV_ITEMS = [
  { id: 'hero', label: 'Overview' },
  { id: 'economic', label: 'Económico' },
  { id: 'viewership', label: 'Audiencia' },
  { id: 'wrestlers', label: 'Luchadores' },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') ?? 'dark'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div className="min-h-screen bg-base text-t1">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 bg-[var(--bg-nav)] backdrop-blur border-b border-border-m">
        <div className="max-w-7xl mx-auto px-4 md:px-10 h-12 flex items-center justify-between gap-3">
          <span className="font-black text-t1 text-xs uppercase tracking-widest whitespace-nowrap flex-shrink-0">
            WWE <span className="text-t4">vs</span> AEW
            <span className="hidden md:inline text-t3 font-medium normal-case tracking-normal ml-2">
              Dashboard 2023–2026
            </span>
          </span>
          <div className="flex items-center gap-0.5 overflow-x-auto flex-shrink min-w-0">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="px-2.5 py-1.5 text-xs font-semibold text-t2 hover:text-t1 rounded-lg hover:bg-elevated transition-colors whitespace-nowrap flex-shrink-0"
              >
                {item.label}
              </button>
            ))}
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Cambiar a Whiskey' : 'Cambiar a Dark'}
              className="ml-2 flex-shrink-0 px-2.5 py-1.5 rounded-lg border border-border-s text-xs font-bold text-accent hover:bg-elevated transition-colors"
            >
              {theme === 'dark' ? '☀' : '◑'}
            </button>
          </div>
        </div>
      </nav>

      {/* Sections */}
      <div id="hero">
        <HeroSection />
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-border-s to-transparent mx-10" />

      <div id="economic">
        <EconomicSection />
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-border-s to-transparent mx-10" />

      <div id="viewership">
        <ViewershipSection />
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-border-s to-transparent mx-10" />

      <div id="wrestlers">
        <WrestlersSection />
      </div>

      {/* Footer */}
      <footer className="border-t border-border-m mt-8">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 text-center">
          <p className="text-xs text-t4">
            Datos con corte agosto 2025 · WWE SEC EDGAR · Wrestling Observer · PWTorch · Showbuzz Daily · AEW comunicados oficiales
          </p>
          <p className="text-xs text-t4 mt-1">
            Todos los datos estimados son reportes de medios especializados, no cifras oficiales verificadas.
          </p>
        </div>
      </footer>
    </div>
  )
}
