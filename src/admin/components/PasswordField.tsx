import { useId, useState } from "react"

type PasswordFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  autoComplete?: string
}

// Password input with a show/hide button.
export default function PasswordField({ label, value, onChange, hint, autoComplete = "current-password" }: PasswordFieldProps) {
  const id = useId()
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex flex-col gap-[6px]">
      <label className="admin-label" htmlFor={id}>
        {label}
      </label>
      <div className="admin-input admin-input-wrap flex p-0">
        <input
          autoComplete={autoComplete}
          className="min-w-0 flex-1 rounded-l-[4px] bg-transparent px-[12px] py-[10px] text-[15px] outline-none"
          id={id}
          onChange={(event) => onChange(event.target.value)}
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={visible ? "Hide password" : "Show password"}
          className="flex shrink-0 items-center gap-[6px] px-[12px] text-[13px] font-semibold text-[var(--admin-gold-ink)] hover:text-[var(--admin-text)]"
          onClick={() => setVisible((shown) => !shown)}
          type="button"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {hint && <p className="text-[13px] text-[var(--admin-muted)]">{hint}</p>}
    </div>
  )
}
