type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  onText?: string
  offText?: string
  disabled?: boolean
  size?: "md" | "sm"
}

// On/off switch with its state written next to it.
export default function Toggle({ checked, onChange, label, onText = "Active", offText = "Inactive", disabled, size = "md" }: ToggleProps) {
  const small = size === "sm"
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className="group inline-flex items-center gap-[8px] rounded-full disabled:cursor-wait disabled:opacity-60"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={`relative inline-flex shrink-0 items-center rounded-full transition-colors ${small ? "h-[20px] w-[34px]" : "h-[24px] w-[42px]"} ${
          checked ? "bg-[#12b76a]" : "bg-[#d0d5dd]"
        }`}
      >
        <span
          className={`absolute rounded-full bg-white shadow-[0_1px_2px_rgb(16_24_40/20%)] transition-transform ${small ? "size-[16px]" : "size-[18px]"} ${
            checked ? (small ? "translate-x-[16px]" : "translate-x-[21px]") : "translate-x-[2px]"
          }`}
        />
      </span>
      <span className={`font-medium ${small ? "text-[13px]" : "text-[13px]"} ${checked ? "text-[#067647]" : "text-[var(--admin-muted)]"}`}>
        {checked ? onText : offText}
      </span>
    </button>
  )
}
