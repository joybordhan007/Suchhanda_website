import ImageField from "../components/ImageField"
import ListEditor from "../components/ListEditor"
import SectionHeader from "../components/SectionHeader"
import TextField from "../components/TextField"
import { newId, type SectionProps } from "../types"

export default function WorkSection({ content, onChange }: SectionProps) {
  // Keep newest first, the order the site shows them in.
  const work = [...content.work].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="flex flex-col gap-[28px]">
      <SectionHeader
        description="Work cards on the Work page, newest first. The two newest are also shown in “Real Result. Real Impact” on the Home page."
        title="Work"
      />
      <ListEditor
        addLabel="Add work"
        addToStart
        badge={(_, index) =>
          index < 2 ? (
            <span className="shrink-0 rounded-full bg-[#c7994b]/15 px-[8px] py-[2px] text-[12px] font-medium text-[#8a6a2f]">On Home</span>
          ) : null
        }
        createItem={() => ({
          id: newId(),
          title: "New work",
          description: "",
          image: "",
          createdAt: new Date().toISOString(),
        })}
        emptyText="No work yet."
        itemTitle={(item) => item.title}
        items={work}
        onChange={(next) => onChange({ work: next })}
        openByDefault={false}
        sortable={false}
        renderItem={(item, update) => (
          <>
            <ImageField
              hint="Landscape screenshot, about 16:9. It is cropped to fill the card."
              label="Image"
              onChange={(image) => update({ image })}
              value={item.image}
            />
            <TextField hint="For example “Meta Ads” or the client's name." label="Title" onChange={(title) => update({ title })} value={item.title} />
            <TextField
              label="Short description"
              multiline
              onChange={(description) => update({ description })}
              rows={3}
              value={item.description}
            />
            <TextField
              hint="Newest work is shown first."
              label="Date"
              onChange={(date) => date && update({ createdAt: new Date(`${date}T12:00:00Z`).toISOString() })}
              type="date"
              value={item.createdAt.slice(0, 10)}
            />
          </>
        )}
      />
    </div>
  )
}
