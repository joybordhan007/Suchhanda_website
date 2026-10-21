// Builds release/: everything a Node.js host (cPanel, VPS) needs to run the website and
// API, as plain JavaScript. Usage: pnpm build:release
import { execSync } from "node:child_process"
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("..", import.meta.url))
const release = `${root}release`
const run = (command) => execSync(command, { cwd: root, stdio: "inherit" })

console.log("1/4 Building the website…")
run("npx vite build")

console.log("2/4 Compiling the server…")
rmSync(release, { recursive: true, force: true })
run("npx tsc -p tsconfig.server.json")

console.log("3/4 Copying the website build…")
cpSync(`${root}dist`, `${release}/dist`, { recursive: true })

console.log("4/4 Writing package.json and the startup file…")
const project = JSON.parse(readFileSync(`${root}package.json`, "utf8"))
writeFileSync(
  `${release}/package.json`,
  `${JSON.stringify(
    {
      name: "suchhanda-website",
      private: true,
      // The compiled server uses ES modules; keep this line. Hosts that load the
      // startup file with require() (cPanel/Passenger) use app.cjs, which handles it.
      type: "module",
      main: "app.cjs",
      engines: { node: ">=20" },
      scripts: {
        start: "node app.cjs",
        "admin:create": "node server/create-admin.js",
        "admin:email": "node server/change-email.js",
        // For cPanel's "Run JS script" button, which shows the output.
        "check:sqlite": "node check-sqlite.cjs",
      },
      dependencies: {
        hono: project.dependencies.hono,
        "@hono/node-server": project.dependencies["@hono/node-server"],
        // SQLite for Node.js versions without built-in node:sqlite (cPanel offers Node 20).
        "node-sqlite3-wasm": project.dependencies["node-sqlite3-wasm"],
      },
    },
    null,
    2,
  )}\n`,
)

writeFileSync(
  `${release}/app.cjs`,
  `// Startup file for cPanel "Setup Node.js App" (Phusion Passenger) and \`npm start\`.
// Passenger loads this file with require(), which cannot load the ES-module server
// directly, so it is imported here. Start-up errors are also written to
// startup-error.log next to this file, so a 503 can be diagnosed from File Manager.
const { appendFileSync } = require("node:fs")
const { join } = require("node:path")

process.argv.push("--production")

import("./server/index.js").catch((error) => {
  const text = \`[\${new Date().toISOString()}] Server failed to start on Node.js \${process.version}\\n\${error && error.stack ? error.stack : error}\\n\\n\`
  try {
    appendFileSync(join(__dirname, "startup-error.log"), text)
  } catch {}
  console.error(text)
  process.exit(1)
})
`,
)

writeFileSync(
  `${release}/check-sqlite.cjs`,
  `// Reports which SQLite driver this Node.js can use (npm run check:sqlite).
console.log("Node.js " + process.version + " on " + process.platform + "-" + process.arch)
try {
  require("node:sqlite")
  console.log("OK: built-in node:sqlite is available.")
} catch (error) {
  console.log("Built-in node:sqlite: not available (" + error.message + ")")
}
try {
  const sqliteWasm = require("node-sqlite3-wasm")
  new sqliteWasm.Database(":memory:").get("SELECT 1")
  console.log("OK: node-sqlite3-wasm works.")
} catch (error) {
  console.log("node-sqlite3-wasm FAILED:")
  console.log(error && error.stack ? error.stack : error)
}
`,
)

cpSync(`${root}DEPLOY-CPANEL.md`, `${release}/DEPLOY-CPANEL.md`)

if (!existsSync(`${release}/dist/index.html`)) throw new Error("Website build missing from release/dist.")
console.log(`\nDone: ${release}\nUpload the contents of this folder to the app root on the host (see DEPLOY-CPANEL.md).`)
