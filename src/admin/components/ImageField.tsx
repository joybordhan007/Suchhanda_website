import { useId, useRef, useState } from "react"
import { uploadImage } from "../../content/api"
import { mediaUrl } from "../../paths"
import Icon from "./Icon"

type ImageFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  // Preview box shape, e.g. "aspect-[4/5]" for portraits or "h-[64px]" for logos.
  previewClass?: string
  darkPreview?: boolean
}

export default function ImageField({
  label,
  value,
  onChange,
  hint,
  previewClass = "aspect-[16/9]",
  darkPreview = false,
}: ImageFieldProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle")
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)

  const upload = async (file: File | undefined) => {
    if (!file) return
    setStatus("uploading")
    try {
      onChange(await uploadImage(file))
      setStatus("idle")
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.")
      setStatus("error")
    } finally {
      if (input.current) input.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-[6px]">
      <span className="admin-label" id={id}>
        {label}
      </span>
      <div className="flex flex-wrap items-start gap-[16px]">
        <button
          aria-label={value ? `Replace ${label}` : `Upload ${label}`}
          className={`group relative flex w-[220px] max-w-full items-center justify-center overflow-hidden rounded-[4px] border border-dashed transition ${
            dragging ? "border-[var(--admin-gold)] bg-[#fdf8ee]" : "border-[var(--admin-border-strong)] hover:border-[var(--admin-gold)]"
          } ${darkPreview ? "bg-[#282828]" : "bg-[#f9fafb]"} ${previewClass}`}
          onClick={() => input.current?.click()}
          onDragLeave={() => setDragging(false)}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            void upload(event.dataTransfer.files[0])
          }}
          type="button"
        >
          {value ? (
            <img alt="" className="max-h-full max-w-full object-contain" src={mediaUrl(value)} />
          ) : (
            <span className="flex flex-col items-center gap-[6px] p-[12px] text-center text-[12px] text-[var(--admin-muted)]">
              <Icon className="text-[#98a2b3]" name="image" size={22} />
              Click or drop an image
            </span>
          )}
          {status === "uploading" && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/75 text-[13px] font-semibold text-[var(--admin-text)]">Uploading…</span>
          )}
        </button>
        <div className="flex flex-col gap-[8px]">
          <input
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            aria-labelledby={id}
            className="hidden"
            onChange={(event) => upload(event.target.files?.[0])}
            ref={input}
            type="file"
          />
          <div className="flex flex-wrap gap-[8px]">
            <button className="admin-btn admin-btn-secondary h-[36px]" disabled={status === "uploading"} onClick={() => input.current?.click()} type="button">
              {status === "uploading" ? "Uploading…" : value ? "Replace" : "Upload"}
            </button>
            {value && (
              <button className="admin-btn admin-btn-ghost h-[36px] hover:text-[#b42318]" onClick={() => onChange("")} type="button">
                Remove
              </button>
            )}
          </div>
          <p className="max-w-[280px] text-[12px] leading-[1.45] text-[var(--admin-muted)]">{hint ?? "PNG, JPG, WebP, GIF or SVG, up to 5 MB."}</p>
          {status === "error" && <p className="max-w-[280px] text-[13px] text-[#b42318]">{error}</p>}
        </div>
      </div>
    </div>
  )
}
