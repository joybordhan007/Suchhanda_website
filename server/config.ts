import { resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
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
  sessionDays: 7,
  maxUploadBytes: 5 * 1024 * 1024,
  maxContentBytes: 2 * 1024 * 1024,
}
