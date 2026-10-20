import type { BlogBlock, BlogBlockType } from "../../content/types"
import { newId } from "../types"
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

const smallButton =
  "rounded-[6px] border border-[rgba(25,25,25,0.15)] bg-white px-[10px] py-[4px] text-[13px] text-[#191919] hover:border-[#c7994b] disabled:cursor-not-allowed disabled:opacity-40"

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
        <p className="rounded-[10px] border border-dashed border-[rgba(0,0,0,0.15)] p-[20px] text-center text-[14px] text-[#777]">
          The article is empty. Add a heading, paragraph, list or image below.
        </p>
      )}
      {blocks.map((block, index) => (
        <div className="flex flex-col gap-[10px] rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-white p-[14px]" key={block.id}>
          <div className="flex flex-wrap items-center justify-between gap-[8px]">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-[#8a6a2f]">{labelOf(block.type)}</span>
            <span className="flex gap-[6px]">
              <button aria-label="Move up" className={smallButton} disabled={index === 0} onClick={() => move(index, -1)} type="button">
                ↑
              </button>
              <button
                aria-label="Move down"
                className={smallButton}
                disabled={index === blocks.length - 1}
                onClick={() => move(index, 1)}
                type="button"
              >
                ↓
              </button>
              <button className={`${smallButton} text-red-700`} onClick={() => remove(index)} type="button">
                Delete
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
            className="rounded-[8px] border border-dashed border-[#c7994b] px-[12px] py-[8px] text-[14px] font-medium text-[#8a6a2f] hover:bg-[#c7994b]/10"
            key={type}
            onClick={() => onChange([...blocks, { id: newId(), type, text: "", image: "" }])}
            type="button"
          >
            + {label}
          </button>
        ))}
      </div>
    </div>
  )
}
