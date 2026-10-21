import { useState, type FormEvent } from "react"
import { api } from "../content/api"
import { asset } from "../paths"
import PasswordField from "./components/PasswordField"
import TextField from "./components/TextField"

export type AdminUser = { id: number; email: string; name: string; avatar: string }

export default function LoginPage({ onSignedIn }: { onSignedIn: (admin: AdminUser) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const { admin } = await api<{ admin: AdminUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
      onSignedIn(admin)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not sign in.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-ui grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-[#091e39] p-[48px] text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="absolute -top-[160px] -right-[120px] size-[420px] rounded-full border border-[#d9b46e]/25" />
        <div aria-hidden="true" className="absolute -bottom-[200px] -left-[140px] size-[460px] rounded-full border border-white/8" />
        <img alt="Suchhanda" className="relative h-[34px] w-fit brightness-0 invert" src={asset("4a673.svg")} />
        <div className="relative max-w-[440px]">
          <p className="mb-[16px] w-fit rounded-full bg-white/8 px-[12px] py-[4px] text-[12px] font-semibold uppercase tracking-[0.14em] text-[#d9b46e]">Admin panel</p>
          <h2 className="text-[34px] font-semibold leading-[1.15] tracking-[-0.02em]">Manage your website, content and inquiries in one place.</h2>
          <p className="mt-[16px] text-[16px] leading-[1.6] text-white/65">Services, work, blog posts, messages and visitor statistics — every change goes live as soon as you save.</p>
        </div>
        <p className="relative text-[13px] text-white/40">© {new Date().getFullYear()} Suchhanda Mondol</p>
      </aside>

      <main className="flex items-center justify-center px-[16px] py-[48px]">
        <form className="flex w-full max-w-[400px] flex-col gap-[20px]" onSubmit={submit}>
          <img alt="Suchhanda" className="h-[32px] w-fit lg:hidden" src={asset("4a673.svg")} />
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[var(--admin-text)]">Welcome back</h1>
            <p className="mt-[6px] text-[15px] text-[var(--admin-muted)]">Sign in to the dashboard to continue.</p>
          </div>
          <TextField autoFocus label="Email" onChange={setEmail} placeholder="you@example.com" type="email" value={email} />
          <PasswordField label="Password" onChange={setPassword} value={password} />
          {error && (
            <p className="rounded-[10px] border border-[#fecdca] bg-[#fef3f2] px-[12px] py-[10px] text-[14px] text-[#b42318]" role="alert">
              {error}
            </p>
          )}
          <button className="admin-btn admin-btn-primary h-[44px] w-full text-[15px]" disabled={busy || !email || !password} type="submit">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </main>
    </div>
  )
}
