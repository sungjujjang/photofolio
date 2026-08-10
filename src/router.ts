export function navigate(path: string) {
  const target = path.startsWith('/') ? path : `/${path}`
  if (window.location.pathname !== target) {
    window.history.pushState(null, '', target)
  }
  window.dispatchEvent(new PopStateEvent('popstate'))
}
