import { useState, type ReactNode } from "react"
import { basicDetail } from "../../content/defaults"
import { HOME_SERVICE_LIMIT, slugify } from "../../content/selectors"
import type { Service, ServiceDetail } from "../../content/types"
import { siteHref } from "../../paths"
import EditorBar from "../components/EditorBar"
import ImageField from "../components/ImageField"
import ItemFontsFields from "../components/ItemFontsFields"
import ListEditor from "../components/ListEditor"
import NameModal from "../components/NameModal"
import Panel from "../components/Panel"
import SectionHeader from "../components/SectionHeader"
import Table from "../components/Table"
import TextField from "../components/TextField"
import Toggle from "../components/Toggle"
import { formatDate, formatId, nextSerial } from "../format"
import Icon from "../components/Icon"
import { cell, idClass, primaryButton, rowAction, rowActionDanger, rowClass } from "../styles"
import { newId, type ManagedSectionProps } from "../types"
import { useEditableItem } from "../useEditableItem"

const highlightHint =
  "Put *stars* around words to show them in gold. A new line starts a new line on the page. Leave empty to use the service name."

// One block per section of the service page, in the same order as the page.
function PageSection({ step, title, dark = false, children }: { step: number; title: string; dark?: boolean; children: ReactNode }) {
  return (
    <section
      className={`admin-card flex flex-col gap-[16px] p-[18px] sm:p-[24px] ${dark ? "border-l-[4px] border-l-[#191919]" : ""}`}
    >
      <h2 className="flex items-center gap-[10px] text-[16px] font-semibold text-[var(--admin-text)]">
        <span className={`flex size-[26px] items-center justify-center rounded-[4px] text-[12px] font-bold text-white ${dark ? "bg-[#191919]" : "bg-[var(--admin-navy)]"}`}>
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

type ServiceEditorProps = {
  service: Service
  // Other services already switched on for the Home page.
  otherHomeCount: number
  onSave: (next: Service) => Promise<void>
  onBack: () => void
}

function ServiceEditor({ service, otherHomeCount, onSave, onBack }: ServiceEditorProps) {
  const editor = useEditableItem(service, onSave)
  const { value, update } = editor
  const detail = value.detail
  const setDetail = (patch: Partial<ServiceDetail>) => update({ detail: { ...detail, ...patch } })
  const homeFull = !value.showOnHome && otherHomeCount >= HOME_SERVICE_LIMIT

  return (
    <div className="flex flex-col gap-[20px]">
      <EditorBar
        backLabel="All services"
        isDirty={editor.isDirty}
        message={editor.message}
        onBack={() => editor.confirmLeave() && onBack()}
        onSave={() => void editor.submit()}
        saving={editor.saving}
        status={
          <div className="flex flex-wrap items-center gap-x-[20px] gap-y-[8px]">
            <Toggle checked={value.active} label="Show this service on the website" onChange={(active) => update({ active })} />
            <span title={homeFull ? `The Home page shows ${HOME_SERVICE_LIMIT} services. Switch one off first.` : value.active ? undefined : "Shown on Home once the service is active."}>
              <Toggle
                checked={value.showOnHome}
                disabled={homeFull}
                label="Show this service on the Home page"
                offText="Not on Home"
                onChange={(showOnHome) => update({ showOnHome })}
                onText="On Home"
              />
            </span>
          </div>
        }
        subtitle={`${formatId("SRV", value.serial)} · Created ${formatDate(value.createdAt)}`}
        title={value.title}
      />

      <PageSection step={1} title="Card (Home page and Service menu)">
        <div className="grid gap-[16px] md:grid-cols-2">
          <TextField
            label="Service name"
            onChange={(title) => update({ title, ...(!value.slug || value.slug === slugify(value.title) ? { slug: slugify(title) } : {}) })}
            value={value.title}
          />
          <TextField
            hint={`Page address: /service/${value.slug || "…"}`}
            label="Page address (slug)"
            onChange={(slug) => update({ slug: slugify(slug) })}
            value={value.slug}
          />
        </div>
        <TextField
          hint={`${value.summary.length} characters — around 130 fits the card best.`}
          label="Short description"
          multiline
          onChange={(summary) => update({ summary })}
          rows={2}
          value={value.summary}
        />
        <ImageField
          hint="Shown 80px tall on the card. Transparent PNG or SVG works best."
          label="Card icon"
          onChange={(icon) => update({ icon })}
          previewClass="h-[96px]"
          value={value.icon}
        />
      </PageSection>

      <section className="admin-card flex flex-col gap-[16px] p-[18px] sm:p-[24px]">
        <h2 className="text-[16px] font-semibold text-[var(--admin-text)]">Fonts</h2>
        <ItemFontsFields
          headingHint="Service name on the card and all headings and titles on the service page."
          onChange={(fonts) => update({ fonts })}
          textHint="Short description and all other text on the service page."
          value={value.fonts}
        />
      </section>

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

      {service.active && (
        <a
          className="self-start text-[14px] font-medium text-[#8a6a2f] underline underline-offset-4"
          href={siteHref(`/service/${service.slug}`)}
          rel="noreferrer"
          target="_blank"
        >
          Open this service page ↗ <span className="text-[#777] no-underline">(shows the last saved version)</span>
        </a>
      )}
    </div>
  )
}

function ConsultationPanel({ content, commit }: Pick<ManagedSectionProps, "content" | "commit">) {
  const editor = useEditableItem(content.consultation, (consultation) => commit((current) => ({ ...current, consultation })))
  return (
    <Panel
      description="The sixth card in the Home page services section, after the services marked “On Home”. Its “Contact Me” button opens the Contact page."
      title="Free Consultation card (Home page)"
    >
      <div className="grid gap-[16px] md:grid-cols-2">
        <TextField label="Title" onChange={(title) => editor.update({ title })} value={editor.value.title} />
        <TextField
          label="Description"
          multiline
          onChange={(description) => editor.update({ description })}
          rows={2}
          value={editor.value.description}
        />
      </div>
      <ItemFontsFields onChange={(fonts) => editor.update({ fonts })} value={editor.value.fonts} />
      <div className="flex items-center gap-[12px]">
        <button className={primaryButton} disabled={!editor.isDirty || editor.saving} onClick={() => void editor.submit()} type="button">
          {editor.saving ? "Saving…" : "Save card"}
        </button>
        {editor.message && (
          <span className={`text-[13px] ${editor.message.kind === "error" ? "text-red-700" : "text-green-800"}`}>{editor.message.text}</span>
        )}
      </div>
    </Panel>
  )
}

export default function ServicesSection({ content, commit, itemId, open }: ManagedSectionProps) {
  // "new" comes from the Dashboard quick actions: open the create popup straight away.
  const [creating, setCreating] = useState(itemId === "new")
  const [busyId, setBusyId] = useState<string | null>(null)
  const services = content.services

  if (itemId && itemId !== "new") {
    const service = services.find((item) => item.id === itemId)
    if (!service) {
      return (
        <div className="flex flex-col items-start gap-[12px]">
          <p className="text-[15px] text-[#555]">This service no longer exists.</p>
          <button className={primaryButton} onClick={() => open("services")} type="button">
            Back to all services
          </button>
        </div>
      )
    }
    return (
      <ServiceEditor
        key={service.id}
        otherHomeCount={services.filter((item) => item.id !== service.id && item.active && item.showOnHome).length}
        onBack={() => open("services")}
        onSave={(next) => commit((current) => ({ ...current, services: current.services.map((item) => (item.id === next.id ? next : item)) }))}
        service={service}
      />
    )
  }

  const change = async (id: string, apply: (services: Service[]) => Service[]) => {
    setBusyId(id)
    try {
      await commit((current) => ({ ...current, services: apply(current.services) }))
    } finally {
      setBusyId(null)
    }
  }

  const move = (id: string, offset: number) =>
    change(id, (list) => {
      const next = [...list]
      const index = next.findIndex((item) => item.id === id)
      const [item] = next.splice(index, 1)
      next.splice(index + offset, 0, item)
      return next
    })

  const create = async (title: string) => {
    const service: Service = {
      id: newId(),
      serial: nextSerial(services),
      createdAt: new Date().toISOString(),
      slug: slugify(title),
      title,
      summary: "",
      icon: "",
      // New services stay hidden until they are filled in and switched on.
      active: false,
      showOnHome: false,
      // Empty headings fall back to the service name on the page.
      detail: { ...basicDetail(title, ""), heroTitle: "", offeringsHeading: "", whyHeading: "" },
    }
    await commit((current) => ({ ...current, services: [...current.services, service] }))
    setCreating(false)
    open("services", service.id)
  }

  return (
    <div className="flex flex-col gap-[28px]">
      <div className="flex flex-wrap items-end justify-between gap-[16px]">
        <SectionHeader
          description={`Active services appear in the Service menu and get their own page. Switch on “On Home” in a service to show it on the Home page (up to ${HOME_SERVICE_LIMIT}, in this order).`}
          title="Services"
        />
        <button className={primaryButton} onClick={() => setCreating(true)} type="button">
          <Icon name="plus" size={16} />
          Add service
        </button>
      </div>

      <Table
        empty={
          services.length === 0 && {
            icon: "services",
            title: "No services yet",
            text: "Add your first service; it stays hidden until you switch it on.",
            action: (
              <button className={primaryButton} onClick={() => setCreating(true)} type="button">
                <Icon name="plus" size={16} />
                Add service
              </button>
            ),
          }
        }
        footer={services.length > 0 && `${services.filter((service) => service.active).length} of ${services.length} live on the website`}
        headers={["ID", "Service", "Created", "Status", { label: "Actions", align: "right", srOnly: true }]}
      >
        {services.map((service, index) => (
          <tr className={rowClass} key={service.id}>
            <td className={`${cell} ${idClass} w-[96px]`}>{formatId("SRV", service.serial)}</td>
            <td className={cell}>
              <button className="block text-left font-medium text-[var(--admin-text)] hover:underline" onClick={() => open("services", service.id)} type="button">
                {service.title || "Untitled"}
              </button>
              <span className="mt-[2px] block text-[12px] text-[var(--admin-muted)]">/service/{service.slug}</span>
            </td>
            <td className={`${cell} whitespace-nowrap text-[13px] text-[var(--admin-muted)]`}>{formatDate(service.createdAt)}</td>
            <td className={cell}>
              <Toggle
                checked={service.active}
                disabled={busyId === service.id}
                label={`Show ${service.title} on the website`}
                onChange={(active) => void change(service.id, (list) => list.map((item) => (item.id === service.id ? { ...item, active } : item)))}
                size="sm"
              />
            </td>
            <td className={`${cell} w-[1%] whitespace-nowrap`}>
              <div className="flex items-center justify-end gap-[2px]">
                <button aria-label="Move up" className={rowAction} disabled={index === 0 || busyId !== null} onClick={() => void move(service.id, -1)} title="Move up" type="button">
                  <Icon name="up" size={16} />
                </button>
                <button
                  aria-label="Move down"
                  className={rowAction}
                  disabled={index === services.length - 1 || busyId !== null}
                  onClick={() => void move(service.id, 1)}
                  title="Move down"
                  type="button"
                >
                  <Icon name="down" size={16} />
                </button>
                <button aria-label={`Edit ${service.title}`} className={rowAction} onClick={() => open("services", service.id)} title="Edit" type="button">
                  <Icon name="edit" size={16} />
                </button>
                <button
                  aria-label={`Delete ${service.title}`}
                  className={rowActionDanger}
                  disabled={busyId === service.id}
                  onClick={() => {
                    if (window.confirm(`Delete “${service.title}”? Its page will be removed from the website.`)) void change(service.id, (list) => list.filter((item) => item.id !== service.id))
                  }}
                  title="Delete"
                  type="button"
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <ConsultationPanel commit={commit} content={content} />

      {creating && (
        <NameModal
          hint="You can add the details on the next screen. The service stays hidden until you switch it on."
          label="Service name"
          onClose={() => setCreating(false)}
          onSubmit={create}
          placeholder="e.g. TikTok Ads Management"
          submitLabel="Create service"
          title="Add a service"
        />
      )}
    </div>
  )
}
