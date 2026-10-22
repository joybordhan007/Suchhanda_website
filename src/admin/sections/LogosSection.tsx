import ImageField from "../components/ImageField"
import ListEditor from "../components/ListEditor"
import SectionHeader from "../components/SectionHeader"
import TextField from "../components/TextField"
import { newId, type SectionProps } from "../types"

export default function LogosSection({ content, onChange, actions }: SectionProps) {
  return (
    <div className="flex flex-col gap-[28px]">
      <SectionHeader
        actions={actions}
        description="Logos in the scrolling “Trusted by Businesses of all sizes” strip on the Home and Work pages, in this order."
        title="Client Logos"
      />
      <ListEditor
        addLabel="Add logo"
        createItem={() => ({ id: newId(), name: "", image: "" })}
        emptyText="No logos yet. The strip is hidden until you add one."
        itemTitle={(logo) => logo.name || "Logo"}
        items={content.clientLogos}
        onChange={(clientLogos) => onChange({ clientLogos })}
        openByDefault={false}
        renderItem={(logo, update) => (
          <>
            <TextField hint="Read aloud by screen readers." label="Company name" onChange={(name) => update({ name })} value={logo.name} />
            <ImageField
              hint="Shown 40px tall. A wide logo on a transparent background (SVG or PNG) works best."
              label="Logo"
              onChange={(image) => update({ image })}
              previewClass="h-[72px]"
              value={logo.image}
            />
          </>
        )}
      />
    </div>
  )
}
