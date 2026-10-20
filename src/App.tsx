import { useEffect, useMemo, useState } from "react"
import About from "./pages/About"
import Blog from "./pages/Blog"
import BlogDetails from "./pages/BlogDetails"
import Contact from "./pages/Contact"
import Home from "./pages/Home"
import ServiceDetails from "./pages/ServiceDetails"
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
  "contact me": "/contact",
  "contact us": "/contact",
  "let's work together": "/contact",
  "let’s work together": "/contact",
  "read more": "/blog/article",
}

export default function App() {
  const [path, setPath] = useState<RoutePath>(getRoute)
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const [serviceOpen, setServiceOpen] = useState(false)

  useEffect(() => {
    const resize = () => setViewportWidth(window.innerWidth)
    const popstate = () => {
      setPath(getRoute())
      setServiceOpen(false)
      window.scrollTo(0, 0)
    }
    window.addEventListener("resize", resize)
    window.addEventListener("popstate", popstate)
    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("popstate", popstate)
    }
  }, [])

  const scale = Math.min(1, viewportWidth / CANVAS_WIDTH)
  const route = routes[path]
  const Page = route.component
  const canvasStyle = useMemo(
    () => ({
      width: CANVAS_WIDTH,
      height: route.height,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
    }),
    [route.height, scale],
  )

  const navigate = (next: RoutePath) => {
    if (next !== path) {
      window.history.pushState({}, "", next)
      setPath(next)
      window.scrollTo(0, 0)
    }
    setServiceOpen(false)
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = (event.target as HTMLElement).closest("a, button, [data-name='CTA']")
    if (!element) return
    const label = (element.textContent || "").trim().toLowerCase()
    if (label === "service") {
      event.preventDefault()
      setServiceOpen((open) => !open)
      return
    }
    const direct = linkMap[label]
    const partial = Object.entries(linkMap).find(([text]) => label.includes(text))?.[1]
    if (direct || partial) {
      event.preventDefault()
      navigate(direct || partial)
    }
  }

  return (
    <main
      className="design-viewport"
      style={{ height: route.height * scale }}
      onClick={handleClick}
    >
      <div className="design-canvas" style={canvasStyle}>
        <Page />
        {serviceOpen && (
          <nav className="service-menu" aria-label="Services">
            {[
              "Meta Ads Management",
              "Google Ads Management",
              "TikTok & YouTube Ads",
              "Conversion Rate Optimization",
              "Ads Audit & Optimization",
            ].map((item) => (
              <button key={item} onClick={() => navigate("/service")}>
                <span>{item}</span>
                <span aria-hidden="true">›</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </main>
  )
}
