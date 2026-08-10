import { useEffect, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { PerformanceToggle, ThemeToggle } from './theme'

const REPO = 'sungjujjang/study'
const BRANCH = 'main'
const TREE_URL = `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`
const CACHE_KEY = 'ksec-study-tree'
const CACHE_TTL = 60 * 60 * 1000

let currentDir = ''
marked.use({
  renderer: {
    image(token) {
      let src = token.href
      if (/^https?:\/\//i.test(src)) {
        /* absolute, keep */
      } else if (src.startsWith('/')) {
        src = `${RAW_BASE}${src}`
      } else {
        src = `${RAW_BASE}/${currentDir}/${src}`
          .replace(/\/{2,}/g, '/')
          .replace(/\/\.\//g, '/')
          .replace('https:/', 'https://')
      }
      const alt = token.text || ''
      const title = token.title ? ` title="${token.title}"` : ''
      return `<img src="${src}" alt="${alt}"${title} loading="lazy" />`
    },
    link(token) {
      const text = token.tokens.map((t) => t.raw).join('')
      const title = token.title ? ` title="${token.title}"` : ''
      return `<a href="${token.href}" target="_blank" rel="noopener noreferrer"${title}>${text}</a>`
    },
  },
})

type TreeNode = {
  name: string
  path: string
  type: 'folder' | 'file'
  children?: TreeNode[]
}

type Post = {
  path: string
  name: string
  title: string
  date: string | null
  category: string
  emoji: string
}

function isMdFile(path: string) {
  return /\.md$/i.test(path) && !path.includes('.swp')
}

function buildTree(mdPaths: string[]): TreeNode[] {
  const root: TreeNode[] = []

  for (const path of mdPaths) {
    const parts = path.split('/')
    let level = root
    parts.forEach((part, idx) => {
      const isLast = idx === parts.length - 1
      const existing = level.find((n) => n.name === part)
      if (!existing) {
        const node: TreeNode = isLast
          ? { name: part, path, type: 'file' }
          : { name: part, path: parts.slice(0, idx + 1).join('/'), type: 'folder', children: [] }
        level.push(node)
        if (!isLast) level = node.children!
      } else {
        level = existing.children ?? level
      }
    })
  }

  return root
}

const emojiFor = (dir: string) => {
  const map: Record<string, string> = {
    algorithm: '🧮',
    backend: '⚙️',
    database: '🗄️',
    devops: '☸️',
    etc: '📎',
    front: '🎨',
    lang: '💬',
    ubuntu: '🐧',
    web: '🌐',
  }
  const top = dir.split('/')[0]
  return map[top] ?? '📁'
}

function titleFromName(name: string): { title: string; date: string | null } {
  const base = name.replace(/\.md$/i, '')
  const m = base.match(/^(\d{4})(\d{2})(\d{2})[-_]?(.*)$/)
  if (m) {
    return {
      date: `${m[1]}-${m[2]}-${m[3]}`,
      title: m[4] ? m[4].replace(/[-_]/g, ' ') : `${m[1]}-${m[2]}-${m[3]}`,
    }
  }
  return { date: null, title: base.replace(/[-_]/g, ' ') }
}

function collectPosts(nodes: TreeNode[]): Post[] {
  const posts: Post[] = []
  const walk = (list: TreeNode[]) => {
    for (const n of list) {
      if (n.type === 'file') {
        const parts = n.path.split('/')
        const category = parts.length > 1 ? parts[0] : '기타'
        const { title, date } = titleFromName(n.name)
        posts.push({ path: n.path, name: n.name, title, date, category, emoji: emojiFor(category) })
      } else if (n.children) {
        walk(n.children)
      }
    }
  }
  walk(nodes)
  posts.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  return posts
}

/* fetch tree with localStorage cache + jsdelivr fallback */
async function fetchTree(): Promise<TreeNode[]> {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { time, tree } = JSON.parse(cached) as { time: number; tree: TreeNode[] }
      if (Date.now() - time < CACHE_TTL && Array.isArray(tree)) return tree
    }
  } catch {
    /* ignore */
  }

  try {
    const res = await fetch(TREE_URL)
    if (!res.ok) throw new Error(`tree api ${res.status}`)
    const data = (await res.json()) as { tree: { path: string }[] }
    const paths = data.tree.map((t) => t.path).filter(isMdFile)
    const tree = buildTree(paths)
    localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), tree }))
    return tree
  } catch {
    const res = await fetch(
      `https://data.jsdelivr.com/v1/packages/gh/${REPO}@${BRANCH}?structure=flat`,
    )
    if (!res.ok) throw new Error('failed to load study tree')
    const data = (await res.json()) as { files?: { name: string }[] }
    const paths = (data.files ?? [])
      .map((f) => f.name.replace(/^\/+/, ''))
      .filter(isMdFile)
    return buildTree(paths)
  }
}

function renderMarkdown(md: string, fileDir: string): string {
  currentDir = fileDir
  const html = marked.parse(md) as string
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'rel'],
  })
}

function selectedFromHash(): string | null {
  const h = window.location.hash.replace(/^#\/?/, '')
  if (h === 'study') return null
  if (h.startsWith('study/')) {
    const p = h.slice('study/'.length)
    try {
      return decodeURIComponent(p)
    } catch {
      return null
    }
  }
  return null
}

const dateBadge = (date: string | null) => {
  if (!date) return '📅 미정'
  const [y, m, d] = date.split('-')
  return `📅 ${y}.${m}.${d}`
}

export default function StudyPage() {
  const [tree, setTree] = useState<TreeNode[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(selectedFromHash)
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const posts = useMemo(() => (tree ? collectPosts(tree) : []), [tree])

  const categories = useMemo(() => {
    const map = new Map<string, Post[]>()
    for (const p of posts) {
      const arr = map.get(p.category) ?? []
      arr.push(p)
      map.set(p.category, arr)
    }
    return [...map.entries()]
      .map(([name, items]) => ({ name, emoji: emojiFor(name), count: items.length, items }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ko'))
  }, [posts])

  useEffect(() => {
    let alive = true
    fetchTree()
      .then((t) => {
        if (alive) setTree(t)
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : 'failed to load')
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const onHash = () => setSelected(selectedFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [selected])

  useEffect(() => {
    if (!selected) return
    let alive = true
    setLoading(true)
    setContent('')
    const dir = selected.includes('/') ? selected.split('/').slice(0, -1).join('/') : ''
    fetch(`${RAW_BASE}/${selected}`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`)
        return res.text()
      })
      .then((md) => {
        if (!alive) return
        setContent(renderMarkdown(md, dir))
      })
      .catch((e: unknown) => {
        if (alive)
          setContent(
            `<p class="md-error">⚠️ 글을 불러오지 못했습니다. (${e instanceof Error ? e.message : 'unknown'})</p>`,
          )
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [selected])

  const openPost = (path: string) => {
    window.location.hash = `#/study/${encodeURIComponent(path)}`
    setSelected(path)
  }
  const goBlogHome = () => {
    window.location.hash = '#/study'
    setSelected(null)
  }
  const goPortfolio = () => {
    window.location.hash = '#/'
  }

  const current = selected ? posts.find((p) => p.path === selected) : undefined
  const idx = current ? posts.indexOf(current) : -1
  const newer = idx > 0 ? posts[idx - 1] : undefined
  const older = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : undefined

  return (
    <div className="study-page">
      <header className="study-topbar">
        <button className="study-logo" onClick={goPortfolio}>
          SJ<span className="nav-logo-dot">.</span>
        </button>

        <button className="study-topbar-center" onClick={goBlogHome}>
          <span className="study-topbar-title">📚 Study Blog</span>
          <span className="study-topbar-sub">TIL · {REPO}</span>
        </button>

        <div className="study-topbar-right">
          <a
            className="study-repo-link"
            href={`https://github.com/${REPO}`}
            target="_blank"
            rel="noreferrer"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 2.89-.39c.98 0 1.97.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.68 5.38-5.24 5.67.41.36.77 1.06.77 2.14v3.18c0 .31.21.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
            </svg>
            <span>GitHub</span>
          </a>
          <PerformanceToggle />
          <ThemeToggle />
          <button className="study-home-btn" onClick={selected ? goBlogHome : goPortfolio}>
            {selected ? '← 목록' : '← Home'}
          </button>
        </div>
      </header>

      {selected ? (
        <main className="article-page">
          <nav className="article-breadcrumb">
            <button onClick={goBlogHome}>🏠 Blog</button>
            <span className="article-bc-sep">/</span>
            <span>
              {current?.emoji} {current?.category ?? ''}
            </span>
            <span className="article-bc-sep">/</span>
            <span className="article-bc-current">{current?.title ?? ''}</span>
          </nav>

          <div className="article-hero">
            <span className="article-hero-emoji">{current?.emoji ?? '📄'}</span>
            <h1 className="article-title">{current?.title ?? ''}</h1>
            <div className="article-meta">
              <span className="article-meta-chip">{current?.category ?? '기타'}</span>
              <span className="article-meta-chip">{dateBadge(current?.date ?? null)}</span>
              <span className="article-meta-chip article-meta-path">{current?.path ?? ''}</span>
            </div>
          </div>

          {loading && (
            <div className="article-loading">
              <span className="spinner" />
              <span>글을 불러오는 중...</span>
            </div>
          )}
          <article className="md-body" dangerouslySetInnerHTML={{ __html: content }} />

          <div className="article-nav">
            <button
              className="article-nav-btn"
              onClick={() => newer && openPost(newer.path)}
              disabled={!newer}
            >
              <span className="article-nav-dir">← 최신 글</span>
              <span className="article-nav-title">{newer ? newer.title : '첫 글입니다'}</span>
            </button>
            <button className="article-list-btn" onClick={goBlogHome}>
              📚 목록
            </button>
            <button
              className="article-nav-btn article-nav-right"
              onClick={() => older && openPost(older.path)}
              disabled={!older}
            >
              <span className="article-nav-dir">이전 글 →</span>
              <span className="article-nav-title">{older ? older.title : '마지막 글입니다'}</span>
            </button>
          </div>
        </main>
      ) : (
        <main className="blog-page">
          <div className="blog-hero">
            <div className="blog-hero-orb blog-hero-orb-a" />
            <div className="blog-hero-orb blog-hero-orb-b" />
            <span className="blog-hero-badge">📚 TIL · 학습 기록</span>
            <h1 className="blog-hero-title">
              Study <span className="grad-text">Blog</span>
            </h1>
            <p className="blog-hero-sub">
              {tree ? `${posts.length}개의 TIL을 카테고리별로 기록한 기술 블로그` : 'study 저장소에서 TIL을 불러오고 있어요'}
            </p>
            {tree && (
              <div className="blog-categories">
                {categories.map((cat) => (
                  <a
                    key={cat.name}
                    className="blog-cat-chip"
                    href={`#${cat.name}`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(`blog-cat-${cat.name}`)?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    <span>{cat.emoji}</span> {cat.name}
                    <b>{cat.count}</b>
                  </a>
                ))}
              </div>
            )}
          </div>

          {error && <div className="study-error blog-error">⚠️ {error}</div>}
          {!tree && !error && (
            <div className="study-loading blog-loading">
              <span className="spinner" />
              <span>블로그를 불러오는 중...</span>
            </div>
          )}

          {tree && (
            <div className="blog-sections">
              {categories.map((cat, ci) => (
                <section key={cat.name} id={`blog-cat-${cat.name}`} className="blog-category">
                  <Reveal delay={ci * 60}>
                    <header className="blog-cat-head">
                      <span className="blog-cat-emoji">{cat.emoji}</span>
                      <h2 className="blog-cat-name">{cat.name}</h2>
                      <span className="blog-cat-count">{cat.count}개</span>
                      <span className="blog-cat-line" />
                    </header>
                  </Reveal>

                  <div className="blog-post-list">
                    {cat.items.map((post, pi) => (
                      <Reveal key={post.path} delay={(ci % 3) * 40 + pi * 25}>
                        <button className="blog-post" onClick={() => openPost(post.path)}>
                          <span className="blog-post-emoji">{post.emoji}</span>
                          <span className="blog-post-body">
                            <span className="blog-post-title">{post.title}</span>
                            <span className="blog-post-path">{post.path}</span>
                          </span>
                          <span className="blog-post-date">{dateBadge(post.date)}</span>
                          <span className="blog-post-arrow">→</span>
                        </button>
                      </Reveal>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  )
}

/* tiny local reveal wrapper to avoid cross-imports */
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            setVisible(true)
            ob.disconnect()
          }
        })
      },
      { threshold: 0.08 },
    )
    ob.observe(el)
    return () => ob.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
