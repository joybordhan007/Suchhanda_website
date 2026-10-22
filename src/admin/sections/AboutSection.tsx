import ImageField from "../components/ImageField"
import ListEditor from "../components/ListEditor"
import Panel from "../components/Panel"
import SectionHeader from "../components/SectionHeader"
import TextField from "../components/TextField"
import { newId, type SectionProps } from "../types"

// The About Me page: the text beside the portrait and the "Featured In" images.
// The page title is in Page Heroes and the portrait in Page Images.
export default function AboutSection({ content, onChange, actions }: SectionProps) {
  const { about } = content
  const set = (patch: Partial<typeof about>) => onChange({ about: { ...about, ...patch } })

  return (
    <div className="flex flex-col gap-[28px]">
      <SectionHeader
        actions={actions}
        description="The text next to your photo and the “Featured In” section on the About Me page. The page title is in Page Heroes; the photo is in Page Images."
        title="About Page"
      />
      <Panel description="Shown next to your photo. Leave an empty line between paragraphs; a single Enter starts a new line." title="About text">
        <TextField label="Text" multiline onChange={(text) => set({ text })} rows={12} value={about.text} />
      </Panel>
      <Panel
        description="Images in one row under “Featured In”, in this order; three fit best. Add a link and the image opens it in a new tab when clicked."
        title="Featured In"
      >
        <ListEditor
          addLabel="Add featured item"
          createItem={() => ({ id: newId(), name: "", image: "", url: "" })}
          emptyText="Nothing featured yet. The images are hidden until you add one."
          itemTitle={(item) => item.name || item.url || "Featured item"}
          items={about.featured}
          onChange={(featured) => set({ featured })}
          openByDefault={false}
          renderItem={(item, update) => (
            <>
              <ImageField
                hint="Screenshot or logo of the article, about 765×677 (a little wider than tall). It is cropped to fill the box."
                label="Image"
                onChange={(image) => update({ image })}
                previewClass="aspect-[765/677] max-w-[260px]"
                value={item.image}
              />
              <div className="grid gap-[16px] md:grid-cols-2">
                <TextField hint="For example the website or magazine name. Read aloud by screen readers." label="Name" onChange={(name) => update({ name })} value={item.name} />
                <TextField hint="Full link to the article, e.g. https://… Leave empty for no link." label="Link" onChange={(url) => update({ url })} type="url" value={item.url} />
              </div>
            </>
          )}
        />
      </Panel>
    </div>
  )
}
