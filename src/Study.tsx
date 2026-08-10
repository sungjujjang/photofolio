import { useEffect, useMemo, useState } from 'react'
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

  const sortRecursive = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return a.name.localeCompare(b.name, 'ko')
    })
    nodes.forEach((n) => n.children && sortRecursive(n.children))
  }
  sortRecursive(root)

  const pruneEmpty = (nodes: TreeNode[]) => {
    const pruned: TreeNode[] = []
    for (const n of nodes) {
      if (n.type === 'folder') {
        if (!n.children || n.children.length === 0) continue
        const kids = pruneEmpty(n.children)
        if (kids.length === 0) continue
        pruned.push({ ...n, children: kids })
      } else {
        pruned.push(n)
      }
    }
    return pruned
  }

  return pruneEmpty(root)
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

function FileTree({
  nodes,
  depth,
  selected,
  onSelect,
}: {
  nodes: TreeNode[]
  depth: number
  selected: string | null
  onSelect: (path: string) => void
}) {
  return (
    <>
      {nodes.map((node) =>
        node.type === 'folder' ? (
          <FolderNode key={node.path} node={node} depth={depth} selected={selected} onSelect={onSelect} />
        ) : (
          <button
            key={node.path}
            className={`tree-file ${selected === node.path ? 'tree-file-active' : ''}`}
            style={{ paddingLeft: `${16 + depth * 18}px` }}
            onClick={() => onSelect(node.path)}
          >
            <span className="tree-file-icon">📄</span>
            <span className="tree-file-name">{node.name}</span>
          </button>
        ),
      )}
    </>
  )
}

function FolderNode({
  node,
  depth,
  selected,
  onSelect,
}: {
  node: TreeNode
  depth: number
  selected: string | null
  onSelect: (path: string) => void
}) {
  const [open, setOpen] = useState(depth < 1)
  const children = node.children ?? []

  return (
    <div className="tree-folder">
      <button
        className="tree-folder-head"
        style={{ paddingLeft: `${16 + depth * 18}px` }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`tree-caret ${open ? 'tree-caret-open' : ''}`}>▸</span>
        <span className="tree-folder-icon">{emojiFor(node.path)}</span>
        <span className="tree-folder-name">{node.name}</span>
        <span className="tree-folder-count">{children.length}</span>
      </button>
      {open && (
        <div className="tree-children">
          <FileTree nodes={children} depth={depth + 1} selected={selected} onSelect={onSelect} />
        </div>
      )}
    </div>
  )
}

function findFirstFile(nodes: TreeNode[]): string | null {
  for (const n of nodes) {
    if (n.type === 'file') return n.path
    if (n.children) {
      const found = findFirstFile(n.children)
      if (found) return found
    }
  }
  return null
}

export default function StudyPage() {
  const [tree, setTree] = useState<TreeNode[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    let alive = true
    fetchTree()
      .then((t) => {
        if (!alive) return
        setTree(t)
        const first = findFirstFile(t)
        if (first) setSelected(first)
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : 'failed to load')
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!selected) return
    let alive = true
    setLoading(true)
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
        if (alive) setContent(`<p class="md-error">⚠️ 파일을 불러오지 못했습니다. (${e instanceof Error ? e.message : 'unknown'})</p>`)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [selected])

  const doc = selected ?? ''
  const title = useMemo(() => {
    if (!doc) return ''
    const base = doc.split('/').pop() ?? ''
    return base.replace(/^\d+[-_]?/, '').replace(/\.md$/i, '').replace(/[-_]/g, ' ')
  }, [doc])

  const goHome = () => {
    window.location.hash = '#/'
  }

  return (
    <div className="study-page">
      <header className="study-topbar">
        <button className="study-logo" onClick={goHome}>
          SJ<span className="nav-logo-dot">.</span>
        </button>

        <div className="study-topbar-center">
          <span className="study-topbar-title">📚 Study Blog</span>
          <span className="study-topbar-sub">TIL · {REPO}</span>
        </div>

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
          <button className="study-home-btn" onClick={goHome}>
            ← <span>Home</span>
          </button>
        </div>
      </header>

      <div className="study-container">
        <aside className="study-sidebar">
          <div className="study-sidebar-head">
            <span className="study-repo-icon">📦</span>
            <div>
              <div className="study-repo-name">study</div>
              <div className="study-repo-branch">branch · main</div>
            </div>
          </div>

          {error && <div className="study-error">⚠️ {error}</div>}
          {!tree && !error && (
            <div className="study-loading">
              <span className="spinner" />
              <span>트리 로딩 중...</span>
            </div>
          )}
          {tree && (
            <div className="tree-scroll">
              <FileTree nodes={tree} depth={0} selected={selected} onSelect={setSelected} />
            </div>
          )}
        </aside>

        <main className="study-content">
          {!selected && !error && (
            <div className="study-empty">
              <span className="study-empty-icon">👈</span>
              <p>왼쪽에서 TIL 파일을 선택하세요</p>
            </div>
          )}
          {selected && (
            <>
              <div className="study-doc-head">
                <h3 className="study-doc-title">{title}</h3>
                <div className="study-doc-meta">
                  <span className="study-doc-path">{selected}</span>
                  {loading && <span className="study-doc-loading">불러오는 중...</span>}
                </div>
              </div>
              <article
                className="md-body"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </>
          )}
        </main>
      </div>
    </div>
  )
}
