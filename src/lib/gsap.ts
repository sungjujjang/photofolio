import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const reduceMotion = () => {
  try {
    return localStorage.getItem('ksec-perf') === 'on'
  } catch {
    return false
  }
}

/**
 * Hero entrance — line-mask headline reveal like specia1ne.
 * Uses the CSS-driven keyframe already present for fallback; GSAP layers
 * a scrub fade/slide as the hero scrolls away for continuity.
 */
export function setupHeroAnimation(container: HTMLElement) {
  // Scroll-away fade (works regardless of motion preference)
  gsap.to('.hero__intro', {
    y: -90,
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: '70% top',
      scrub: 1,
    },
  })
  gsap.to('.hero__info', {
    y: -40,
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: '55% top',
      scrub: 1,
    },
  })
}

/**
 * Section header line reveal + meta fade, once per section.
 */
export function setupSectionReveals(container: HTMLElement) {
  if (reduceMotion()) return
  const headers = container.querySelectorAll<HTMLElement>('.section-header')
  headers.forEach((header) => {
    // Skip headers inside the pinned Work/Practice container; those are driven
    // separately by setupWorkPracticeMotion.
    if (header.closest('.work-practice-motion')) return
    gsap.from(header.querySelectorAll('.section-header__title-line'), {
      yPercent: 105,
      duration: 1,
      ease: 'power4.out',
      stagger: 0.1,
      scrollTrigger: { trigger: header, start: 'top 80%', once: true },
    })
    gsap.from(header.querySelector('.section-header__label'), {
      opacity: 0,
      y: 10,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: header, start: 'top 84%', once: true },
    })
    gsap.from(header.querySelector('.section-header__description'), {
      opacity: 0,
      duration: 0.8,
      delay: 0.3,
      scrollTrigger: { trigger: header, start: 'top 80%', once: true },
    })
  })
}

/**
 * The signature pinned crossover: a tall container hosting two full-viewport
 * layers (Work — accent, Practice — paper). A CSS `position: sticky` holds them
 * in view while a scrubbed timeline crossfades Work → Practice.
 */
export function setupWorkPracticeMotion(container: HTMLElement) {
  const sticky = container.querySelector<HTMLElement>('.work-practice-motion__sticky')
  const layers = container.querySelectorAll<HTMLElement>('.work-practice-motion__layer')
  if (!sticky || layers.length < 2) return

  if (reduceMotion()) {
    gsap.set(layers[1], { autoAlpha: 0 })
    return
  }

  const ctx = gsap.context(() => {
    // Work content reveals as the container enters the viewport.
    const workLines = layers[0].querySelectorAll('.section-header__title-line')
    gsap.from(workLines, {
      yPercent: 105,
      duration: 1,
      ease: 'power4.out',
      stagger: 0.09,
      scrollTrigger: {
        trigger: container,
        start: 'top 72%',
        end: 'top 12%',
        scrub: 1,
      },
    })
    const workItems = layers[0].querySelectorAll('.axis-section__item')
    gsap.from(workItems, {
      y: 44,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.14,
      scrollTrigger: {
        trigger: container,
        start: 'top 55%',
        end: 'top 5%',
        scrub: 1,
      },
    })

    // Master crossfade scrub across the whole pinned range.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    })
    tl.to(layers[0], { autoAlpha: 0, duration: 0.42 }, 0.58)
      .fromTo(layers[1], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.42 }, 0.6)

    // Practice content reveals after the crossover begins.
    const practiceLines = layers[1].querySelectorAll('.section-header__title-line')
    gsap.from(practiceLines, {
      yPercent: 105,
      duration: 1,
      ease: 'power4.out',
      stagger: 0.09,
      scrollTrigger: {
        trigger: container,
        start: '35% top',
        end: '25% top',
        scrub: 1,
      },
    })
    const practiceItems = layers[1].querySelectorAll('.detail-list__item')
    gsap.from(practiceItems, {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: container,
        start: '32% top',
        end: '18% top',
        scrub: 1,
      },
    })
  }, container)
  return ctx
}

/**
 * About measured line — draw the bottom border as we scroll toward it.
 */
export function setupAboutLine(container: HTMLElement) {
  if (reduceMotion()) return
  const measure = container.querySelector<HTMLElement>('.about__measure')
  if (!measure) return
  gsap.fromTo(
    measure,
    { scaleX: 0 },
    {
      scaleX: 1,
      transformOrigin: 'left center',
      ease: 'none',
      scrollTrigger: {
        trigger: measure,
        start: 'top 85%',
        end: 'top 45%',
        scrub: 1,
      },
    },
  )
  const statement = container.querySelector<HTMLElement>('.about__statement')
  if (statement) {
    gsap.from(statement, {
      yPercent: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: measure, start: 'top 70%', once: true },
    })
  }
}

/**
 * Generic reveal for cards / grids tagged [data-reveal].
 */
export function setupGenericReveals(container: HTMLElement) {
  if (reduceMotion()) return
  container.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    })
  })
}

/**
 * Refresh all triggers (call after route mount / fonts load).
 */
export function refreshScrollTriggers() {
  // delay to let layout settle
  requestAnimationFrame(() => ScrollTrigger.refresh())
}
