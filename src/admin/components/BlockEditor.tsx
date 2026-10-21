import type { BlogBlock, BlogBlockType } from "../../content/types"
import { newId } from "../types"
import Icon from "./Icon"
import ImageField from "./ImageField"
import TextField from "./TextField"

const blockTypes: { type: BlogBlockType; label: string }[] = [
  { type: "heading", label: "Heading" },
  { type: "paragraph", label: "Paragraph" },
  { type: "bullets", label: "Bullet list" },
  { type: "numbers", label: "Numbered list" },
  { type: "image", label: "Image" },
]

const labelOf = (type: BlogBlockType) => blockTypes.find((item) => item.type === type)?.label ?? type

const smallButton = "admin-icon-btn h-[30px] w-[30px]"

type BlockEditorProps = {
  blocks: BlogBlock[]
  onChange: (blocks: BlogBlock[]) => void
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const update = (index: number, patch: Partial<BlogBlock>) =>
    onChange(blocks.map((block, i) => (i === index ? { ...block, ...patch } : block)))

  const move = (index: number, offset: number) => {
    const next = [...blocks]
    const [block] = next.splice(index, 1)
    next.splice(index + offset, 0, block)
    onChange(next)
  }

  const remove = (index: number) => {
    if (window.confirm(`Delete this ${labelOf(blocks[index].type).toLowerCase()}?`)) {
      onChange(blocks.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="flex flex-col gap-[12px]">
      {blocks.length === 0 && (
        <p className="rounded-[12px] border border-dashed border-[var(--admin-border-strong)] p-[20px] text-center text-[14px] text-[var(--admin-muted)]">
          The article is empty. Add a heading, paragraph, list or image below.
        </p>
      )}
      {blocks.map((block, index) => (
        <div className="flex flex-col gap-[10px] rounded-[12px] border border-[var(--admin-border)] bg-[#fcfcfd] p-[14px]" key={block.id}>
          <div className="flex flex-wrap items-center justify-between gap-[8px]">
            <span className="admin-badge bg-[#fdf6e9] text-[var(--admin-gold-ink)]">{labelOf(block.type)}</span>
            <span className="flex gap-[6px]">
              <button aria-label="Move up" className={smallButton} disabled={index === 0} onClick={() => move(index, -1)} type="button">
                <Icon name="up" size={15} />
              </button>
              <button
                aria-label="Move down"
                className={smallButton}
                disabled={index === blocks.length - 1}
                onClick={() => move(index, 1)}
                type="button"
              >
                <Icon name="down" size={15} />
              </button>
              <button aria-label="Delete" className={`${smallButton} admin-icon-btn-danger`} onClick={() => remove(index)} title="Delete" type="button">
                <Icon name="trash" size={15} />
              </button>
            </span>
          </div>
          {block.type === "heading" && (
            <TextField label="Heading text" onChange={(text) => update(index, { text })} value={block.text} />
          )}
          {block.type === "paragraph" && (
            <TextField
              hint="Put *stars* around words to show them in gold. Each line becomes its own paragraph."
              label="Paragraph text"
              multiline
              onChange={(text) => update(index, { text })}
              rows={5}
              value={block.text}
            />
          )}
          {(block.type === "bullets" || block.type === "numbers") && (
            <TextField
              hint="One item per line."
              label="List items"
              multiline
              onChange={(text) => update(index, { text })}
              rows={4}
              value={block.text}
            />
          )}
          {block.type === "image" && (
            <>
              <ImageField label="Image" onChange={(image) => update(index, { image })} value={block.image} />
              <TextField label="Caption (optional)" onChange={(text) => update(index, { text })} value={block.text} />
            </>
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-[8px]">
        {blockTypes.map(({ type, label }) => (
          <button
            className="admin-btn h-[36px] border-dashed border-[var(--admin-gold)] bg-[#fdf8ee] text-[var(--admin-gold-ink)] hover:bg-[#faefd8]"
            key={type}
            onClick={() => onChange([...blocks, { id: newId(), type, text: "", image: "" }])}
            type="button"
          >
            <Icon name="plus" size={15} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
