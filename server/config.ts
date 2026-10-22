import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

// Project folder (or the release folder on the host); works on every supported Node.js.
const root = fileURLToPath(new URL("..", import.meta.url))
const dataDir = resolve(root, process.env.DATA_DIR ?? "data")

export const config = {
  port: Number(process.env.API_PORT ?? 8787),
  host: process.env.API_HOST ?? "127.0.0.1",
  // `pnpm start` passes --production (works on Windows too, unlike NODE_ENV=…).
  isProduction: process.env.NODE_ENV === "production" || process.argv.includes("--production"),
  dataDir,
  uploadsDir: resolve(dataDir, "uploads"),
  // Built website served by this server in production (`pnpm build` output).
  distDir: resolve(root, process.env.DIST_DIR ?? "dist"),
  // Split hosting (e.g. cPanel): the public site and the admin dashboard run as two apps on
  // two domains, sharing DATA_DIR. On the website app set ADMIN_URL, so /admin moves to the
  // admin domain; on the admin app set SITE_URL, so website pages move to the main domain.
  adminUrl: (process.env.ADMIN_URL ?? "").replace(/\/+$/, ""),
  siteUrl: (process.env.SITE_URL ?? "").replace(/\/+$/, ""),
  sessionDays: 7,
  maxUploadBytes: 5 * 1024 * 1024,
  maxReviewPhotoBytes: 2 * 1024 * 1024,
  maxContentBytes: 2 * 1024 * 1024,
}
