import { useEffect, useRef, useState, type ReactNode } from 'react'
import { profile, skills, projects, timeline, techGroups } from './data'
import { ThemeToggle, PerformanceToggle } from './theme'
import StudyPage from './Study'

/* ------------------------------ utilities ------------------------------ */

function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}

function useScrollSpy() {
  const [active, setActive] = useState('home')
  useEffect(() => {
    const sections = ['home', 'about', 'skills', 'projects', 'career', 'contact']
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])
  return active
}

const Reveal = ({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) => {
  const { ref, visible } = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* mouse-follow glow */
function CursorGlow() {
  const glowRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = glowRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return <div ref={glowRef} className="cursor-glow" aria-hidden />
}

const FLOATERS = ['⚡', '🚀', '☁️', '🐳', '☕', '✨', '💻', '🔮']

/* ------------------------------ Routing ------------------------------ */

type Route = 'home' | 'study'

function getHashRoute(): Route {
  return window.location.hash.replace(/^#\/?/, '') === 'study' ? 'study' : 'home'
}

function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(getHashRoute)
  useEffect(() => {
    const onHash = () => setRoute(getHashRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

const icons = {
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 2.89-.39c.98 0 1.97.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.68 5.38-5.24 5.67.41.36.77 1.06.77 2.14v3.18c0 .31.21.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="1em" height="1em">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  ),
  blog: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="1em" height="1em">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  external: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="1em" height="1em">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  ),
}

/* ------------------------------- Navbar ------------------------------- */

const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'study', label: 'Study' },
  { id: 'career', label: 'Career' },
  { id: 'contact', label: 'Contact' },
]

function Navbar({ route }: { route: Route }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const spyActive = useScrollSpy()
  const active = route === 'study' ? 'study' : spyActive

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goHome = () => {
    setOpen(false)
    if (route === 'study') {
      window.location.hash = '#/'
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const scrollTo = (id: string) => {
    setOpen(false)
    if (id === 'study') {
      window.location.hash = '#/study'
      return
    }
    if (route === 'study') {
      window.location.hash = '#/'
      window.setTimeout(
        () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }),
        80,
      )
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <button className="nav-logo" onClick={goHome}>
        SJ<span className="nav-logo-dot">.</span>
      </button>

      <nav className={`nav-links ${open ? 'nav-links-open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <button
            key={link.id}
            className={`nav-link ${active === link.id ? 'nav-link-active' : ''}`}
            onClick={() => scrollTo(link.id)}
          >
            {link.label}
          </button>
        ))}
        <a
          className="nav-cta"
          href={profile.blog}
          target="_blank"
          rel="noreferrer"
        >
          Blog
        </a>
      </nav>

      <div className="nav-toggles">
        <PerformanceToggle />
        <ThemeToggle />
      </div>

      <button className="nav-burger" aria-label="menu" onClick={() => setOpen((v) => !v)}>
        <span />
        <span />
        <span />
      </button>
    </header>
  )
}

/* ------------------------------- Hero -------------------------------- */

function Hero() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <section id="home" className="hero">
      <div className="hero-bg">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
        <div className="grid-overlay" />
        {mounted &&
          FLOATERS.map((e, i) => (
            <span
              key={i}
              className="floater"
              style={{
                left: `${8 + (i * 12.5) % 85}%`,
                animationDelay: `${i * 0.9}s`,
                animationDuration: `${9 + (i % 4) * 2.5}s`,
              }}
            >
              {e}
            </span>
          ))}
      </div>

      <div className="hero-content">
        <span className="hero-badge">
          <span className="hero-badge-emoji">👋</span> Daedeok Software Meister High School
        </span>
        <h1 className="hero-title">
          {mounted && (
            <>
              {profile.name.split(' ').map((word, i) => (
                <span
                  key={i}
                  className="hero-word"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  {word}
                </span>
              ))}
            </>
          )}
        </h1>
        <p className="hero-subtitle">
          {profile.roles.map((role, i) => (
            <span key={role}>
              <span className="role-chip" style={{ animationDelay: `${0.5 + i * 0.2}s` }}>
                {role}
              </span>
              {i < profile.roles.length - 1 && <span className="role-sep">·</span>}
            </span>
          ))}
        </p>
        <p className="hero-type">
          <span className="hero-type-static">Learn · Build · Deploy</span>
        </p>
        <p className="hero-desc">{profile.intro}</p>

        <div className="hero-actions">
          <a
            className="btn btn-primary"
            href={`mailto:${profile.email}`}
            style={{ animationDelay: '1.2s' }}
          >
            {icons.mail} Contact Me
          </a>
          <a
            className="btn btn-ghost"
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            style={{ animationDelay: '1.35s' }}
          >
            {icons.github} GitHub
          </a>
          <button
            className="btn btn-ghost"
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ animationDelay: '1.5s' }}
          >
            View Projects ↓
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-value"><span className="stat-emoji">📦</span><span className="stat-num">{profile.repositories}+</span></span>
            <span className="stat-label">Repositories</span>
          </div>
          <div className="stat">
            <span className="stat-value"><span className="stat-emoji">⭐</span><span className="stat-num">{profile.stars}+</span></span>
            <span className="stat-label">GitHub Stars</span>
          </div>
          <div className="stat">
            <span className="stat-value"><span className="stat-emoji">👥</span><span className="stat-num">{profile.followers}</span></span>
            <span className="stat-label">Followers</span>
          </div>
          <div className="stat">
            <span className="stat-value"><span className="stat-emoji">🏆</span><span className="stat-num">3</span></span>
            <span className="stat-label">Awards</span>
          </div>
        </div>
      </div>

      <div className="scroll-hint" aria-hidden>
        <span />
      </div>
    </section>
  )
}

/* ------------------------------- About ------------------------------- */

function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <Reveal>
          <div className="section-header">
            <span className="section-tag">About ✨</span>
            <h2 className="section-title">
              About <span className="grad-text">Me</span>
            </h2>
            <p className="section-sub">누구나 쓸 수 있는 기술을, 꾸준히 만들어가는 개발자</p>
          </div>
        </Reveal>

        <div className="about-grid">
          <Reveal className="about-text-card">
            <h3 className="about-name">
              👋 {profile.nickname} <span className="grad-text">{profile.koreanName}</span>
            </h3>
            <p className="about-intro">{profile.intro}</p>
            <ul className="about-points">
              <li>
                <span className="point-icon">◈</span>
                Kubernetes · Docker 기반 인프라 설계와 운영 경험
              </li>
              <li>
                <span className="point-icon">◈</span>
                Go · Python · Java · TypeScript 등 다중 언어 활용
              </li>
              <li>
                <span className="point-icon">◈</span>
                MLOps와 데이터 분석까지 확장하는 학습 범위
              </li>
              <li>
                <span className="point-icon">◈</span>
                혼자서 인프라부터 프론트엔드까지 Full Stack 구현
              </li>
            </ul>
            <div className="about-chips">
              {profile.achievements.map((a) => (
                <span key={a} className="chip">
                  🏆 {a}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={150} className="about-card">
            <div className="about-card-head">
              <span className="about-card-icon">{icons.blog}</span>
              <h4>Quick Info</h4>
            </div>
            <dl className="about-list">
              <div>
                <dt>이름</dt>
                <dd>🧑‍💻 {profile.koreanName} ({profile.nickname})</dd>
              </div>
              <div>
                <dt>소속</dt>
                <dd>🏫 대덕소프트웨어마이스터고등학교</dd>
              </div>
              <div>
                <dt>관심 분야</dt>
                <dd>{profile.roles.join(' · ')}</dd>
              </div>
              <div>
                <dt>블로그</dt>
                <dd>
                  <a href={profile.blog} target="_blank" rel="noreferrer" className="inline-link">
                    velog.io/@sungjujjang
                  </a>
                </dd>
              </div>
              <div>
                <dt>PS</dt>
                <dd>
                  <a href={profile.solvedac} target="_blank" rel="noreferrer" className="inline-link">
                    solved.ac
                  </a>
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------- Skills ------------------------------ */

function Skills() {
  const marqueeItems = [
    ...skills.devops,
    ...skills.backend,
    ...skills.frontend,
    ...skills.ml,
    ...skills.mobile,
  ]
  const marquee = [...marqueeItems, ...marqueeItems, ...marqueeItems]

  return (
    <section id="skills" className="section section-alt">
      <div className="marquee">
        <div className="marquee-track">
          {marquee.map((item, i) => (
            <span key={i} className="marquee-item">
              ⚡ {item}
            </span>
          ))}
        </div>
      </div>

      <div className="container">
        <Reveal>
          <div className="section-header">
            <span className="section-tag">Skills</span>
            <h2 className="section-title">
              Tech <span className="grad-text">Stack</span>
            </h2>
            <p className="section-sub">인프라부터 프론트엔드까지 폭넓은 기술 스택</p>
          </div>
        </Reveal>

        <div className="skills-grid">
          {techGroups.map((group, gi) => (
            <Reveal key={group.label} delay={gi * 100}>
              <div className="skill-card">
                <div className="skill-card-head">
                  <span className="skill-dot" style={{ background: group.color }} />
                  <h3>{group.label}</h3>
                </div>
                <div className="skill-pills">
                  {group.items.map((item, ii) => (
                    <span
                      key={item}
                      className="skill-pill"
                      style={{ animationDelay: `${ii * 50}ms` }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="skills-row">
            <div className="skill-card skill-card-wide">
              <div className="skill-card-head">
                <span className="skill-dot" style={{ background: '#FBBF24' }} />
                <h3>Languages</h3>
              </div>
              <div className="skill-pills">
                {skills.languages.map((item, ii) => (
                  <span key={item} className="skill-pill skill-pill-ghost" style={{ animationDelay: `${ii * 50}ms` }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="skill-card skill-card-wide">
              <div className="skill-card-head">
                <span className="skill-dot" style={{ background: '#A78BFA' }} />
                <h3>Tools & Others</h3>
              </div>
              <div className="skill-pills">
                {skills.etc.map((item, ii) => (
                  <span key={item} className="skill-pill skill-pill-ghost" style={{ animationDelay: `${ii * 50}ms` }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------ Projects ----------------------------- */

function openExternal(url: string) {
  const win = window.open(url, '_blank', 'noopener,noreferrer')
  if (!win) window.location.href = url
}

function Projects() {
  const shown = projects.slice(0, 8)
  const [expanded, setExpanded] = useState(false)
  const list = expanded ? projects : shown

  return (
    <section id="projects" className="section">
      <div className="container">
        <Reveal>
          <div className="section-header">
            <span className="section-tag">Projects 💡</span>
            <h2 className="section-title">
              My <span className="grad-text">Projects</span>
            </h2>
            <p className="section-sub">문제를 정의하고 직접 해결해온 프로젝트들</p>
          </div>
        </Reveal>

        <div className="projects-grid">
          {list.map((project, i) => (
            <Reveal key={project.name} delay={(i % 4) * 80}>
              <a
                className={`project-card ${project.highlight ? 'project-card-featured' : ''}`}
                href={project.github}
                onClick={(e) => {
                  e.preventDefault()
                  openExternal(project.github)
                }}
                role="link"
              >
                <div className="project-top">
                  <span className="project-folder">{project.emoji}</span>
                  <span className="project-link-icon">{icons.external}</span>
                </div>
                <h3 className="project-name">{project.name}</h3>
                <p className="project-desc">{project.description}</p>
                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="project-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="project-footer">
                  <span className="project-star">⭐ GitHub</span>
                  <span className="project-more">View →</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="projects-more">
            <a
              className="btn btn-primary"
              href={profile.github}
              onClick={(e) => {
                e.preventDefault()
                openExternal(profile.github)
              }}
              role="link"
            >
              {icons.github} View All Repositories
            </a>
            {projects.length > shown.length && (
              <button
                className="btn btn-ghost"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? 'Show Less ↑' : `Show ${projects.length - shown.length} More ↓`}
              </button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------- Career ------------------------------ */

function Career() {
  return (
    <section id="career" className="section section-alt">
      <div className="container">
        <Reveal>
          <div className="section-header">
            <span className="section-tag">Career 🚀</span>
            <h2 className="section-title">
              연혁 · <span className="grad-text">History</span>
            </h2>
            <p className="section-sub">꾸준히 성장해온 저의 여정</p>
          </div>
        </Reveal>

        <div className="timeline">
          {timeline.map((item, i) => (
            <Reveal key={item.title} delay={i * 120} className="timeline-item-wrap">
              <div className="timeline-item">
                <div className="timeline-marker">{item.emoji}</div>
                <div className="timeline-content">
                  <div className="timeline-head">
                    <span className="timeline-date">📅 {item.date}</span>
                    <span className="timeline-tag">{item.tag}</span>
                  </div>
                  <h3 className="timeline-title">{item.title}</h3>
                  <p className="timeline-desc">{item.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------- Contact ----------------------------- */

function Contact() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* noop */
    }
  }

  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        <Reveal>
          <div className="contact-card">
            <div className="contact-orb" />
            <span className="section-tag">Contact 💬</span>
            <h2 className="contact-title">Let's Build Together 🤝</h2>
            <p className="contact-desc">
              아이디어가 있으신가요? 함께 만들고 싶은 무언가가 있다면 언제든지 연락주세요.
              가볍게 커피 한잔부터 대화 나눠요 ☕
            </p>

            <div className="contact-actions">
              <a className="btn btn-primary" href={`mailto:${profile.email}`}>
                {icons.mail} {profile.email}
              </a>
              <button className="btn btn-ghost" onClick={copy}>
                {copied ? '✅ Copied!' : '📋 Copy Email'}
              </button>
            </div>

            <div className="contact-socials">
              <a className="social-btn" href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                {icons.github}
              </a>
              <a className="social-btn" href={profile.blog} target="_blank" rel="noreferrer" aria-label="Blog">
                {icons.blog}
              </a>
              <a className="social-btn" href={`mailto:${profile.email}`} aria-label="Email">
                {icons.mail}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* -------------------------------- Footer ------------------------------ */

function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      className={`back-top ${show ? 'back-top-show' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="back to top"
    >
      ↑
    </button>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <span className="footer-brand">
            © {new Date().getFullYear()} {profile.nickname} · {profile.koreanName}
          </span>
          <span className="footer-built">{profile.nickname}</span>
        </div>
      </div>
    </footer>
  )
}

/* --------------------------------- App -------------------------------- */

export default function App() {
  const route = useHashRoute()

  return (
    <>
      <CursorGlow />
      {route === 'study' ? (
        <StudyPage />
      ) : (
        <>
          <Navbar route={route} />
          <main>
            <Hero />
            <About />
            <Skills />
            <Projects />
            <Career />
            <Contact />
          </main>
          <Footer />
          <BackToTop />
        </>
      )}
    </>
  )
}
