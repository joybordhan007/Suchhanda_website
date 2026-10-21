// Changes the login email of an admin account; the password stays the same.
// Usage: pnpm admin:email old@example.com new@example.com
import { db } from "./db.ts"

const [from, to] = process.argv.slice(2).map((value) => value?.trim())
if (!from || !to || !to.includes("@")) {
  console.error("Usage: pnpm admin:email old@example.com new@example.com")
  process.exit(1)
}

const admin = db.prepare("SELECT id FROM admins WHERE email = ?").get(from) as { id: number } | undefined
if (!admin) {
  console.error(`No admin account uses ${from}.`)
  process.exit(1)
}
if (db.prepare("SELECT id FROM admins WHERE email = ? AND id != ?").get(to, admin.id)) {
  console.error(`Another admin account already uses ${to}.`)
  process.exit(1)
}

db.prepare("UPDATE admins SET email = ? WHERE id = ?").run(to, admin.id)
console.log(`Login email changed: ${from} → ${to}. The password is unchanged.`)
