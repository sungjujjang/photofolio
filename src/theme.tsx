import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'
const THEME_KEY = 'ksec-theme'

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    /* ignore */
  }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggle = () => {
    document.documentElement.classList.add('theme-anim')
    window.setTimeout(() => document.documentElement.classList.remove('theme-anim'), 450)
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* ignore */
    }
  }

  return { theme, toggle }
}

const themeIcons = {
  sun: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="1em" height="1em">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'switch to light mode' : 'switch to dark mode'}
      title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
    >
      <span className="theme-toggle-icon">
        {theme === 'dark' ? themeIcons.sun : themeIcons.moon}
      </span>
    </button>
  )
}

/* --------------------------- Performance mode --------------------------- */

type PerfMode = 'on' | 'off'
const PERF_KEY = 'ksec-perf'

function getInitialPerf(): PerfMode {
  try {
    const stored = localStorage.getItem(PERF_KEY)
    if (stored === 'on' || stored === 'off') return stored
  } catch {
    /* ignore */
  }
  return 'off'
}

export function usePerformance() {
  const [perf, setPerf] = useState<PerfMode>(getInitialPerf)

  useEffect(() => {
    document.documentElement.setAttribute('data-performance', perf)
  }, [perf])

  const toggle = () => {
    const next: PerfMode = perf === 'on' ? 'off' : 'on'
    setPerf(next)
    try {
      localStorage.setItem(PERF_KEY, next)
    } catch {
      /* ignore */
    }
  }

  return { perf, toggle }
}

const perfIcons = {
  bolt: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M13 2 3 14h7l-1 8 11-13h-7l1-7z" />
    </svg>
  ),
  sparkles: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em">
      <path d="M12 3l1.9 4.9L19 9.8l-5.1 1.9L12 16.6l-1.9-4.9L5 9.8l5.1-1.9L12 3z" />
      <path d="M19 14l.9 2.3L22 17l-2.1.7L19 20l-.9-2.3L16 17l2.1-.7L19 14z" />
    </svg>
  ),
}

export function PerformanceToggle() {
  const { perf, toggle } = usePerformance()
  return (
    <button
      className={`perf-toggle ${perf === 'on' ? 'perf-toggle-on' : ''}`}
      onClick={toggle}
      aria-label="렉 줄이기 모드"
      title={perf === 'on' ? '효과 모드로 전환' : '렉 줄이기 모드로 전환'}
    >
      <span className="perf-toggle-icon">
        {perf === 'on' ? perfIcons.bolt : perfIcons.sparkles}
      </span>
    </button>
  )
}
