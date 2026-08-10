import { useEffect, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { PerformanceToggle, ThemeToggle } from './theme'
import { navigate } from './router'

const REPO = 'sungjujjang/study'
const BRANCH = 'main'
const VELOG = 'https://velog.io/@sungjujjang/posts'
const VELOG_USER = 'sungjujjang'
const VELOG_API = '/velog-api'
const VELOG_CACHE_KEY = 'ksec-velog-posts-v2'
const VELOG_CACHE_TTL = 6 * 60 * 60 * 1000
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

type VelogPost = {
  id: string
  title: string
  urlSlug: string
  releasedAt: string
  tags: string[]
  seriesId: string | null
  seriesName: string | null
}

type StudyRoute =
  | { view: 'home' }
  | { view: 'folder'; path: string }
  | { view: 'post'; path: string }
  | { view: 'velog' }
  | { view: 'velog-series'; id: string }
  | { view: 'velog-post'; slug: string }

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

/* fetch Velog posts via same-origin proxy (/velog-api -> v2.velog.io/graphql) */
async function fetchVelogPosts(): Promise<VelogPost[]> {
  try {
    const cached = localStorage.getItem(VELOG_CACHE_KEY)
    if (cached) {
      const { time, posts } = JSON.parse(cached) as { time: number; posts: VelogPost[] }
      if (Date.now() - time < VELOG_CACHE_TTL && Array.isArray(posts)) return posts
    }
  } catch {
    /* ignore */
  }

  const res = await fetch(VELOG_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query Posts($username: String!, $limit: Int) {
        posts(username: $username, limit: $limit) {
          id title url_slug released_at tags
          series { id name }
        }
      }`,
      variables: { username: VELOG_USER, limit: 100 },
    }),
  })
  if (!res.ok) throw new Error(`velog api ${res.status}`)
  const data = (await res.json()) as {
    data?: {
      posts?: {
        id: string
        title: string
        url_slug: string
        released_at: string
        tags?: string[]
        series?: { id: string; name: string } | null
      }[]
    }
  }
  const posts = (data.data?.posts ?? [])
    .map((p) => ({
      id: p.id,
      title: p.title,
      urlSlug: p.url_slug,
      releasedAt: p.released_at,
      tags: p.tags ?? [],
      seriesId: p.series?.id ?? null,
      seriesName: p.series?.name ?? null,
    }))
    .sort((a, b) => b.releasedAt.localeCompare(a.releasedAt))
  try {
    localStorage.setItem('ksec-velog-posts-v2', JSON.stringify({ time: Date.now(), posts }))
  } catch {
    /* ignore */
  }
  return posts
}

async function fetchVelogPostBody(slug: string): Promise<string> {
  const res = await fetch(VELOG_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query Post($username: String!, $url_slug: String) {
        post(username: $username, url_slug: $url_slug) { body }
      }`,
      variables: { username: VELOG_USER, url_slug: slug },
    }),
  })
  if (!res.ok) throw new Error(`velog api ${res.status}`)
  const data = (await res.json()) as { data?: { post?: { body?: string } | null } }
  const body = data.data?.post?.body
  if (!body) throw new Error('empty velog post')
  return renderMarkdown(body, '')
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
  if (path === 'velog') return { view: 'velog' }
  if (path.startsWith('velog/series/')) {
    let id = path.slice('velog/series/'.length)
    try {
      id = decodeURIComponent(id)
    } catch {
      /* keep raw */
    }
    return { view: 'velog-series', id }
  }
  if (path.startsWith('velog/')) {
    return { view: 'velog-post', slug: path.slice('velog/'.length) }
  }
  return isMdFile(path) ? { view: 'post', path } : { view: 'folder', path }
}

const dateText = (date: string | null) => {
  if (!date) return '미정'
  const [y, m, d] = date.split('-')
  return `${y}.${m}.${d}`
}

type GrassDay = { date: string; count: number }
type GrassYearData = { weeks: GrassDay[][]; activeDays: number }
type GrassData = { years: string[]; perYear: Record<string, GrassYearData>; streak: number }

const keyOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function buildYearGrass(year: number, counts: Map<string, number>): GrassYearData {
  const keys = [...counts.keys()]
    .filter((k) => k.startsWith(`${year}-`) && (counts.get(k) ?? 0) > 0)
    .sort()
  if (!keys.length) return { weeks: [], activeDays: 0 }

  const parse = (k: string) =>
    new Date(Number(k.slice(0, 4)), Number(k.slice(5, 7)) - 1, Number(k.slice(8, 10)))

  const start = parse(keys[0])
  start.setDate(start.getDate() - start.getDay())

  const now = new Date()
  const end = year === now.getFullYear() ? now : parse(keys[keys.length - 1])
  end.setHours(0, 0, 0, 0)
  end.setDate(end.getDate() + (6 - end.getDay()))
  const endKey = keyOf(end)

  const weeks: GrassDay[][] = []
  const cur = new Date(start)
  let activeDays = 0
  while (keyOf(cur) <= endKey) {
    const week: GrassDay[] = []
    for (let dow = 0; dow < 7; dow++) {
      const key = keyOf(cur)
      const count = counts.get(key) ?? 0
      if (count > 0) activeDays++
      week.push({ date: key, count })
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
  }
  return { weeks, activeDays }
}

function buildGrassData(posts: Post[]): GrassData {
  const counts = new Map<string, number>()
  for (const p of posts) {
    if (p.date) counts.set(p.date, (counts.get(p.date) ?? 0) + 1)
  }

  const now = new Date()
  const years = new Set<number>([now.getFullYear()])
  for (const k of counts.keys()) years.add(Number(k.slice(0, 4)))
  const sorted = [...years].sort((a, b) => b - a)

  const perYear: Record<string, GrassYearData> = {}
  for (const y of sorted) perYear[String(y)] = buildYearGrass(y, counts)

  let streak = 0
  const cursor = new Date(now)
  cursor.setHours(0, 0, 0, 0)
  if (!counts.get(keyOf(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (counts.get(keyOf(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return { years: sorted.map(String), perYear, streak }
}

const grassLevel = (count: number) =>
  count <= 0 ? 0 : count === 1 ? 1 : count <= 2 ? 2 : count <= 4 ? 3 : 4

const monthLabel = (date: string) => `${Number(date.slice(5, 7))}월`

export default function StudyPage() {
  const [tree, setTree] = useState<TreeNode[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [route, setRoute] = useState<StudyRoute>(parseRoute)
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [velogPosts, setVelogPosts] = useState<VelogPost[]>([])
  const [velogLoading, setVelogLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const posts = useMemo(() => (tree ? collectPosts(tree) : []), [tree])

  const recentPosts = useMemo(() => {
    const items = [
      ...posts.map((p) => ({
        key: p.path,
        title: p.title,
        path: p.path,
        sub: p.path,
        emoji: p.emoji,
        date: p.date,
      })),
      ...velogPosts.map((v) => ({
        key: `velog/${v.urlSlug}`,
        title: v.title,
        path: `velog/${v.urlSlug}`,
        sub: v.tags.length ? `Velog · ${v.tags.map((t) => `#${t}`).join(' ')}` : 'Velog',
        emoji: '✍️',
        date: v.releasedAt.slice(0, 10),
      })),
    ]
    return items.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).slice(0, 8)
  }, [posts, velogPosts])

  const velogSeries = useMemo(() => {
    const map = new Map<string, { id: string; name: string; posts: VelogPost[] }>()
    for (const v of velogPosts) {
      if (!v.seriesId) continue
      let s = map.get(v.seriesId)
      if (!s) {
        s = { id: v.seriesId, name: v.seriesName ?? '시리즈', posts: [] }
        map.set(v.seriesId, s)
      }
      s.posts.push(v)
    }
    return [...map.values()].sort((a, b) =>
      (b.posts[0]?.releasedAt ?? '').localeCompare(a.posts[0]?.releasedAt ?? ''),
    )
  }, [velogPosts])

  const velogUngrouped = useMemo(() => velogPosts.filter((v) => !v.seriesId), [velogPosts])

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
    cats.push({ name: 'Velog', path: 'velog', emoji: '✍️', postCount: velogPosts.length, subCount: 0 })
    return cats
  }, [tree, velogPosts])

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
    let alive = true
    setVelogLoading(true)
    fetchVelogPosts()
      .then((vp) => {
        if (alive) setVelogPosts(vp)
      })
      .catch(() => {
        /* velog fail은 study 동작에 영향 없음 */
      })
      .finally(() => alive && setVelogLoading(false))
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
    if (route.view !== 'post' && route.view !== 'velog-post') return
    let alive = true
    setLoading(true)
    setContent('')
    const load =
      route.view === 'post'
        ? (() => {
            const dir = route.path.includes('/') ? route.path.split('/').slice(0, -1).join('/') : ''
            return fetch(`${RAW_BASE}/${route.path}`)
              .then((res) => {
                if (!res.ok) throw new Error(`${res.status}`)
                return res.text()
              })
              .then((md) => renderMarkdown(md, dir))
          })()
        : fetchVelogPostBody(route.slug)
    load
      .then((html) => {
        if (alive) setContent(html)
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
  const openVelogPost = (slug: string) => navigate(`/study/velog/${encodeURIComponent(slug)}`)
  const goHome = () => navigate('/study')
  const goPortfolio = () => {
    navigate('/')
    window.setTimeout(() => window.scrollTo(0, 0), 50)
  }

  const refreshTree = () => {
    setRefreshing(true)
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch {
      /* ignore */
    }
    fetchTree()
      .then((t) => setTree(t))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'failed to load'))
      .finally(() => setRefreshing(false))
  }

  const activePath =
    route.view === 'folder' || route.view === 'post'
      ? route.path
      : route.view === 'velog' || route.view === 'velog-post' || route.view === 'velog-series'
        ? 'velog'
        : ''
  const isActiveCat = (cat: Category) => {
    if (cat.path === '__root__') return activePath === '__root__'
    if (cat.path === 'velog') return activePath === 'velog' || activePath.startsWith('velog/')
    return activePath === cat.path || activePath.startsWith(cat.path + '/')
  }

  const isVelogPost = route.view === 'velog-post'
  const velogItem = isVelogPost
    ? velogPosts.find((v) => v.urlSlug === route.slug)
    : undefined
  const velogSeriesItem =
    route.view === 'velog-series' ? velogSeries.find((s) => s.id === route.id) : undefined
  const current =
    route.view === 'post'
      ? posts.find((p) => p.path === route.path)
      : isVelogPost
        ? velogItem
          ? {
              title: velogItem.title,
              date: velogItem.releasedAt.slice(0, 10),
              category: 'Velog',
              emoji: '✍️',
              path: `velog/${velogItem.urlSlug}`,
            }
          : undefined
        : undefined

  const sourceUrl = isVelogPost
    ? velogItem
      ? `https://velog.io/@${VELOG_USER}/${velogItem.urlSlug}`
      : undefined
    : route.view === 'post' && current
      ? `https://github.com/${REPO}/blob/${BRANCH}/${current.path}`
      : undefined

  useEffect(() => {
    const site = '장성주 (SungJu)'
    if (route.view === 'post' && current) {
      document.title = `${current.title} · Study TIL · ${site}`
    } else if (route.view === 'velog-post' && current) {
      document.title = `${current.title} · ${site}`
    } else if (route.view === 'velog-series' && velogSeriesItem) {
      document.title = `${velogSeriesItem.name} 시리즈 · Study TIL · ${site}`
    } else if (route.view === 'velog') {
      document.title = `Velog 포스팅 · Study TIL · ${site}`
    } else if (route.view === 'folder') {
      const name =
        route.path === '__root__'
          ? '기타 TIL'
          : `${decodeURIComponent(route.path.split('/').pop() ?? '')} TIL`
      document.title = `${name} · Study TIL · ${site}`
    } else {
      document.title = 'Study TIL · 장성주 (SungJu)'
    }
    const canonical =
      document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonical) canonical.href = `https://dev.sungju.xyz${window.location.pathname}`
  }, [route, current, velogSeriesItem])

  const navList = useMemo(
    () =>
      isVelogPost
        ? velogPosts.map((v) => ({
            key: v.urlSlug,
            title: v.title,
            date: v.releasedAt.slice(0, 10),
          }))
        : posts.map((p) => ({ key: p.path, title: p.title, date: p.date })),
    [isVelogPost, velogPosts, posts],
  )
  const navKey =
    route.view === 'velog-post'
      ? route.slug
      : route.view === 'post' || route.view === 'folder'
        ? route.path
        : ''
  const idx = current ? navList.findIndex((n) => n.key === navKey) : -1
  const newer = idx > 0 ? navList[idx - 1] : undefined
  const older = idx >= 0 && idx < navList.length - 1 ? navList[idx + 1] : undefined
  const goNav = (item: { key: string }) => (isVelogPost ? openVelogPost(item.key) : openPost(item.key))

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
    if (
      route.view === 'home' ||
      route.view === 'velog' ||
      route.view === 'velog-series' ||
      route.view === 'velog-post'
    )
      return []
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
        <div className="study-topbar-left">
          <button className="study-logo" onClick={goPortfolio}>
            SJ<span className="nav-logo-dot">.</span>
          </button>
          <span className="study-topbar-divider" />
          <button className="study-topbar-brand" onClick={goHome}>
            <span className="study-topbar-title">📚 Study TIL</span>
            <span className="study-topbar-sub">TIL · {REPO}</span>
          </button>
        </div>

        <div className="study-topbar-right">
          <button
            className="study-repo-link study-refresh-btn"
            onClick={refreshTree}
            disabled={refreshing}
            title="TIL 목록 새로고침 (GitHub 캐시 갱신)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="1em" height="1em">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
            <span>{refreshing ? '갱신 중...' : '새로고침'}</span>
          </button>
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
          <a
            className="study-repo-link"
            href={VELOG}
            target="_blank"
            rel="noreferrer"
          >
            ✍️ <span>Velog</span>
          </a>
          <a className="study-about-btn" href="https://dev.sungju.xyz/" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="1em" height="1em">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>소개</span>
          </a>
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

      {route.view === 'post' || route.view === 'velog-post' ? (
        <main className="article-page">
          <nav className="article-breadcrumb">
            <button onClick={goHome}>🏠</button>
            <span className="article-bc-sep">/</span>
            {isVelogPost ? (
              <>
                <button onClick={() => navigate('/study/velog')}>Velog</button>
                <span className="article-bc-sep">/</span>
              </>
            ) : (
              breadcrumb.slice(0, -1).map((item, bi) => (
                <span key={bi}>
                  <button onClick={() => openFolder(item.path)}>
                    {item.label === '기타' ? '기타' : item.label}
                  </button>
                  <span className="article-bc-sep">/</span>
                </span>
              ))
            )}
            <span className="article-bc-current">{current?.title ?? ''}</span>
          </nav>

          <div className="article-hero">
            <span className="article-hero-emoji">{current?.emoji ?? '📄'}</span>
            <h1 className="article-title">{current?.title ?? ''}</h1>
            <div className="article-meta">
              <span className="article-meta-chip">{current?.category ?? '기타'}</span>
              <span className="article-meta-chip">📅 {dateText(current?.date ?? null)}</span>
              <span className="article-meta-chip article-meta-path">{current?.path ?? ''}</span>
              {isVelogPost && velogItem && velogItem.seriesId && (
                <button
                  className="article-meta-chip article-series-chip"
                  onClick={() => navigate(`/study/velog/series/${encodeURIComponent(velogItem.seriesId!)}`)}
                >
                  📚 {velogItem.seriesName ?? '시리즈'}
                </button>
              )}
              {isVelogPost && velogItem && velogItem.tags.length > 0 && (
                <span className="velog-tags">
                  {velogItem.tags.map((t) => (
                    <span key={t} className="velog-tag">
                      #{t}
                    </span>
                  ))}
                </span>
              )}
              {sourceUrl && (
                <a className="article-source-btn" href={sourceUrl} target="_blank" rel="noreferrer">
                  {isVelogPost ? '원본 Velog 보기 ↗' : 'GitHub 원문 보기 ↗'}
                </a>
              )}
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
              onClick={() => newer && goNav(newer)}
              disabled={!newer}
            >
              <span className="article-nav-dir">← 최신 글</span>
              <span className="article-nav-title">{newer ? newer.title : '첫 글입니다'}</span>
            </button>
            <button
              className="article-list-btn"
              onClick={isVelogPost ? () => navigate('/study/velog') : goHome}
            >
              📚 목록
            </button>
            <button
              className="article-nav-btn article-nav-right"
              onClick={() => older && goNav(older)}
              disabled={!older}
            >
              <span className="article-nav-dir">이전 글 →</span>
              <span className="article-nav-title">{older ? older.title : '마지막 글입니다'}</span>
            </button>
          </div>
        </main>
      ) : route.view === 'velog' || route.view === 'velog-series' ? (
        <main className="blog-page folder-page">
          <nav className="article-breadcrumb">
            <button onClick={goHome}>🏠</button>
            <span className="article-bc-sep">/</span>
            {route.view === 'velog-series' ? (
              <>
                <button onClick={() => navigate('/study/velog')}>Velog</button>
                <span className="article-bc-sep">/</span>
                <span className="article-bc-current">{velogSeriesItem?.name ?? ''}</span>
              </>
            ) : (
              <span className="article-bc-current">Velog</span>
            )}
          </nav>

          <header className="folder-hero">
            <span className="folder-hero-emoji">
              {route.view === 'velog-series' ? '📚' : '✍️'}
            </span>
            <div className="folder-hero-body">
              <h1 className="folder-hero-title">
                {route.view === 'velog-series'
                  ? velogSeriesItem?.name ?? '시리즈'
                  : 'Velog'}
              </h1>
              <p className="folder-hero-meta">
                {route.view === 'velog-series'
                  ? `${velogSeriesItem?.posts.length ?? 0}개의 글 · ${VELOG_USER} Velog`
                  : `${velogPosts.length}개의 포스팅 · `}
                {route.view !== 'velog-series' && (
                  <a className="inline-link" href={VELOG} target="_blank" rel="noreferrer">
                    velog.io 열기 ↗
                  </a>
                )}
              </p>
            </div>
          </header>

          {velogLoading && !velogPosts.length && (
            <div className="study-loading blog-loading">
              <span className="spinner" />
              <span>Velog 글을 불러오는 중...</span>
            </div>
          )}
          {!velogLoading && !velogPosts.length && (
            <div className="study-error blog-error">⚠️ Velog 글을 불러오지 못했습니다.</div>
          )}

          {route.view === 'velog' ? (
            <>
              {velogSeries.length > 0 && (
                <section className="folder-section">
                  <h2 className="folder-section-title">📚 시리즈</h2>
                  <div className="folder-grid">
                    {velogSeries.map((s, si) => (
                      <Reveal key={s.id} delay={si * 40}>
                        <button
                          className="study-card folder-card"
                          onClick={() => navigate(`/study/velog/series/${encodeURIComponent(s.id)}`)}
                        >
                          <span className="study-tile">📚</span>
                          <span className="folder-card-body">
                            <span className="folder-card-name">{s.name}</span>
                            <span className="folder-card-sub">{s.posts.length}개의 글</span>
                          </span>
                          <span className="folder-card-arrow">→</span>
                        </button>
                      </Reveal>
                    ))}
                  </div>
                </section>
              )}
              {velogUngrouped.length > 0 && (
                <section className="folder-section">
                  <h2 className="folder-section-title">📄 기타 글</h2>
                  <div className="blog-post-list">
                    {velogUngrouped.map((v, vi) => (
                      <VelogPostRow
                        key={v.urlSlug}
                        post={v}
                        delay={vi * 25}
                        onOpen={openVelogPost}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            velogSeriesItem && (
              <section className="folder-section">
                <h2 className="folder-section-title">📝 시리즈 글</h2>
                <div className="blog-post-list">
                  {velogSeriesItem.posts.map((v, vi) => (
                    <VelogPostRow
                      key={v.urlSlug}
                      post={v}
                      delay={vi * 25}
                      onOpen={openVelogPost}
                    />
                  ))}
                </div>
              </section>
            )
          )}
        </main>
      ) : route.view === 'folder' ? (
        <main className="blog-page folder-page">
          <nav className="article-breadcrumb">
            <button onClick={goHome}>🏠</button>
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
                <div className="folder-hero-body">
                  <h1 className="folder-hero-title">{folderNode.name === '기타' ? '기타' : folderNode.name}</h1>
                  <p className="folder-hero-meta">
                    {subFolders.length}개 하위 폴더 · {folderFiles.length}개의 글
                  </p>
                </div>
              </header>

              {subFolders.length > 0 && (
                <section className="folder-section">
                  <h2 className="folder-section-title">📂 하위 폴더</h2>
                  <div className="folder-grid">
                    {subFolders.map((sub, si) => (
                      <Reveal key={sub.path} delay={si * 40}>
                        <button className="study-card folder-card" onClick={() => openFolder(sub.path)}>
                          <span className="study-tile">{sub.emoji}</span>
                          <span className="folder-card-body">
                            <span className="folder-card-name">{sub.name}</span>
                            <span className="folder-card-sub">{sub.postCount} TIL</span>
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
                        <button className="study-card blog-post" onClick={() => openPost(post.path)}>
                          <span className="study-tile blog-post-emoji">{post.emoji}</span>
                          <span className="blog-post-body">
                            <span className="blog-post-title">{post.title}</span>
                            <span className="blog-post-path">{post.path}</span>
                          </span>
                          <span className="blog-post-date">{dateText(post.date)}</span>
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
            <span className="blog-hero-kicker">// {REPO}</span>
            <h1 className="blog-hero-title">
              Study <span className="blog-hero-grad">TIL</span>
            </h1>
            <p className="blog-hero-desc">
              하나씩 쌓은 학습 기록을 폴더 구조로 정리한 개발 블로그예요.
            </p>
            <div className="blog-hero-stats">
              <span className="blog-hero-stat">
                <b>{tree ? posts.length : '–'}</b>
                <span>TIL</span>
              </span>
              <span className="blog-hero-stat">
                <b>{tree ? categories.length : '–'}</b>
                <span>카테고리</span>
              </span>
              <span className="blog-hero-stat">
                <b>{tree && posts[0]?.date ? dateText(posts[0].date) : '–'}</b>
                <span>최근 TIL</span>
              </span>
            </div>
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
              <TILGrass posts={posts} />

              <section className="folder-section">
                <h2 className="folder-section-title">🗂️ 카테고리</h2>
                <div className="blog-cat-grid">
                  {categories.map((cat, ci) => (
                    <Reveal key={cat.path} delay={ci * 50}>
                      <button
                        className="study-card blog-cat-card"
                        onClick={() => (cat.path === '__root__' ? openFolder('__root__') : openFolder(cat.path))}
                      >
                        <span className="blog-cat-card-top">
                          <span className="study-tile">{cat.emoji}</span>
                          <span className="blog-cat-card-count">{cat.postCount} TIL</span>
                        </span>
                        <span className="blog-cat-card-name">{cat.name}</span>
                        <span className="blog-cat-card-meta">
                          {cat.path === 'velog'
                            ? 'Velog에 쓴 포스팅 모음'
                            : cat.path === '__root__'
                              ? '루트에 작성된 글 모음'
                              : cat.subCount > 0
                                ? `${cat.subCount}개의 하위 폴더로 구성`
                                : '한 폴더에 모은 학습 기록'}
                        </span>
                        <span className="blog-cat-card-cta">카테고리 열기 →</span>
                      </button>
                    </Reveal>
                  ))}
                </div>
              </section>

              <section className="folder-section">
                <h2 className="folder-section-title">✨ 최근 글</h2>
                <div className="blog-post-list">
                  {recentPosts.map((post, pi) => (
                    <Reveal key={post.key} delay={pi * 25}>
                      <button className="study-card blog-post" onClick={() => openPost(post.path)}>
                        <span className="study-tile blog-post-emoji">{post.emoji}</span>
                        <span className="blog-post-body">
                          <span className="blog-post-title">{post.title}</span>
                          <span className="blog-post-path">{post.sub}</span>
                        </span>
                        <span className="blog-post-date">{dateText(post.date)}</span>
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

/* GitHub-style contribution graph */
function TILGrass({ posts }: { posts: Post[] }) {
  const { years, perYear, streak } = useMemo(() => buildGrassData(posts), [posts])
  const [year, setYear] = useState(years[0] ?? String(new Date().getFullYear()))

  useEffect(() => {
    if (!years.includes(year)) setYear(years[0] ?? String(new Date().getFullYear()))
  }, [years, year])

  const data = perYear[year] ?? { weeks: [], activeDays: 0 }

  return (
    <section className="folder-section">
      <h2 className="folder-section-title">🌱 TIL 잔디</h2>
      <div className="tl-grass-card">
        <div className="tl-grass-head">
          <span className="tl-grass-stat">
            <b>{data.activeDays}</b>
            <span>{year} · 일 동안 기록</span>
          </span>
          <span className="tl-grass-stat">
            <b>{streak}</b>
            <span>연속 TIL</span>
          </span>
          <span className="tl-grass-legend">
            <span>적음</span>
            {[0, 1, 2, 3, 4].map((l) => (
              <i key={l} className={`tl-grass-cell tl-grass-${l}`} />
            ))}
            <span>많음</span>
          </span>
        </div>
        <div className="tl-grass-years">
          {years.map((y) => (
            <button
              key={y}
              className={`tl-grass-year ${y === year ? 'tl-grass-year-active' : ''}`}
              onClick={() => setYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
        <div className="tl-grass-scroll">
          <div className="tl-grass-inner">
            <div className="tl-grass-months">
              {data.weeks.map((week, wi) => {
                const first = week.find((d) => d.date.endsWith('-01'))
                return (
                  <span key={wi} className="tl-grass-month">
                    {first ? monthLabel(first.date) : ''}
                  </span>
                )
              })}
            </div>
            <div className="tl-grass-grid">
              {data.weeks.map((week, wi) => (
                <div key={wi} className="tl-grass-week">
                  {week.map((d) => (
                    <div
                      key={d.date}
                      className={`tl-grass-cell tl-grass-${grassLevel(d.count)}`}
                      title={d.count > 0 ? `${d.date} · TIL ${d.count}개` : d.date}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* Velog list row shared by overview + series views */
function VelogPostRow({
  post,
  delay,
  onOpen,
}: {
  post: VelogPost
  delay: number
  onOpen: (slug: string) => void
}) {
  return (
    <Reveal key={post.urlSlug} delay={delay}>
      <button className="study-card blog-post" onClick={() => onOpen(post.urlSlug)}>
        <span className="study-tile blog-post-emoji">✍️</span>
        <span className="blog-post-body">
          <span className="blog-post-title">{post.title}</span>
          <span className="blog-post-path">
            Velog · {post.tags.length ? post.tags.map((t) => `#${t}`).join(' ') : '포스팅'}
          </span>
        </span>
        <span className="blog-post-date">{dateText(post.releasedAt.slice(0, 10))}</span>
      </button>
    </Reveal>
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
