import type { ReactNode } from "react"

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

const smallButton =
  "rounded-[6px] border border-[rgba(25,25,25,0.15)] bg-white px-[10px] py-[4px] text-[13px] text-[#191919] hover:border-[#c7994b] disabled:cursor-not-allowed disabled:opacity-40"

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
      className="self-start rounded-[8px] border border-dashed border-[#c7994b] px-[16px] py-[10px] text-[15px] font-medium text-[#8a6a2f] hover:bg-[#c7994b]/10"
      onClick={add}
      type="button"
    >
      + {addLabel}
    </button>
  )

  return (
    <div className="flex flex-col gap-[12px]">
      {addToStart && addButton}
      {items.length === 0 && (
        <p className="rounded-[12px] border border-dashed border-[rgba(0,0,0,0.15)] bg-white p-[24px] text-center text-[14px] text-[#777]">
          {emptyText}
        </p>
      )}
      {items.map((item, index) => (
        <details
          className="group rounded-[12px] border border-[rgba(0,0,0,0.1)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          key={item.id}
          open={openByDefault ?? items.length <= 2}
        >
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-[12px] px-[16px] py-[12px] sm:px-[20px]">
            <span className="flex min-w-0 items-center gap-[10px] text-[16px] font-semibold text-[#191919]">
              <span className="text-[#c7994b] transition-transform group-open:rotate-90">▸</span>
              <span className="truncate">{itemTitle(item, index) || "Untitled"}</span>
              {badge?.(item, index)}
            </span>
            {createItem && (
              <span className="flex gap-[6px]" onClick={(event) => event.preventDefault()}>
                {sortable && (
                  <>
                    <button aria-label="Move up" className={smallButton} disabled={index === 0} onClick={() => move(index, -1)} type="button">
                      ↑
                    </button>
                    <button
                      aria-label="Move down"
                      className={smallButton}
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                      type="button"
                    >
                      ↓
                    </button>
                  </>
                )}
                <button className={`${smallButton} text-red-700`} onClick={() => remove(index)} type="button">
                  Delete
                </button>
              </span>
            )}
          </summary>
          <div className="flex flex-col gap-[16px] border-t border-[rgba(0,0,0,0.08)] px-[16px] py-[18px] sm:px-[20px]">
            {renderItem(item, (patch) => update(index, patch), index)}
          </div>
        </details>
      ))}
      {!addToStart && addButton}
    </div>
  )
}
