import { useId } from "react"

type TextFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  rows?: number
  type?: "text" | "email" | "tel" | "url" | "number" | "date" | "password"
  placeholder?: string
  hint?: string
  autoFocus?: boolean
}

export default function TextField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 4,
  type = "text",
  placeholder,
  hint,
  autoFocus,
}: TextFieldProps) {
  const id = useId()
  const inputClass = "admin-input"

  return (
    <div className="flex flex-col gap-[6px]">
      <label className="admin-label" htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea
          className={`${inputClass} resize-y`}
          autoFocus={autoFocus}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
          value={value}
        />
      ) : (
        <input
          className={inputClass}
          autoFocus={autoFocus}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      )}
      {hint && <p className="text-[13px] leading-[1.45] text-[var(--admin-muted)]">{hint}</p>}
    </div>
  )
}
