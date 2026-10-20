import { useEffect, useMemo, useState } from "react"
import About from "./pages/About"
import Blog from "./pages/Blog"
import BlogDetails from "./pages/BlogDetails"
import Contact from "./pages/Contact"
import Home from "./pages/Home"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import Reviews from "./pages/Reviews"
import ServiceDetails from "./pages/ServiceDetails"
import TermsOfService from "./pages/TermsOfService"
import Work from "./pages/Work"

const CANVAS_WIDTH = 1920

const routes = {
  "/": { component: Home, height: 5392 },
  "/service": { component: ServiceDetails, height: 2877 },
  "/work": { component: Work, height: 5935 },
  "/about": { component: About, height: 4059 },
  "/blog": { component: Blog, height: 3287 },
  "/blog/article": { component: BlogDetails, height: 4259 },
  "/contact": { component: Contact, height: 3099 },
  "/reviews": { component: Reviews, height: 2200 },
  "/privacy-policy": { component: PrivacyPolicy, height: 2400 },
  "/terms-of-service": { component: TermsOfService, height: 2400 },
} as const

type RoutePath = keyof typeof routes

function getRoute(): RoutePath {
  const path = window.location.pathname.replace(/\/+$/, "") || "/"
  return path in routes ? (path as RoutePath) : "/"
}

const linkMap: Record<string, RoutePath> = {
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
  const [viewportWidth, setViewportWidth] = useState(document.documentElement.clientWidth)
  const [serviceOpen, setServiceOpen] = useState(false)
  const [pendingHash, setPendingHash] = useState("")
  const [contentHeight, setContentHeight] = useState<number>(routes[getRoute()].height)
  const route = routes[path]

  useEffect(() => {
    const resize = () => setViewportWidth(document.documentElement.clientWidth)
    const popstate = () => {
      setPath(getRoute())
      setServiceOpen(false)
      window.scrollTo(0, 0)
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
    setContentHeight(route.height)
    if (path !== "/reviews") return

    const page = document.querySelector<HTMLElement>(".design-canvas > div")
    if (!page) return

    const resizeObserver = new ResizeObserver(() => {
      setContentHeight(Math.max(route.height, page.scrollHeight))
    })
    resizeObserver.observe(page)
    setContentHeight(Math.max(route.height, page.scrollHeight))
    return () => resizeObserver.disconnect()
  }, [path, route.height])

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(".design-canvas > div > *")
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
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
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
    if (next !== path || hash) {
      window.history.pushState({}, "", `${next}${hash}`)
      setPath(next)
      setPendingHash(hash.slice(1))
      if (!hash) window.scrollTo(0, 0)
    }
    setServiceOpen(false)
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    const element = target.closest("a, button, [data-name='CTA'], [data-path]")
    if (!element) return
    const label = (element.textContent || "").trim().toLowerCase()
    if (label.startsWith("service")) {
      event.preventDefault()
      setServiceOpen((open) => !open)
      return
    }
    const requestedPath = element.getAttribute("data-path") || element.getAttribute("href")
    const [requestedRoute, requestedHash = ""] = requestedPath?.split("#") ?? []
    const direct = requestedRoute && requestedRoute in routes
      ? (requestedRoute as RoutePath)
      : linkMap[label]
    const partial = Object.entries(linkMap).find(([text]) => label.includes(text))?.[1]
    if (direct || partial) {
      event.preventDefault()
      navigate(direct || partial, direct ? (requestedHash ? `#${requestedHash}` : "") : "")
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
        className="site-navbar"
        style={{
          left: viewportWidth / 2,
          transform: `scale(${scale})`,
          top: 31 * scale,
        }}
      >
        <a aria-label="Suchhanda home" className="site-logo" data-path="/" href="/">
          <img alt="Suchhanda" src="/assets/4a673.svg" />
        </a>
        <div className="site-nav-links">
          <a aria-current={path === "/" ? "page" : undefined} data-path="/" href="/">
            Home
          </a>
          <div className="site-service-navigation">
            <button
              aria-expanded={serviceOpen}
              type="button"
            >
              Service
              <img alt="" aria-hidden="true" className="service-chevron" src="/assets/05e02.svg" />
            </button>
            {serviceOpen && (
              <div className="service-menu">
                {[
                  "Meta Ads Management",
                  "Google Ads Management",
                  "Pixel & Tag Manager",
                  "Conversion Rate Optimization",
                  "Ads Audit & Optimization",
                ].map((item) => (
                  <a data-path="/service" href="/service" key={item}>
                    {item}
                  </a>
                ))}
              </div>
            )}
          </div>
          <a aria-current={path === "/work" ? "page" : undefined} data-path="/work" href="/work">
            Work
          </a>
          <a aria-current={path === "/about" ? "page" : undefined} data-path="/about" href="/about">
            About Me
          </a>
          <a aria-current={path === "/blog" ? "page" : undefined} data-path="/blog" href="/blog">
            Blog
          </a>
          <a aria-current={path === "/reviews" ? "page" : undefined} data-path="/reviews" href="/reviews">
            Reviews
          </a>
        </div>
        <a className="site-contact-link" data-path="/contact" href="/contact">
          Contact Me
        </a>
      </nav>
    </div>
  )
}
