import { lazy, startTransition, Suspense, useEffect, useLayoutEffect, useMemo, useState, type ComponentType } from "react"
import { googleFontsHref, loadGoogleFonts, usedGoogleFonts } from "./content/fonts"
import { loadContent, useContentReady, useSiteContent } from "./content/store"
import Txt from "./components/Txt"
import Home from "./pages/Home"
import { asset, stripBase, withBase } from "./paths"
import { setupTracking, trackPageView } from "./tracking"

const AdminApp = lazy(() => import("./admin/AdminApp"))

const CANVAS_WIDTH = 1920
// The design's 1280px content column sits 320px in from each canvas edge.
const DESIGN_CONTENT_WIDTH = 1280
const DESIGN_GUTTER = (CANVAS_WIDTH - DESIGN_CONTENT_WIDTH) / 2
// Fixed gap between the content and the screen edge on non-mobile screens:
// wider on screens 1700px and up. The tablet value lives in
// --site-side-margin in index.css; keep them in sync.
const SIDE_MARGIN = 130
const WIDE_SIDE_MARGIN = 200
const WIDE_SCREEN_MIN_WIDTH = 1700

function sideMarginFor(viewportWidth: number) {
  return viewportWidth >= WIDE_SCREEN_MIN_WIDTH ? WIDE_SIDE_MARGIN : SIDE_MARGIN
}

// Home ships with the first load; every other page is its own file, fetched when the
// browser is idle (see `preloadPages`) so moving between pages stays instant.
const pageLoaders = {
  service: () => import("./pages/ServiceDetails"),
  work: () => import("./pages/Work"),
  about: () => import("./pages/About"),
  blog: () => import("./pages/Blog"),
  post: () => import("./pages/BlogDetails"),
  contact: () => import("./pages/Contact"),
  reviews: () => import("./pages/Reviews"),
  privacy: () => import("./pages/PrivacyPolicy"),
  terms: () => import("./pages/TermsOfService"),
}

function preloadPages() {
  Object.values(pageLoaders).forEach((load) => void load())
}

// Pages with a fixed height are absolutely positioned design canvases; "auto" pages
// flow normally and are measured, so their height follows their content.
const pages = {
  home: { component: Home, height: 4282 },
  service: { component: lazy(pageLoaders.service), height: "auto" },
  work: { component: lazy(pageLoaders.work), height: "auto" },
  about: { component: lazy(pageLoaders.about), height: 3830 },
  blog: { component: lazy(pageLoaders.blog), height: "auto" },
  post: { component: lazy(pageLoaders.post), height: "auto" },
  contact: { component: lazy(pageLoaders.contact), height: 1925 },
  reviews: { component: lazy(pageLoaders.reviews), height: "auto" },
  privacy: { component: lazy(pageLoaders.privacy), height: "auto" },
  terms: { component: lazy(pageLoaders.terms), height: "auto" },
} as const satisfies Record<string, { component: ComponentType<{ slug?: string }>; height: number | "auto" }>

type PageKey = keyof typeof pages
type Match = { page: PageKey; slug?: string }

const staticRoutes: Record<string, PageKey> = {
  "/": "home",
  "/service": "service",
  "/work": "work",
  "/about": "about",
  "/blog": "blog",
  "/contact": "contact",
  "/reviews": "reviews",
  "/privacy-policy": "privacy",
  "/terms-of-service": "terms",
}

function matchPath(path: string | null | undefined): Match | null {
  if (!path) return null
  if (path in staticRoutes) return { page: staticRoutes[path] }
  const detail = path.match(/^\/(service|blog)\/([a-z0-9-]+)$/)
  if (detail) return { page: detail[1] === "service" ? "service" : "post", slug: detail[2] }
  return null
}

function getPath() {
  const path = stripBase(window.location.pathname)
  return matchPath(path) ? (path as string) : "/"
}

const linkMap: Record<string, string> = {
  home: "/",
  work: "/work",
  "about me": "/about",
  blog: "/blog",
  reviews: "/reviews",
  "contact me": "/contact",
  "contact us": "/contact",
  "privacy policy": "/privacy-policy",
  "terms of service": "/terms-of-service",
  "explore me": "/work",
  "let's work together": "/contact",
  "let’s work together": "/contact",
  "view all": "/work",
  "free consultation": "/contact",
}

// Elements that reveal on their own. Cards and carousels reveal as one unit, so
// anything inside a matched element is left to its parent.
const REVEAL_SELECTOR = [
  ".service-card",
  ".work-case-card",
  ".blog-card",
  ".achievement-card",
  ".home-work-card",
  ".reviews-marquee",
  ".review-card",
  ".reviews-add",
  ".trusted-logo-window",
  ".contact-form",
  "[data-name='contact']",
  "[data-name='CTA']",
  "figure",
  "iframe",
  "h1",
  "h2",
  "h3",
  "p",
  "ul",
  "ol",
  "img",
].join(",")

function revealItems(section: HTMLElement) {
  const candidates = Array.from(section.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)).filter(
    // The reveal moves items with `translate`, which centring utilities also use.
    (element) => !/(^|\s)-?translate-/.test(element.className),
  )
  const set = new Set(candidates)
  return candidates.filter((element) => {
    for (let parent = element.parentElement; parent && parent !== section; parent = parent.parentElement) {
      if (set.has(parent)) return false
    }
    return true
  })
}

// Rendered next to the page inside Suspense, so it mounts only once the page has.
function PageMounted({ path, onMount }: { path: string; onMount: (path: string) => void }) {
  useLayoutEffect(() => onMount(path), [path, onMount])
  return null
}

function isAdminPath() {
  const path = stripBase(window.location.pathname)
  return path === "/admin" || !!path?.startsWith("/admin/")
}

export default function App() {
  if (isAdminPath()) {
    return (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    )
  }
  return <Site />
}

function Site() {
  const [path, setPath] = useState(getPath)
  const [viewportWidth, setViewportWidth] = useState(
    document.documentElement.clientWidth,
  )
  const [pendingHash, setPendingHash] = useState(() =>
    window.location.hash.slice(1),
  )
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false)
  const [measured, setMeasured] = useState<{ path: string; height: number } | null>(null)
  // Path whose page is actually in the DOM (a lazily loaded page mounts a moment later).
  const [renderedPath, setRenderedPath] = useState<string | null>(null)
  const ready = useContentReady()
  const content = useSiteContent()
  const match = matchPath(path) ?? { page: "home" }
  const page = pages[match.page]
  // Until a page is measured, its design height (or a rough guess) avoids a jump.
  const contentHeight = measured?.path === path ? measured.height : page.height === "auto" ? 3000 : page.height

  useEffect(() => {
    void loadContent()
  }, [])

  // Fetch the other pages in the background once the first one is on screen.
  const firstPageShown = renderedPath !== null
  useEffect(() => {
    if (!firstPageShown) return
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 1500))
    idle(() => preloadPages())
  }, [firstPageShown])

  // Measure every page so the scaled canvas is exactly as tall as its content: the
  // lowest bottom edge among its sections (absolute or flowing), so a taller section
  // or footer never gets cut off.
  useEffect(() => {
    if (renderedPath === null) return
    const root = document.querySelector<HTMLElement>(".design-canvas > div")
    if (!root) return
    const measure = () => {
      const sections = Array.from(root.children) as HTMLElement[]
      const bottom = Math.max(0, ...sections.map((section) => section.offsetTop + section.offsetHeight))
      setMeasured({ path, height: Math.ceil(page.height === "auto" ? Math.max(bottom, root.offsetHeight) : bottom) })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    Array.from(root.children).forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [path, page.height, renderedPath])

  useEffect(() => {
    // Keep in sync with "title" in .figma/make/site.json (used for the first page load).
    const siteTitle = "Suchhanda Mondol | Digital Marketing Expert"
    const service = match.page === "service" ? content.services.find((item) => item.slug === match.slug) : null
    const post = match.page === "post" ? content.blog.find((item) => item.slug === match.slug) : null
    const name = service?.title ?? post?.title
    document.title = name ? `${name} | Suchhanda Mondol` : siteTitle
  }, [content, match.page, match.slug])

  // Google Fonts chosen in the dashboard; only the ones in use are downloaded.
  const fontsHref = useMemo(() => googleFontsHref(usedGoogleFonts(content)), [content])
  useEffect(() => loadGoogleFonts("site", fontsHref), [fontsHref])

  const tracking = content.settings.tracking
  useEffect(() => {
    if (ready) setupTracking(tracking)
  }, [ready, tracking])

  useEffect(() => {
    if (ready) trackPageView(path)
  }, [ready, path])

  useEffect(() => {
    const resize = () => setViewportWidth(document.documentElement.clientWidth)
    const popstate = () => {
      const nextPath = getPath()
      const hash = window.location.hash
      if (window.location.pathname !== withBase(nextPath)) {
        window.history.replaceState({}, "", `${withBase(nextPath)}${hash}`)
      }
      // Keep showing the current page until the next one has loaded.
      startTransition(() => setPath(nextPath))
      setIsMobileMenuOpen(false)
      setIsServiceMenuOpen(false)
      if (hash) setPendingHash(hash.slice(1))
      else window.scrollTo(0, 0)
    }
    if (!matchPath(stripBase(window.location.pathname))) {
      window.history.replaceState({}, "", withBase("/"))
    }
    const viewport = document.querySelector(".design-viewport")
    const resizeObserver = new ResizeObserver(resize)
    if (viewport) resizeObserver.observe(viewport)
    window.addEventListener("resize", resize)
    window.addEventListener("popstate", popstate)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", resize)
      window.removeEventListener("popstate", popstate)
    }
  }, [])

  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".design-canvas > div")
    if (!page) return

    const sections = Array.from(page.children)
      .filter(
        (element): element is HTMLElement => element instanceof HTMLElement,
      )
      .map((element, index) => {
        const topClass = Array.from(element.classList).find((name) =>
          name.startsWith("top-["),
        )
        const topValue = topClass?.match(/top-\[([\d.]+)px\]/)?.[1]
        const inlineTop = element.style.top
        const top = Number.parseFloat(topValue ?? inlineTop) || 0
        return { element, index, top }
      })
      .sort((a, b) => a.top - b.top || a.index - b.index)

    sections.forEach(({ element }, order) => {
      element.style.setProperty("--mobile-section-order", String(order))
    })
  }, [renderedPath])

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(".design-canvas > div > *"),
    )
    // Sections fade in as a whole; the items inside them rise in one by one.
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-scroll-visible", "true")
            sectionObserver.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.04 },
    )
    const itemObserver = new IntersectionObserver(
      (entries) => {
        // Items that appear together are staggered from top-left to bottom-right.
        entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top ||
              a.boundingClientRect.left - b.boundingClientRect.left,
          )
          .forEach((entry, index) => {
            const item = entry.target as HTMLElement
            item.style.setProperty("--reveal-delay", `${Math.min(index, 8) * 120}ms`)
            item.setAttribute("data-revealed", "true")
            itemObserver.unobserve(item)
          })
      },
      // No negative bottom margin: items at the very end of the page (the footer's
      // copyright line) can never scroll above the screen's bottom edge, so a margin
      // there would keep them hidden for good.
      { threshold: 0.12 },
    )

    sections.forEach((section) => {
      section.setAttribute("data-scroll-reveal", "true")
      sectionObserver.observe(section)
      revealItems(section).forEach((item) => {
        item.setAttribute("data-reveal", "true")
        itemObserver.observe(item)
      })
    })

    return () => {
      sectionObserver.disconnect()
      itemObserver.disconnect()
    }
  }, [renderedPath])

  useEffect(() => {
    if (!pendingHash || renderedPath === null) return
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        document.getElementById(pendingHash)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
        setPendingHash("")
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [pendingHash, renderedPath])

  // Scale the design so its content column fills the screen minus the side margins.
  const sideMargin = sideMarginFor(viewportWidth)
  const scale = Math.max(0, viewportWidth - sideMargin * 2) / DESIGN_CONTENT_WIDTH
  const canvasOffsetX = sideMargin - DESIGN_GUTTER * scale
  const Page: ComponentType<{ slug?: string }> = page.component
  const canvasStyle = useMemo(
    () => ({
      width: CANVAS_WIDTH,
      height: contentHeight,
      left: canvasOffsetX,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
    }),
    [canvasOffsetX, contentHeight, scale],
  )

  const navigate = (next: string, hash = "") => {
    setIsMobileMenuOpen(false)
    setIsServiceMenuOpen(false)
    if (next !== path || hash) {
      window.history.pushState({}, "", `${withBase(next)}${hash}`)
      startTransition(() => setPath(next))
      setPendingHash(hash.slice(1))
      if (!hash) window.scrollTo(0, 0)
    }
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Let the browser handle new-tab/window clicks and form submits.
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }
    const target = event.target
    if (!(target instanceof Element)) return
    const element = target.closest("a, button, [data-name='CTA'], [data-path]")
    if (!element) return
    if (element.getAttribute("target") === "_blank") return
    if (element instanceof HTMLButtonElement && element.type === "submit") {
      return
    }
    // Menu toggles and other open/close buttons are not links.
    if (element.hasAttribute("aria-expanded")) return
    const label = (element.textContent || "").trim().toLowerCase()
    // data-path holds the route itself; href already includes the base path.
    const dataPath = element.getAttribute("data-path")
    const href = element.getAttribute("href")
    const linkPath = dataPath ?? (href?.startsWith("/") ? href : null)
    const [requestedPath = "", requestedHash = ""] = linkPath?.split("#") ?? []
    // Without a link, the label decides (Figma buttons such as "Explore Me" have no href).
    const requestedRoute = linkPath === null ? null : dataPath ? requestedPath : stripBase(requestedPath)
    const direct = requestedRoute && matchPath(requestedRoute) ? requestedRoute : linkMap[label]
    // Prefer the longest matching label so "let's work together" wins over "work".
    const partial = Object.entries(linkMap)
      .filter(([text]) => label.includes(text))
      .sort(([a], [b]) => b.length - a.length)[0]?.[1]
    if (direct || partial) {
      event.preventDefault()
      navigate(
        direct || partial,
        direct ? (requestedHash ? `#${requestedHash}` : "") : "",
      )
    }
  }

  return (
    <div className="app-shell" onClick={handleClick}>
      <main
        className="design-viewport"
        style={{ height: contentHeight * scale }}
      >
        <div className="design-canvas" style={canvasStyle}>
          {ready && (
            <Suspense fallback={null}>
              <Page key={path} slug={match.slug} />
              <PageMounted onMount={setRenderedPath} path={path} />
            </Suspense>
          )}
        </div>
      </main>
      <nav
        aria-label="Main navigation"
        className={`site-navbar${isMobileMenuOpen ? " is-menu-open" : ""}`}
        style={{
          left: viewportWidth / 2,
          transform: `scale(${scale})`,
          top: 31 * scale,
        }}
      >
        <a
          aria-label="Suchhanda home"
          className="site-logo"
          data-path="/"
          href={withBase("/")}
        >
          <img alt="Suchhanda" src={asset("4a673.svg")} />
        </a>
        <button
          aria-controls="primary-navigation-links"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          className="site-menu-toggle"
          onClick={() => {
            setIsMobileMenuOpen((open) => !open)
            setIsServiceMenuOpen(false)
          }}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
        <div className="site-nav-links" id="primary-navigation-links">
          <a
            aria-current={path === "/" ? "page" : undefined}
            data-path="/"
            href={withBase("/")}
          >
            <Txt k="nav.home" />
          </a>
          <div
            className={`site-service-navigation${isServiceMenuOpen ? " is-open" : ""}${path.startsWith("/service") ? " is-current" : ""}`}
          >
            <button
              aria-expanded={isServiceMenuOpen}
              aria-controls="service-navigation-links"
              aria-haspopup="true"
              onClick={() => setIsServiceMenuOpen((open) => !open)}
              type="button"
            >
              <Txt k="nav.service" />
              <img
                alt=""
                aria-hidden="true"
                className="service-chevron"
                src={asset("05e02.svg")}
              />
            </button>
            <div className="service-menu" id="service-navigation-links">
              {content.services.filter((service) => service.active).map((service) => (
                <a
                  aria-current={path === `/service/${service.slug}` ? "page" : undefined}
                  data-path={`/service/${service.slug}`}
                  href={withBase(`/service/${service.slug}`)}
                  key={service.id}
                  onClick={(event) => event.currentTarget.blur()}
                >
                  {service.title}
                </a>
              ))}
            </div>
          </div>
          <a
            aria-current={path === "/work" ? "page" : undefined}
            data-path="/work"
            href={withBase("/work")}
          >
            <Txt k="nav.work" />
          </a>
          <a
            aria-current={path === "/about" ? "page" : undefined}
            data-path="/about"
            href={withBase("/about")}
          >
            <Txt k="nav.about" />
          </a>
          <a
            aria-current={path === "/blog" ? "page" : undefined}
            data-path="/blog"
            href={withBase("/blog")}
          >
            <Txt k="nav.blog" />
          </a>
          <a
            aria-current={path === "/reviews" ? "page" : undefined}
            data-path="/reviews"
            href={withBase("/reviews")}
          >
            <Txt k="nav.reviews" />
          </a>
          <a
            aria-current={path === "/contact" ? "page" : undefined}
            className="site-contact-link"
            data-path="/contact"
            href={withBase("/contact")}
          >
            <Txt k="nav.contact" />
          </a>
        </div>
      </nav>
    </div>
  )
}
