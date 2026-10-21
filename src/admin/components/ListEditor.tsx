import type { ReactNode } from "react"
import Icon from "./Icon"

type ListEditorProps<T extends { id: string }> = {
  items: T[]
  onChange: (items: T[]) => void
  itemTitle: (item: T, index: number) => string
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode
  // Omit to keep a fixed number of items (e.g. the four achievement numbers).
  createItem?: () => T
  addLabel?: string
  // New items go to the top (e.g. newest work first).
  addToStart?: boolean
  badge?: (item: T, index: number) => ReactNode
  openByDefault?: boolean
  emptyText?: string
  // False for lists the site orders itself (e.g. by date).
  sortable?: boolean
}

const smallButton = "admin-icon-btn h-[30px] w-[30px]"

export default function ListEditor<T extends { id: string }>({
  items,
  onChange,
  itemTitle,
  renderItem,
  createItem,
  addLabel = "Add item",
  addToStart = false,
  badge,
  openByDefault,
  emptyText = "Nothing here yet.",
  sortable = true,
}: ListEditorProps<T>) {
  const update = (index: number, patch: Partial<T>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))

  const move = (index: number, offset: number) => {
    const next = [...items]
    const [item] = next.splice(index, 1)
    next.splice(index + offset, 0, item)
    onChange(next)
  }

  const remove = (index: number) => {
    if (window.confirm(`Delete "${itemTitle(items[index], index) || "this item"}"?`)) {
      onChange(items.filter((_, i) => i !== index))
    }
  }

  const add = () => {
    if (!createItem) return
    const item = createItem()
    onChange(addToStart ? [item, ...items] : [...items, item])
  }

  const addButton = createItem && (
    <button
      className="admin-btn h-[38px] self-start border-dashed border-[var(--admin-gold)] bg-[#fdf8ee] text-[var(--admin-gold-ink)] hover:bg-[#faefd8]"
      onClick={add}
      type="button"
    >
      <Icon name="plus" size={16} />
      {addLabel}
    </button>
  )

  return (
    <div className="flex flex-col gap-[12px]">
      {addToStart && addButton}
      {items.length === 0 && (
        <p className="rounded-[12px] border border-dashed border-[var(--admin-border-strong)] bg-white p-[24px] text-center text-[14px] text-[var(--admin-muted)]">
          {emptyText}
        </p>
      )}
      {items.map((item, index) => (
        <details
          className="group admin-card rounded-[12px] open:border-[var(--admin-border-strong)]"
          key={item.id}
          open={openByDefault ?? items.length <= 2}
        >
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-[12px] px-[16px] py-[12px] sm:px-[20px]">
            <span className="flex min-w-0 items-center gap-[10px] text-[15px] font-semibold text-[var(--admin-text)]">
              <span className="flex size-[22px] items-center justify-center rounded-[6px] bg-[#f2f4f7] text-[var(--admin-muted)] transition-transform group-open:rotate-90">
                <Icon className="rotate-180" name="back" size={14} />
              </span>
              <span className="truncate">{itemTitle(item, index) || "Untitled"}</span>
              {badge?.(item, index)}
            </span>
            {createItem && (
              <span className="flex gap-[6px]" onClick={(event) => event.preventDefault()}>
                {sortable && (
                  <>
                    <button aria-label="Move up" className={smallButton} disabled={index === 0} onClick={() => move(index, -1)} type="button">
                      <Icon name="up" size={15} />
                    </button>
                    <button
                      aria-label="Move down"
                      className={smallButton}
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                      type="button"
                    >
                      <Icon name="down" size={15} />
                    </button>
                  </>
                )}
                <button aria-label="Delete" className={`${smallButton} admin-icon-btn-danger`} onClick={() => remove(index)} title="Delete" type="button">
                  <Icon name="trash" size={15} />
                </button>
              </span>
            )}
          </summary>
          <div className="flex flex-col gap-[16px] border-t border-[var(--admin-border)] px-[16px] py-[18px] sm:px-[20px]">
            {renderItem(item, (patch) => update(index, patch), index)}
          </div>
        </details>
      ))}
      {!addToStart && addButton}
    </div>
  )
}
