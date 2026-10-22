import type { BlogPost, Service, WorkItem } from "./types"

// Work shown on the website: active items, newest first.
export function latestWork(work: WorkItem[], count?: number) {
  const sorted = work.filter((item) => item.active).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return count === undefined ? sorted : sorted.slice(0, count)
}

export function activeServices(services: Service[]) {
  return services.filter((service) => service.active)
}

// The Home page has room for five services next to the Free Consultation card, and two work cards.
export const HOME_SERVICE_LIMIT = 5
export const HOME_WORK_LIMIT = 2

export function homeServices(services: Service[]) {
  return activeServices(services)
    .filter((service) => service.showOnHome)
    .slice(0, HOME_SERVICE_LIMIT)
}

export function homeWork(work: WorkItem[]) {
  return latestWork(work)
    .filter((item) => item.showOnHome)
    .slice(0, HOME_WORK_LIMIT)
}

export function publishedPosts(blog: BlogPost[]) {
  return blog
    .filter((post) => post.status === "published")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
