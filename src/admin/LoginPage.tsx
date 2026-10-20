import { useState, type FormEvent } from "react"
import { api } from "../content/api"
import { asset } from "../paths"
import TextField from "./components/TextField"

export type AdminUser = { id: number; email: string }

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
    <div className="flex min-h-dvh items-center justify-center bg-[#091e39] px-[16px] font-['Inter:Regular']">
      <form className="flex w-full max-w-[400px] flex-col gap-[20px] rounded-[16px] bg-white p-[28px] shadow-xl" onSubmit={submit}>
        <div className="flex flex-col items-start gap-[8px]">
          <img alt="Suchhanda" className="h-[36px]" src={asset("4a673.svg")} />
          <h1 className="text-[22px] font-semibold text-[#091e39]">Sign in to the dashboard</h1>
        </div>
        <TextField label="Email" onChange={setEmail} type="email" value={email} />
        <TextField label="Password" onChange={setPassword} type="password" value={password} />
        {error && (
          <p className="rounded-[8px] bg-red-50 px-[12px] py-[8px] text-[14px] text-red-800" role="alert">
            {error}
          </p>
        )}
        <button
          className="rounded-[8px] bg-[#091e39] px-[16px] py-[12px] text-[15px] font-medium text-white disabled:opacity-60"
          disabled={busy || !email || !password}
          type="submit"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  )
}
