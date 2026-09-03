import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let lenis: Lenis | null = null

function motionDisabled(): boolean {
  try {
    if (localStorage.getItem('ksec-perf') === 'on') return true
  } catch {
    /* ignore */
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Initialise Lenis smooth scrolling and keep it in sync with ScrollTrigger.
 * Returns a cleanup function. Safe to call more than once.
 */
export function initSmoothScroll(): (() => void) | null {
  if (lenis) return null
  if (motionDisabled()) return null

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.5,
  })

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}

function tick(time: number) {
  lenis?.raf(time * 1000)
}

/** Smoothly scroll to an element or a y offset (accounting for sticky nav). */
export function scrollToTarget(target: string | number, offset = 0): void {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.2 })
    return
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: Math.max(0, target + offset), behavior: 'smooth' })
    return
  }
  const el = document.querySelector(target)
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: Math.max(0, top + offset), behavior: 'smooth' })
  }
}
