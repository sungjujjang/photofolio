import { useEffect, useMemo, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

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

export default function Study() {
  const [tree, setTree] = useState<TreeNode[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
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

  return (
    <section id="study" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Study TIL 📚</span>
          <h2 className="section-title">
            Study <span className="grad-text">Notes</span>
          </h2>
          <p className="section-sub">
            GitHub의 <code className="inline-code">study</code> 저장소 TIL · 파일 클릭해서 보세요
          </p>
        </div>

        <div className="study-layout">
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

          <div className="study-content">
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
          </div>
        </div>
      </div>
    </section>
  )
}
