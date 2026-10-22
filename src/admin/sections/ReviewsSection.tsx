import ImageField from "../components/ImageField"
import ListEditor from "../components/ListEditor"
import SectionHeader from "../components/SectionHeader"
import TextField from "../components/TextField"
import { newId, type SectionProps } from "../types"

export default function ReviewsSection({ content, onChange, actions }: SectionProps) {
  return (
    <div className="flex flex-col gap-[28px]">
      <SectionHeader
        actions={actions}
        description="Review images in “Trusted by Businesses Proven by Results” on the Home and Work pages. Three are shown at a time; with more than three, dots let visitors see the rest."
        title="Reviews"
      />
      <ListEditor
        addLabel="Add review"
        createItem={() => ({ id: newId(), name: "", image: "" })}
        emptyText="No reviews yet. The section is hidden until you add one."
        itemTitle={(review, index) => review.name || `Review ${index + 1}`}
        items={content.reviews}
        onChange={(reviews) => onChange({ reviews })}
        openByDefault={false}
        renderItem={(review, update) => (
          <>
            <ImageField
              hint="Screenshot of the review, 519×446 (about 7:6). It is cropped to fill the card."
              label="Review image"
              onChange={(image) => update({ image })}
              previewClass="aspect-[519/446]"
              value={review.image}
            />
            <TextField
              hint="Who wrote it, e.g. “Sumiya, Bangladesh”. Read aloud by screen readers."
              label="Reviewer"
              onChange={(name) => update({ name })}
              value={review.name}
            />
          </>
        )}
      />
    </div>
  )
}
