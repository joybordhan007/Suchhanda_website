// Vite's BASE_URL always ends with "/" and may be a full URL when deployed.
const baseUrl = import.meta.env.BASE_URL

// Pathname the site is served under, without a trailing slash ("" at the domain root).
export const basePath = new URL(baseUrl, window.location.origin).pathname.replace(
  /\/+$/,
  "",
)

export const assetPathPrefix = `${baseUrl}assets`

export function asset(file: string) {
  return `${assetPathPrefix}/${file}`
}

// Image URL from content: "/uploads/x.png" and "/assets/x.png" live on this site,
// anything else must be an http(s) link.
export function mediaUrl(src: string | undefined) {
  if (!src) return ""
  if (src.startsWith("/")) return withBase(src)
  return /^https?:\/\//i.test(src) ? src : ""
}

// Link from content, limited to schemes that are safe to put in an href.
export function safeHref(url: string | undefined) {
  if (!url) return "#"
  if (url.startsWith("/")) return withBase(url)
  return /^(https?:|mailto:|tel:)/i.test(url.trim()) ? url.trim() : "#"
}

// "/work#card" -> "/sub/work#card"
export function withBase(route: string) {
  return `${basePath}${route}`
}

// "/sub/work/" -> "/work"; returns null when the path is outside the site.
export function stripBase(pathname: string) {
  if (basePath && pathname !== basePath && !pathname.startsWith(`${basePath}/`)) {
    return null
  }
  return pathname.slice(basePath.length).replace(/\/+$/, "") || "/"
}
