import { useEffect, useMemo, useState } from "react"
import About from "./pages/About"
import Blog from "./pages/Blog"
import BlogDetails from "./pages/BlogDetails"
import Contact from "./pages/Contact"
import Home from "./pages/Home"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import ServiceDetails from "./pages/ServiceDetails"
import TermsOfService from "./pages/TermsOfService"
import Work from "./pages/Work"
import { asset, stripBase, withBase } from "./paths"

const CANVAS_WIDTH = 1920

const routes = {
  "/": { component: Home, height: 4735 },
  "/service": { component: ServiceDetails, height: 2877 },
  "/work": { component: Work, height: 5201 },
  "/about": { component: About, height: 4059 },
  "/blog": { component: Blog, height: 3287 },
  "/blog/article": { component: BlogDetails, height: 4259 },
  "/contact": { component: Contact, height: 3099 },
  "/privacy-policy": { component: PrivacyPolicy, height: 2400 },
  "/terms-of-service": { component: TermsOfService, height: 2400 },
} as const

type RoutePath = keyof typeof routes

function isRoute(path: string | null | undefined): path is RoutePath {
  return !!path && path in routes
}

function getRoute(): RoutePath {
  const path = stripBase(window.location.pathname)
  return isRoute(path) ? path : "/"
}

const linkMap: Record<string, RoutePath> = {
  home: "/",
  work: "/work",
  "about me": "/about",
  blog: "/blog",
  "contact me": "/contact",
  "contact us": "/contact",
  "privacy policy": "/privacy-policy",
  "terms of service": "/terms-of-service",
  "explore me": "/work",
  "let's work together": "/contact",
  "let’s work together": "/contact",
  "read more": "/blog/article",
  "view all": "/work",
  "meta ads management": "/service",
  "google ads management": "/service",
  "pixel & tag manager": "/service",
  "conversion rate optimization": "/service",
  "ads audit & optimization": "/service",
  "free consultation": "/contact",
}

export default function App() {
  const [path, setPath] = useState<RoutePath>(getRoute)
  const [viewportWidth, setViewportWidth] = useState(
    document.documentElement.clientWidth,
  )
  const [pendingHash, setPendingHash] = useState(() =>
    window.location.hash.slice(1),
  )
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false)
  const route = routes[path]
  const contentHeight = route.height

  useEffect(() => {
    const resize = () => setViewportWidth(document.documentElement.clientWidth)
    const popstate = () => {
      const nextPath = getRoute()
      const hash = window.location.hash
      if (window.location.pathname !== withBase(nextPath)) {
        window.history.replaceState({}, "", `${withBase(nextPath)}${hash}`)
      }
      setPath(nextPath)
      setIsMobileMenuOpen(false)
      setIsServiceMenuOpen(false)
      if (hash) setPendingHash(hash.slice(1))
      else window.scrollTo(0, 0)
    }
    if (!isRoute(stripBase(window.location.pathname))) {
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
  }, [path])

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      ".design-canvas > div > *",
    )
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-scroll-visible", "true")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.04 },
    )

    sections.forEach((section) => {
      section.setAttribute("data-scroll-reveal", "true")
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [path])

  useEffect(() => {
    if (!pendingHash) return
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
  }, [path, pendingHash])

  const scale = Math.min(1, viewportWidth / CANVAS_WIDTH)
  const canvasOffsetX = Math.max(0, (viewportWidth - CANVAS_WIDTH) / 2)
  const Page = route.component
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

  const navigate = (next: RoutePath, hash = "") => {
    setIsMobileMenuOpen(false)
    setIsServiceMenuOpen(false)
    if (next !== path || hash) {
      window.history.pushState({}, "", `${withBase(next)}${hash}`)
      setPath(next)
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
    const label = (element.textContent || "").trim().toLowerCase()
    // data-path holds the route itself; href already includes the base path.
    const dataPath = element.getAttribute("data-path")
    const href = element.getAttribute("href")
    const [requestedPath = "", requestedHash = ""] = (
      dataPath ?? (href?.startsWith("/") ? href : "")
    ).split("#")
    const requestedRoute = dataPath ? requestedPath : stripBase(requestedPath)
    const direct = isRoute(requestedRoute) ? requestedRoute : linkMap[label]
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
          <Page />
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
            Home
          </a>
          <div
            className={`site-service-navigation${isServiceMenuOpen ? " is-open" : ""}`}
          >
            <button
              aria-expanded={isServiceMenuOpen}
              aria-controls="service-navigation-links"
              aria-haspopup="true"
              onClick={() => setIsServiceMenuOpen((open) => !open)}
              type="button"
            >
              Service
              <img
                alt=""
                aria-hidden="true"
                className="service-chevron"
                src={asset("05e02.svg")}
              />
            </button>
            <div className="service-menu" id="service-navigation-links">
              {[
                "Meta Ads Management",
                "Google Ads Management",
                "Pixel & Tag Manager",
                "Conversion Rate Optimization",
                "Ads Audit & Optimization",
              ].map((item) => (
                <a
                  data-path="/service"
                  href={withBase("/service")}
                  key={item}
                  onClick={(event) => event.currentTarget.blur()}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
          <a
            aria-current={path === "/work" ? "page" : undefined}
            data-path="/work"
            href={withBase("/work")}
          >
            Work
          </a>
          <a
            aria-current={path === "/about" ? "page" : undefined}
            data-path="/about"
            href={withBase("/about")}
          >
            About Me
          </a>
          <a
            aria-current={path === "/blog" ? "page" : undefined}
            data-path="/blog"
            href={withBase("/blog")}
          >
            Blog
          </a>
          <a
            className="site-contact-link"
            data-path="/contact"
            href={withBase("/contact")}
          >
            Contact Me
          </a>
        </div>
      </nav>
    </div>
  )
}
