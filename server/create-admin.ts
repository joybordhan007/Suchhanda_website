// Creates the admin account, or resets its password if the email already exists.
// Usage: pnpm admin:create you@example.com
import { createInterface } from "node:readline/promises"
import { hashPassword } from "./auth.ts"
import { db } from "./db.ts"

const email = process.argv[2]?.trim()
if (!email || !email.includes("@")) {
  console.error("Usage: pnpm admin:create you@example.com")
  process.exit(1)
}

let password = process.env.ADMIN_PASSWORD ?? ""
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  password = await rl.question("Password (at least 10 characters): ")
  rl.close()
}
if (password.length < 10) {
  console.error("The password needs at least 10 characters.")
  process.exit(1)
}

const hash = await hashPassword(password)
const existing = db.prepare("SELECT id FROM admins WHERE email = ?").get(email) as { id: number } | undefined
if (existing) {
  db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(hash, existing.id)
  db.prepare("DELETE FROM sessions WHERE admin_id = ?").run(existing.id)
  console.log(`Password updated for ${email}.`)
} else {
  db.prepare("INSERT INTO admins (email, password_hash, created_at) VALUES (?, ?, ?)").run(
    email,
    hash,
    new Date().toISOString(),
  )
  console.log(`Admin account created for ${email}.`)
}
