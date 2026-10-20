import { useId, useRef, useState } from "react"
import { uploadImage } from "../../content/api"
import { mediaUrl } from "../../paths"

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
      <span className="text-[13px] font-medium uppercase tracking-wide text-[#555]" id={id}>
        {label}
      </span>
      <div className="flex flex-wrap items-start gap-[16px]">
        <div
          className={`flex w-[220px] max-w-full items-center justify-center overflow-hidden rounded-[8px] border border-dashed border-[rgba(25,25,25,0.25)] ${
            darkPreview ? "bg-[#282828]" : "bg-[#f4f5f7]"
          } ${previewClass}`}
        >
          {value ? (
            <img alt="" className="max-h-full max-w-full object-contain" src={mediaUrl(value)} />
          ) : (
            <span className="p-[12px] text-center text-[13px] text-[#999]">No image</span>
          )}
        </div>
        <div className="flex flex-col gap-[8px]">
          <input
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            aria-labelledby={id}
            className="hidden"
            onChange={(event) => upload(event.target.files?.[0])}
            ref={input}
            type="file"
          />
          <button
            className="rounded-[8px] bg-[#091e39] px-[14px] py-[8px] text-[14px] text-white disabled:opacity-50"
            disabled={status === "uploading"}
            onClick={() => input.current?.click()}
            type="button"
          >
            {status === "uploading" ? "Uploading…" : value ? "Replace image" : "Upload image"}
          </button>
          {value && (
            <button
              className="rounded-[8px] border border-[rgba(25,25,25,0.2)] px-[14px] py-[8px] text-[14px] text-[#555] hover:text-red-700"
              onClick={() => onChange("")}
              type="button"
            >
              Remove
            </button>
          )}
          <p className="max-w-[260px] text-[12px] text-[#777]">{hint ?? "PNG, JPG, WebP, GIF or SVG, up to 5 MB."}</p>
          {status === "error" && <p className="max-w-[260px] text-[13px] text-red-700">{error}</p>}
        </div>
      </div>
    </div>
  )
}
