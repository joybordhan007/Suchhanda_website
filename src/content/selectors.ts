import type { BlogPost, WorkItem } from "./types"

export function latestWork(work: WorkItem[], count?: number) {
  const sorted = [...work].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return count === undefined ? sorted : sorted.slice(0, count)
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
