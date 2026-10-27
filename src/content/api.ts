import { withBase } from "../paths"
import { shrinkImage } from "./shrinkImage"

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData
  const response = await fetch(withBase(`/api${path}`), {
    credentials: "same-origin",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body && !isForm ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  })
  const data = (await response.json().catch(() => ({}))) as T & { error?: string }
  if (!response.ok) {
    throw new ApiError(data.error ?? `Request failed (${response.status}).`, response.status)
  }
  return data
}

// Dashboard uploads: large photos are scaled to at most 2400px and saved as WebP first.
export async function uploadImage(file: File) {
  const body = new FormData()
  body.append("file", await shrinkImage(file, 2400))
  const { url } = await api<{ url: string }>("/uploads", { method: "POST", body })
  return url
}
