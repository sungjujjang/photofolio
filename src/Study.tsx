import { useEffect, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { PerformanceToggle, ThemeToggle } from './theme'
import { navigate } from './router'

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

type Category = {
  name: string
  path: string
  emoji: string
  postCount: number
  subCount: number
}

type StudyRoute =
  | { view: 'home' }
  | { view: 'folder'; path: string }
  | { view: 'post'; path: string }

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

function postFromNode(n: TreeNode): Post {
  const parts = n.path.split('/')
  const category = parts.length > 1 ? parts[0] : '기타'
  const { title, date } = titleFromName(n.name)
  return { path: n.path, name: n.name, title, date, category, emoji: emojiFor(category) }
}

function collectPosts(nodes: TreeNode[]): Post[] {
  const posts: Post[] = []
  const walk = (list: TreeNode[]) => {
    for (const n of list) {
      if (n.type === 'file') posts.push(postFromNode(n))
      else if (n.children) walk(n.children)
    }
  }
  walk(nodes)
  posts.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  return posts
}

function countPosts(node: TreeNode): number {
  let count = 0
  const walk = (list: TreeNode[]) => {
    for (const n of list) {
      if (n.type === 'file') count++
      else if (n.children) walk(n.children)
    }
  }
  walk(node.children ?? [])
  return count
}

function findNode(nodes: TreeNode[], path: string): TreeNode | null {
  for (const n of nodes) {
    if (n.path === path) return n
    if (n.children) {
      const found = findNode(n.children, path)
      if (found) return found
    }
  }
  return null
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

function parseRoute(): StudyRoute {
  if (!window.location.pathname.startsWith('/study')) return { view: 'home' }
  const rel = window.location.pathname.slice('/study'.length).replace(/^\/+/, '')
  if (!rel) return { view: 'home' }
  let path = rel
  try {
    path = decodeURIComponent(rel)
  } catch {
    /* keep raw */
  }
  return isMdFile(path) ? { view: 'post', path } : { view: 'folder', path }
}

const dateBadge = (date: string | null) => {
  if (!date) return '📅 미정'
  const [y, m, d] = date.split('-')
  return `📅 ${y}.${m}.${d}`
}

export default function StudyPage() {
  const [tree, setTree] = useState<TreeNode[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [route, setRoute] = useState<StudyRoute>(parseRoute)
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const posts = useMemo(() => (tree ? collectPosts(tree) : []), [tree])

  const categories = useMemo<Category[]>(() => {
    if (!tree) return []
    const cats: Category[] = []
    for (const n of tree) {
      if (n.type === 'folder') {
        cats.push({
          name: n.name,
          path: n.path,
          emoji: emojiFor(n.path),
          postCount: countPosts(n),
          subCount: (n.children ?? []).filter((c) => c.type === 'folder').length,
        })
      }
    }
    const rootFiles = tree.filter((n) => n.type === 'file')
    if (rootFiles.length) {
      cats.push({ name: '기타', path: '__root__', emoji: '📄', postCount: rootFiles.length, subCount: 0 })
    }
    return cats
  }, [tree])

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
    const onPop = () => setRoute(parseRoute())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route])

  useEffect(() => {
    if (route.view !== 'post') return
    let alive = true
    setLoading(true)
    setContent('')
    const dir = route.path.includes('/') ? route.path.split('/').slice(0, -1).join('/') : ''
    fetch(`${RAW_BASE}/${route.path}`)
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
  }, [route])

  const openFolder = (path: string) => navigate(`/study/${encodeURI(path)}`)
  const openPost = (path: string) => navigate(`/study/${encodeURI(path)}`)
  const goHome = () => navigate('/study')
  const goPortfolio = () => {
    navigate('/')
    window.setTimeout(() => window.scrollTo(0, 0), 50)
  }
  const goAbout = () => {
    navigate('/')
    window.setTimeout(() => {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
    }, 120)
  }

  const activePath = route.view === 'home' ? '' : route.path
  const isActiveCat = (cat: Category) =>
    cat.path === '__root__'
      ? activePath === '__root__'
      : activePath === cat.path || activePath.startsWith(cat.path + '/')

  const current =
    route.view === 'post' ? posts.find((p) => p.path === route.path) : undefined
  const idx = current ? posts.indexOf(current) : -1
  const newer = idx > 0 ? posts[idx - 1] : undefined
  const older = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : undefined

  const folderNode =
    route.view === 'folder'
      ? route.path === '__root__'
        ? ({
            name: '기타',
            path: '__root__',
            type: 'folder',
            children: tree?.filter((n) => n.type === 'file'),
          } as TreeNode)
        : findNode(tree ?? [], route.path)
      : null

  const folderFiles = (folderNode?.children ?? [])
    .filter((c) => c.type === 'file')
    .map(postFromNode)
  const subFolders = (folderNode?.children ?? [])
    .filter((c) => c.type === 'folder')
    .map((f) => ({
      name: f.name,
      path: f.path,
      emoji: emojiFor(f.path),
      postCount: countPosts(f),
    }))

  const breadcrumb = useMemo(() => {
    if (route.view === 'home') return []
    if (route.path === '__root__') return [{ label: '기타', path: '__root__' }]
    const segs = route.path.split('/')
    const items: { label: string; path: string }[] = []
    let acc = ''
    segs.forEach((seg) => {
      acc = acc ? `${acc}/${seg}` : seg
      items.push({ label: seg, path: acc })
    })
    return items
  }, [route])

  return (
    <div className="study-page">
      <div className="study-header">
        <header className="study-topbar">
        <button className="study-logo" onClick={goPortfolio}>
          SJ<span className="nav-logo-dot">.</span>
        </button>

        <button className="study-topbar-center" onClick={goHome}>
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
          <button className="study-about-btn" onClick={goAbout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="1em" height="1em">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>소개</span>
          </button>
          <PerformanceToggle />
          <ThemeToggle />
        </div>
      </header>

      <nav className="study-catbar">
        <div className="study-catbar-inner">
        <button
          className={`study-cat-chip ${route.view === 'home' ? 'study-cat-chip-active' : ''}`}
          onClick={goHome}
        >
          🏠 전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat.path}
            className={`study-cat-chip ${isActiveCat(cat) ? 'study-cat-chip-active' : ''}`}
            onClick={() => (cat.path === '__root__' ? openFolder('__root__') : openFolder(cat.path))}
          >
            <span>{cat.emoji}</span> {cat.name}
            <b>{cat.postCount}</b>
          </button>
        ))}
        </div>
      </nav>
      </div>

      {route.view === 'post' ? (
        <main className="article-page">
          <nav className="article-breadcrumb">
            <button onClick={goHome}>🏠 Blog</button>
            <span className="article-bc-sep">/</span>
            {breadcrumb.slice(0, -1).map((item, bi) => (
              <span key={bi}>
                <button onClick={() => openFolder(item.path)}>
                  {item.label === '기타' ? '기타' : item.label}
                </button>
                <span className="article-bc-sep">/</span>
              </span>
            ))}
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
            <button className="article-list-btn" onClick={goHome}>
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
      ) : route.view === 'folder' ? (
        <main className="blog-page folder-page">
          <nav className="article-breadcrumb">
            <button onClick={goHome}>🏠 Blog</button>
            <span className="article-bc-sep">/</span>
            {breadcrumb.map((item, bi) => {
              const isLast = bi === breadcrumb.length - 1
              return (
                <span key={bi}>
                  {isLast ? (
                    <span className="article-bc-current">
                      {folderNode ? `${folderNode.name === '기타' ? '📄' : emojiFor(folderNode.path)} ${folderNode.name}` : item.label}
                    </span>
                  ) : (
                    <button onClick={() => openFolder(item.path)}>{item.label}</button>
                  )}
                  {!isLast && <span className="article-bc-sep">/</span>}
                </span>
              )
            })}
          </nav>

          {error && <div className="study-error blog-error">⚠️ {error}</div>}
          {!tree && !error && (
            <div className="study-loading blog-loading">
              <span className="spinner" />
              <span>폴더를 불러오는 중...</span>
            </div>
          )}

          {folderNode && (
            <>
              <header className="folder-hero">
                <span className="folder-hero-emoji">
                  {folderNode.path === '__root__' ? '📄' : emojiFor(folderNode.path)}
                </span>
                <h1 className="folder-hero-title">{folderNode.name === '기타' ? '기타' : folderNode.name}</h1>
                <p className="folder-hero-meta">
                  {subFolders.length}개 하위 폴더 · {folderFiles.length}개의 글
                </p>
              </header>

              {subFolders.length > 0 && (
                <section className="folder-section">
                  <h2 className="folder-section-title">📂 하위 폴더</h2>
                  <div className="folder-grid">
                    {subFolders.map((sub, si) => (
                      <Reveal key={sub.path} delay={si * 40}>
                        <button className="folder-card" onClick={() => openFolder(sub.path)}>
                          <span className="folder-card-emoji">{sub.emoji}</span>
                          <span className="folder-card-body">
                            <span className="folder-card-name">{sub.name}</span>
                            <span className="folder-card-sub">{sub.postCount}개의 글</span>
                          </span>
                          <span className="folder-card-arrow">→</span>
                        </button>
                      </Reveal>
                    ))}
                  </div>
                </section>
              )}

              {folderFiles.length > 0 && (
                <section className="folder-section">
                  <h2 className="folder-section-title">📝 글 목록</h2>
                  <div className="blog-post-list">
                    {folderFiles.map((post, pi) => (
                      <Reveal key={post.path} delay={pi * 25}>
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
              )}

              {subFolders.length === 0 && folderFiles.length === 0 && (
                <div className="folder-empty">📭 이 폴더에는 아직 글이 없어요.</div>
              )}
            </>
          )}
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
              {tree ? `${posts.length}개의 TIL을 폴더 구조로 기록한 기술 블로그` : 'study 저장소에서 TIL을 불러오고 있어요'}
            </p>
          </div>

          {error && <div className="study-error blog-error">⚠️ {error}</div>}
          {!tree && !error && (
            <div className="study-loading blog-loading">
              <span className="spinner" />
              <span>블로그를 불러오는 중...</span>
            </div>
          )}

          {tree && (
            <>
              <section className="folder-section">
                <h2 className="folder-section-title">🗂️ 카테고리</h2>
                <div className="blog-cat-grid">
                  {categories.map((cat, ci) => (
                    <Reveal key={cat.path} delay={ci * 50}>
                      <button
                        className="blog-cat-card"
                        onClick={() => (cat.path === '__root__' ? openFolder('__root__') : openFolder(cat.path))}
                      >
                        <span className="blog-cat-card-emoji">{cat.emoji}</span>
                        <span className="blog-cat-card-name">{cat.name}</span>
                        <span className="blog-cat-card-meta">
                          {cat.postCount}개의 글 · {cat.subCount}개 하위 폴더
                        </span>
                        <span className="blog-cat-card-arrow">들어가기 →</span>
                      </button>
                    </Reveal>
                  ))}
                </div>
              </section>

              <section className="folder-section">
                <h2 className="folder-section-title">✨ 최근 글</h2>
                <div className="blog-post-list">
                  {posts.slice(0, 8).map((post, pi) => (
                    <Reveal key={post.path} delay={pi * 25}>
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
            </>
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
