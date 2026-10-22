import { useEffect, useId, type ReactNode } from "react"
import Icon from "./Icon"

type ModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}

export default function Modal({ title, onClose, children, footer }: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0c1a2e]/45 p-[12px] backdrop-blur-[3px] sm:items-center sm:p-[24px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="flex max-h-[92dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-[4px] bg-white shadow-[0_24px_48px_-12px_rgb(16_24_40/25%)]"
        role="dialog"
      >
        <header className="flex items-center justify-between gap-[12px] px-[24px] pt-[20px] pb-[4px]">
          <h2 className="text-[18px] font-semibold text-[var(--admin-text)]" id={titleId}>
            {title}
          </h2>
          <button aria-label="Close" className="admin-icon-btn border-transparent" onClick={onClose} type="button">
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="flex flex-col gap-[16px] overflow-y-auto px-[24px] py-[16px]">{children}</div>
        <footer className="flex flex-wrap justify-end gap-[10px] border-t border-[var(--admin-border)] bg-[#fcfcfd] px-[24px] py-[16px]">{footer}</footer>
      </div>
    </div>
  )
}
