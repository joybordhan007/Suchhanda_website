// "SRV", 7 -> "SRV-007"
export function formatId(prefix: string, serial: number) {
  return `${prefix}-${String(serial).padStart(3, "0")}`
}

export function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return "—"
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

export function formatDateTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
}

export function nextSerial(items: { serial: number }[]) {
  return Math.max(0, ...items.map((item) => item.serial)) + 1
}
