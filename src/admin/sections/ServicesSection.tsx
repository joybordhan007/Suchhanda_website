import type { ReactNode } from "react"
import { basicDetail } from "../../content/defaults"
import { slugify } from "../../content/selectors"
import type { Service, ServiceDetail } from "../../content/types"
import { withBase } from "../../paths"
import ImageField from "../components/ImageField"
import ListEditor from "../components/ListEditor"
import Panel from "../components/Panel"
import SectionHeader from "../components/SectionHeader"
import TextField from "../components/TextField"
import { newId, type SectionProps } from "../types"

const HOME_SERVICE_COUNT = 5
const highlightHint =
  "Put *stars* around words to show them in gold. A new line starts a new line on the page. Leave empty to use the service name."

// One block per section of the service page, in the same order as the page.
function PageSection({ step, title, dark = false, children }: { step: number; title: string; dark?: boolean; children: ReactNode }) {
  return (
    <section
      className={`flex flex-col gap-[16px] rounded-[10px] border p-[16px] sm:p-[20px] ${
        dark ? "border-[#191919] bg-[#191919]/[0.03]" : "border-[rgba(0,0,0,0.1)] bg-[#fafafa]"
      }`}
    >
      <h3 className="flex items-center gap-[10px] text-[15px] font-semibold text-[#091e39]">
        <span className="flex size-[24px] items-center justify-center rounded-full bg-[#091e39] text-[12px] text-white">{step}</span>
        {title}
      </h3>
      {children}
    </section>
  )
}

function ServiceEditor({ service, update }: { service: Service; update: (patch: Partial<Service>) => void }) {
  const detail = service.detail
  const setDetail = (patch: Partial<ServiceDetail>) => update({ detail: { ...detail, ...patch } })

  return (
    <div className="flex flex-col gap-[20px]">
      <PageSection step={1} title="Card (Home page and Service menu)">
        <div className="grid gap-[16px] md:grid-cols-2">
          <TextField
            label="Service name"
            onChange={(title) =>
              update({ title, ...(!service.slug || service.slug === slugify(service.title) ? { slug: slugify(title) } : {}) })
            }
            value={service.title}
          />
          <TextField
            hint={`Page address: /service/${service.slug || "…"}`}
            label="Page address (slug)"
            onChange={(slug) => update({ slug: slugify(slug) })}
            value={service.slug}
          />
        </div>
        <TextField
          hint={`${service.summary.length} characters — around 130 fits the card best.`}
          label="Short description"
          multiline
          onChange={(summary) => update({ summary })}
          rows={2}
          value={service.summary}
        />
        <ImageField
          hint="Shown 80px tall on the card. Transparent PNG or SVG works best."
          label="Card icon"
          onChange={(icon) => update({ icon })}
          previewClass="h-[96px]"
          value={service.icon}
        />
      </PageSection>

      <PageSection step={2} title="Page top (hero)">
        <TextField
          label="Small line above the title"
          onChange={(tagline) => setDetail({ tagline })}
          placeholder="MORE CLICKS · BETTER LEADS · HIGHER SALES"
          value={detail.tagline}
        />
        <TextField hint={highlightHint} label="Title" multiline onChange={(heroTitle) => setDetail({ heroTitle })} rows={2} value={detail.heroTitle} />
        <TextField label="Description" multiline onChange={(heroDescription) => setDetail({ heroDescription })} rows={3} value={detail.heroDescription} />
      </PageSection>

      <PageSection step={3} title="“Our Services” — what this service includes">
        <TextField hint={highlightHint} label="Heading" onChange={(offeringsHeading) => setDetail({ offeringsHeading })} value={detail.offeringsHeading} />
        <TextField
          label="Description"
          multiline
          onChange={(offeringsDescription) => setDetail({ offeringsDescription })}
          rows={2}
          value={detail.offeringsDescription}
        />
        <p className="text-[13px] text-[#777]">Cards are shown three per row. With no cards, this section is hidden.</p>
        <ListEditor
          addLabel="Add card"
          createItem={() => ({ id: newId(), icon: "", title: "New item", description: "" })}
          emptyText="No cards yet."
          itemTitle={(item) => item.title}
          items={detail.offerings}
          onChange={(offerings) => setDetail({ offerings })}
          openByDefault={false}
          renderItem={(item, change) => (
            <>
              <TextField label="Title" onChange={(title) => change({ title })} value={item.title} />
              <TextField label="Description" multiline onChange={(description) => change({ description })} rows={2} value={item.description} />
              <ImageField
                darkPreview
                hint="Shown 32×32 in white on a dark circle. Use a light-coloured SVG or PNG."
                label="Icon"
                onChange={(icon) => change({ icon })}
                previewClass="h-[72px]"
                value={item.icon}
              />
            </>
          )}
        />
      </PageSection>

      <PageSection step={4} title="“How It Works” — image and steps">
        <ImageField
          hint="Landscape photo, about 4:3. Cropped to fill 502×380."
          label="Image"
          onChange={(processImage) => setDetail({ processImage })}
          previewClass="aspect-[502/380]"
          value={detail.processImage}
        />
        <TextField hint={highlightHint} label="Heading" onChange={(processHeading) => setDetail({ processHeading })} value={detail.processHeading} />
        <TextField label="Description" multiline onChange={(processDescription) => setDetail({ processDescription })} rows={2} value={detail.processDescription} />
        <p className="text-[13px] text-[#777]">Steps are numbered 01, 02, 03… in this order. Four fit best on one row.</p>
        <ListEditor
          addLabel="Add step"
          createItem={() => ({ id: newId(), title: "New step", description: "" })}
          emptyText="No steps yet."
          itemTitle={(step, index) => `${String(index + 1).padStart(2, "0")} · ${step.title}`}
          items={detail.steps}
          onChange={(steps) => setDetail({ steps })}
          openByDefault={false}
          renderItem={(step, change) => (
            <>
              <TextField label="Title" onChange={(title) => change({ title })} value={step.title} />
              <TextField label="Description" multiline onChange={(description) => change({ description })} rows={2} value={step.description} />
            </>
          )}
        />
      </PageSection>

      <PageSection dark step={5} title="“Why Choose Me” — dark box">
        <TextField hint={highlightHint} label="Heading" onChange={(whyHeading) => setDetail({ whyHeading })} value={detail.whyHeading} />
        <TextField label="Description" multiline onChange={(whyDescription) => setDetail({ whyDescription })} rows={3} value={detail.whyDescription} />
        <p className="text-[13px] text-[#777]">Reasons are shown two per row, numbered 01, 02, 03…</p>
        <ListEditor
          addLabel="Add reason"
          createItem={() => ({ id: newId(), title: "New reason", description: "" })}
          emptyText="No reasons yet."
          itemTitle={(feature, index) => `${String(index + 1).padStart(2, "0")} · ${feature.title}`}
          items={detail.features}
          onChange={(features) => setDetail({ features })}
          openByDefault={false}
          renderItem={(feature, change) => (
            <>
              <TextField label="Title" onChange={(title) => change({ title })} value={feature.title} />
              <TextField label="Description" multiline onChange={(description) => change({ description })} rows={2} value={feature.description} />
            </>
          )}
        />
      </PageSection>

      <a
        className="self-start text-[14px] font-medium text-[#8a6a2f] underline underline-offset-4"
        href={withBase(`/service/${service.slug}`)}
        rel="noreferrer"
        target="_blank"
      >
        Open this service page ↗ <span className="text-[#777] no-underline">(shows the last saved version)</span>
      </a>
    </div>
  )
}

export default function ServicesSection({ content, onChange }: SectionProps) {
  const slugCounts = content.services.reduce<Record<string, number>>((counts, service) => {
    counts[service.slug] = (counts[service.slug] ?? 0) + 1
    return counts
  }, {})

  return (
    <div className="flex flex-col gap-[28px]">
      <SectionHeader
        description="Every service gets its own page and appears in the Service menu. The first five are also shown on the Home page, next to the Free Consultation card — use the arrows to choose which ones."
        title="Services"
      />
      <Panel description="The last card in the Home page services section. It links to the Contact page." title="Free Consultation card">
        <div className="grid gap-[16px] md:grid-cols-2">
          <TextField
            label="Title"
            onChange={(title) => onChange({ consultation: { ...content.consultation, title } })}
            value={content.consultation.title}
          />
          <TextField
            label="Description"
            multiline
            onChange={(description) => onChange({ consultation: { ...content.consultation, description } })}
            rows={2}
            value={content.consultation.description}
          />
        </div>
      </Panel>
      <ListEditor
        addLabel="Add service"
        badge={(service, index) => (
          <>
            {index < HOME_SERVICE_COUNT && (
              <span className="shrink-0 rounded-full bg-[#c7994b]/15 px-[8px] py-[2px] text-[12px] font-medium text-[#8a6a2f]">
                On Home
              </span>
            )}
            {slugCounts[service.slug] > 1 && (
              <span className="shrink-0 rounded-full bg-red-50 px-[8px] py-[2px] text-[12px] font-medium text-red-700">
                Duplicate address
              </span>
            )}
          </>
        )}
        createItem={() => {
          const title = "New Service"
          // Empty headings fall back to the service name on the page, so renaming keeps them in step.
          return {
            id: newId(),
            slug: slugify(title),
            title,
            summary: "",
            icon: "",
            detail: { ...basicDetail(title, ""), heroTitle: "", offeringsHeading: "", whyHeading: "" },
          }
        }}
        itemTitle={(service) => service.title}
        items={content.services}
        onChange={(services) => onChange({ services })}
        openByDefault={false}
        renderItem={(service, update) => <ServiceEditor service={service} update={update} />}
      />
    </div>
  )
}
