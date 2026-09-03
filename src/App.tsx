import { useEffect, useRef, useState } from 'react'
import { profile, skills, timeline } from './data'
import { ThemeToggle, PerformanceToggle } from './theme'
import StudyPage from './Study'
import projectData from '../projects.json'
import {
  setupHeroAnimation,
  setupSectionReveals,
  setupGenericReveals,
  refreshScrollTriggers,
} from '@/lib/gsap'
import { initSmoothScroll, scrollToTarget } from '@/lib/smoothScroll'

type Project = {
  name: string
  emoji: string
  description: string
  tags: string[]
  github: string
  highlight?: boolean
}

const PROJECTS: Project[] = (projectData as { projects: Project[] }).projects ?? []

type Route = 'home' | 'study'

const MENU_ITEMS = [
  { id: 'work', label: '프로젝트' },
  { id: 'stack', label: '기술 스택' },
  { id: 'about', label: '소개' },
  { id: 'contact', label: '연락처' },
]

function getPathRoute(): Route {
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path === '/study' || path.startsWith('/study/')) return 'study'
  return 'home'
}

/* ================================================================
   HEADER
   ================================================================ */
function SiteHeader({ route }: { route: Route }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const goSection = (id: string) => {
    setMenuOpen(false)
    if (route === 'home') {
      if (id === 'top') scrollToTarget('#top', 0)
      else scrollToTarget(`#${id}`, 0)
    }
  }

  return (
    <>
      <div className="site-header-wrap">
        <header className="site-header site-container">
          <button className="site-header__brand" onClick={() => goSection('top')} aria-label="홈으로">
            <span className="site-header__brand-mark" aria-hidden />
            <span className="site-header__brand-name">장성주<span className="nav-logo-dot">.</span></span>
          </button>
          <nav className="site-header__nav" aria-label="primary">
            <a className="site-header-nav-link" href="/study">
              Study
            </a>
            <PerformanceToggle />
            <ThemeToggle />
            <button
              type="button"
              className="site-header__menu"
              aria-label="메뉴 열기"
              aria-expanded={menuOpen}
              data-open={menuOpen || undefined}
              onClick={() => setMenuOpen(true)}
            >
              <span className="site-header__menu-label" aria-hidden>
                <span className="site-header__menu-word site-header__menu-word--menu">Menu</span>
                <span className="site-header__menu-word site-header__menu-word--close">Close</span>
              </span>
              <span className="site-header__menu-marker" aria-hidden>
                <span />
                <span />
                <span />
                <span />
              </span>
            </button>
          </nav>
        </header>
      </div>

      <div className={`menu-overlay ${menuOpen ? 'menu-overlay--open' : ''}`} aria-hidden={!menuOpen}>
        <header className="menu-overlay__header">
          <button
            type="button"
            className="site-header__menu"
            aria-label="메뉴 닫기"
            data-open
            onClick={() => setMenuOpen(false)}
          >
            <span className="site-header__menu-label" aria-hidden>
              <span className="site-header__menu-word site-header__menu-word--menu">Menu</span>
              <span className="site-header__menu-word site-header__menu-word--close">Close</span>
            </span>
            <span className="site-header__menu-marker" aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </span>
          </button>
        </header>

        <nav className="menu-overlay__nav" aria-label="site sections">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              className="menu-overlay__link"
              onClick={() => {
                setMenuOpen(false)
                if (route === 'home') {
                  window.setTimeout(() => scrollToTarget(`#${item.id}`, 0), 80)
                }
              }}
            >
              <span className="menu-overlay__link-inner">
                <span className="menu-overlay__label">{item.label}</span>
              </span>
            </button>
          ))}
        </nav>

        <footer className="menu-overlay__footer">
          {route === 'home' ? (
            <a className="site-header-nav-link" href="/study">
              Study TIL →
            </a>
          ) : (
            <a className="site-header-nav-link" href="/">
              Portfolio →
            </a>
          )}
        </footer>
      </div>
    </>
  )
}

/* ================================================================
   HERO
   ================================================================ */
function Hero() {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    setupHeroAnimation(ref.current)
    const id = window.setTimeout(refreshScrollTriggers, 400)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <section id="top" className="hero" ref={ref}>
      <div className="hero__section site-container">
        <div className="hero__intro">
          <h1 className="hero__headline">
            <span className="hero__headline-line">
              <span>장성주</span>
            </span>
            <span className="hero__headline-line">
              <span className="hero__accent">SungJu</span>
            </span>
          </h1>
        </div>

        <ul className="hero__info">
          {profile.heroInfo.map((line) => (
            <li className="hero__info-line" key={line.label}>
              <span className="hero__info-label">{line.label}</span>
              <span className="hero__info-value">{line.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ================================================================
   WORK — 프로젝트
   ================================================================ */
function Work() {
  return (
    <section className="page-section page-section--tint" id="work">
      <div className="site-container section-spacing">
        <header className="section-header">
          <div className="section-header__body">
            <h2 className="section-header__title">
              <span className="section-header__title-line">프로젝트</span>
            </h2>
            <p className="section-header__description">
              직접 설계하고 만든 프로젝트입니다.
            </p>
          </div>
        </header>

        {PROJECTS.length === 0 ? (
          <div className="work-empty">
            <p>등록된 프로젝트가 없습니다.</p>
            <p className="work-empty__hint">루트의 projects.json 에 프로젝트를 추가해 주세요.</p>
          </div>
        ) : (
          <ul className="work-grid" data-reveal>
            {PROJECTS.map((p) => (
              <li className="work-card" key={p.name} data-reveal>
                <a className="work-card__link" href={p.github} target="_blank" rel="noopener" aria-label={`${p.name} (새 탭)`} />
                <div className="work-card__top">
                  <span className="work-card__emoji" aria-hidden>{p.emoji}</span>
                  <span className="work-card__arrow" aria-hidden>↗</span>
                </div>
                <h3 className="work-card__name">{p.name}</h3>
                <p className="work-card__desc">{p.description}</p>
                {p.tags.length > 0 && (
                  <div className="work-card__tags">
                    {p.tags.map((t) => (
                      <span className="detail-tag" key={t}>{t}</span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

/* ================================================================
   STACK — 기술 스택
   ================================================================ */
const STACK_GROUPS = [
  { label: 'Languages', meta: '언어', items: skills.languages },
  { label: 'DevOps', meta: '인프라 · 운영', items: skills.devops },
  { label: 'Backend', meta: '서버 · DB', items: skills.backend },
  { label: 'Frontend', meta: '프론트', items: skills.frontend },
  { label: 'Mobile · 기타', meta: '모바일 · 하드웨어', items: [...skills.mobile, ...skills.etc] },
]

function Stack() {
  return (
    <section className="page-section page-section--paper" id="stack">
      <div className="site-container section-spacing">
        <header className="section-header">
          <div className="section-header__body">
            <h2 className="section-header__title">
              <span className="section-header__title-line">기술 스택</span>
            </h2>
            <p className="section-header__description">
              프로젝트에서 사용한 기술 스택입니다.
            </p>
          </div>
        </header>

        <div className="stack-grid">
          {STACK_GROUPS.map((group) => (
            <div className="stack-group" key={group.label} data-reveal>
              <div className="stack-group__head">
                <h3 className="stack-group__label">{group.label}</h3>
                <span className="stack-group__meta">{group.meta}</span>
              </div>
              <ul className="stack-group__items">
                {group.items.map((item) => (
                  <li className="stack-tag" key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   ABOUT — 소개 + 타임라인
   ================================================================ */
function About() {
  return (
    <section className="page-section page-section--paper" id="about">
      <div className="site-container section-spacing">
        <header className="section-header">
          <div className="section-header__body">
            <h2 className="section-header__title">
              <span className="section-header__title-line">소개</span>
            </h2>
          </div>
        </header>

        <div className="about-bio" data-reveal>
          <p>{profile.intro}</p>
          <div className="about-bio__links">
            <a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href={profile.blog} target="_blank" rel="noreferrer">Velog ↗</a>
          </div>
        </div>

        <div className="timeline" data-reveal>
          {timeline.map((item) => (
            <div className="timeline__item" key={`${item.date}-${item.title}`}>
              <div className="timeline__marker">
                <span className="timeline__dot" aria-hidden />
              </div>
              <div className="timeline__content">
                <div className="timeline__row">
                  <span className="timeline__date">{item.date}</span>
                  <span className="detail-tag detail-tag--accent">{item.tag}</span>
                </div>
                <h3 className="timeline__title">{item.title}</h3>
                <p className="timeline__desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   CONTACT
   ================================================================ */
function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contact__main site-container section-spacing">
        <header className="section-header">
          <div className="section-header__body">
            <h2 className="section-header__title">
              <span className="section-header__title-line">연락처</span>
            </h2>
            <p className="section-header__description">
              프로젝트 협업과 대화를 환영합니다.
            </p>
          </div>
        </header>

        <div className="contact-channels">
          <a className="contact-channel" href={`mailto:${profile.email}`}>
            <span className="contact-channel__label">Email</span>
            <span className="contact-channel__value">{profile.email}</span>
            <span className="contact-channel__arrow" aria-hidden>↗</span>
          </a>
          <a className="contact-channel" href={profile.github} target="_blank" rel="noreferrer">
            <span className="contact-channel__label">GitHub</span>
            <span className="contact-channel__value">github.com/sungjujjang</span>
            <span className="contact-channel__arrow" aria-hidden>↗</span>
          </a>
          <a className="contact-channel" href={profile.linkedin} target="_blank" rel="noreferrer">
            <span className="contact-channel__label">LinkedIn</span>
            <span className="contact-channel__value">linkedin.com/in/sungju-jang</span>
            <span className="contact-channel__arrow" aria-hidden>↗</span>
          </a>
          <a className="contact-channel" href={profile.blog} target="_blank" rel="noreferrer">
            <span className="contact-channel__label">Velog</span>
            <span className="contact-channel__value">velog.io/@sungjujjang</span>
            <span className="contact-channel__arrow" aria-hidden>↗</span>
          </a>
        </div>
      </div>

      <footer className="site-footer site-container">
        <p className="site-footer__legal">
          <span>장성주 / SungJu</span>
          <span>© {new Date().getFullYear()}</span>
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={profile.blog} target="_blank" rel="noreferrer">Velog</a>
        </p>
      </footer>
    </section>
  )
}

/* ================================================================
   APP
   ================================================================ */
export default function App() {
  const [route, setRoute] = useState<Route>(getPathRoute)

  useEffect(() => {
    const onPop = () => setRoute(getPathRoute())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (route === 'home') {
      document.title = '장성주 — Developer Portfolio'
    }
  }, [route])

  // Smooth scroll lifecycle — init once on home, cleanup on unmount.
  useEffect(() => {
    if (route !== 'home') return
    const cleanup = initSmoothScroll()
    return () => cleanup?.()
  }, [route])

  const mainRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (route !== 'home' || !mainRef.current) return
    const main = mainRef.current
    const id = window.setTimeout(() => {
      setupSectionReveals(main)
      setupGenericReveals(main)
      refreshScrollTriggers()
    }, 180)
    return () => window.clearTimeout(id)
  }, [route])

  if (route === 'study') return <StudyPage />

  return (
    <main className="site-main" id="main-content" ref={mainRef}>
      <SiteHeader route={route} />
      <Hero />
      <Work />
      <Stack />
      <About />
      <Contact />
    </main>
  )
}
