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
}: TextFieldProps) {
  const id = useId()
  const inputClass =
    "w-full rounded-[8px] border border-[rgba(25,25,25,0.2)] bg-white px-[12px] py-[10px] text-[15px] text-[#191919] outline-none focus:border-[#c7994b] focus:ring-2 focus:ring-[#c7994b]/25"

  return (
    <div className="flex flex-col gap-[6px]">
      <label className="text-[13px] font-medium uppercase tracking-wide text-[#555]" htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea
          className={`${inputClass} resize-y`}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
          value={value}
        />
      ) : (
        <input
          className={inputClass}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      )}
      {hint && <p className="text-[13px] text-[#777]">{hint}</p>}
    </div>
  )
}
