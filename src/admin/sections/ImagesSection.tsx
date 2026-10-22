import ImageField from "../components/ImageField"
import Panel from "../components/Panel"
import SectionHeader from "../components/SectionHeader"
import type { SectionProps } from "../types"

export default function ImagesSection({ content, onChange, actions }: SectionProps) {
  const set = (patch: Partial<typeof content.images>) => onChange({ images: { ...content.images, ...patch } })

  return (
    <div className="flex flex-col gap-[28px]">
      <SectionHeader actions={actions} description="Photos that appear in fixed places on the website." title="Page Images" />
      <Panel description="The photo next to “High-Converting Meta & Google Ads” at the top of the Home page." title="Home page – hero photo">
        <ImageField
          hint="Portrait photo, 4:5 (for example 800×1000). It is cropped to fill the frame."
          label="Hero photo"
          onChange={(homeHero) => set({ homeHero })}
          previewClass="aspect-[4/5]"
          value={content.images.homeHero}
        />
      </Panel>
      <Panel description="The large photo beside the introduction text on the About Me page." title="About Me page – photo">
        <ImageField
          hint="Portrait photo, about 6:7 (for example 900×1050). It is cropped to fill the frame."
          label="About photo"
          onChange={(aboutPortrait) => set({ aboutPortrait })}
          previewClass="aspect-[6/7]"
          value={content.images.aboutPortrait}
        />
      </Panel>
    </div>
  )
}
