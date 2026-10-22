import { useState } from "react"
import { HOME_WORK_LIMIT } from "../../content/selectors"
import type { WorkItem } from "../../content/types"
import { mediaUrl } from "../../paths"
import ImageField from "../components/ImageField"
import Modal from "../components/Modal"
import SectionHeader from "../components/SectionHeader"
import Table from "../components/Table"
import TextField from "../components/TextField"
import Toggle from "../components/Toggle"
import { formatDate, formatId, nextSerial } from "../format"
import Icon from "../components/Icon"
import { cell, idClass, primaryButton, rowAction, rowActionDanger, rowClass, secondaryButton } from "../styles"
import { newId, type ManagedSectionProps } from "../types"

type WorkForm = Pick<WorkItem, "image" | "title" | "description">

function WorkModal({ item, onSave, onClose }: { item: WorkItem | null; onSave: (form: WorkForm) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState<WorkForm>({ image: item?.image ?? "", title: item?.title ?? "", description: item?.description ?? "" })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const set = (patch: Partial<WorkForm>) => setForm((current) => ({ ...current, ...patch }))

  const save = async () => {
    if (!form.title.trim()) {
      setError("Please enter a work name.")
      return
    }
    setBusy(true)
    setError("")
    try {
      await onSave({ ...form, title: form.title.trim(), description: form.description.trim() })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save.")
      setBusy(false)
    }
  }

  return (
    <Modal
      footer={
        <>
          <button className={secondaryButton} onClick={onClose} type="button">
            Cancel
          </button>
          <button className={primaryButton} disabled={busy} onClick={() => void save()} type="button">
            {busy ? "Saving…" : item ? "Save changes" : "Add work"}
          </button>
        </>
      }
      onClose={onClose}
      title={item ? `Edit ${formatId("WRK", item.serial)}` : "Add work"}
    >
      <ImageField
        hint="Landscape screenshot, about 16:9. It is cropped to fill the card."
        label="Work image"
        onChange={(image) => set({ image })}
        value={form.image}
      />
      <TextField autoFocus hint="For example “Meta Ads” or the client's name." label="Work name" onChange={(title) => set({ title })} value={form.title} />
      <TextField label="Short description" multiline onChange={(description) => set({ description })} rows={3} value={form.description} />
      {error && <p className="text-[14px] text-red-700">{error}</p>}
    </Modal>
  )
}

export default function WorkSection({ content, commit, itemId }: ManagedSectionProps) {
  // undefined: closed; null: adding; an item: editing it. "new" comes from the Dashboard quick actions.
  const [editing, setEditing] = useState<WorkItem | null | undefined>(itemId === "new" ? null : undefined)
  const [busyId, setBusyId] = useState<string | null>(null)
  const work = [...content.work].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const homeCount = work.filter((item) => item.active && item.showOnHome).length

  const change = async (id: string, apply: (work: WorkItem[]) => WorkItem[]) => {
    setBusyId(id)
    try {
      await commit((current) => ({ ...current, work: apply(current.work) }))
    } finally {
      setBusyId(null)
    }
  }

  const save = async (form: WorkForm) => {
    if (editing) {
      await commit((current) => ({ ...current, work: current.work.map((item) => (item.id === editing.id ? { ...item, ...form } : item)) }))
    } else {
      const item: WorkItem = { id: newId(), serial: nextSerial(content.work), createdAt: new Date().toISOString(), active: true, showOnHome: false, ...form }
      await commit((current) => ({ ...current, work: [item, ...current.work] }))
    }
    setEditing(undefined)
  }

  return (
    <div className="flex flex-col gap-[28px]">
      <div className="flex flex-wrap items-end justify-between gap-[16px]">
        <SectionHeader
          description={`Work cards on the Work page, newest first. Switch on “On Home” to show a card in “Real Result. Real Impact” on the Home page (up to ${HOME_WORK_LIMIT}).`}
          title="Work"
        />
        <button className={primaryButton} onClick={() => setEditing(null)} type="button">
          <Icon name="plus" size={16} />
          Add work
        </button>
      </div>

      <Table
        empty={
          work.length === 0 && {
            icon: "work",
            title: "No work yet",
            text: "Add a screenshot of a campaign result to show it on the Work page.",
            action: (
              <button className={primaryButton} onClick={() => setEditing(null)} type="button">
                <Icon name="plus" size={16} />
                Add work
              </button>
            ),
          }
        }
        footer={work.length > 0 && `${work.filter((item) => item.active).length} of ${work.length} live on the website`}
        headers={["ID", "Work", "Description", "Created", "On Home", "Status", { label: "Actions", align: "right", srOnly: true }]}
      >
        {work.map((item) => (
          <tr className={rowClass} key={item.id}>
            <td className={`${cell} ${idClass} w-[96px]`}>{formatId("WRK", item.serial)}</td>
            <td className={cell}>
              <div className="flex items-center gap-[12px]">
                <div className="h-[40px] w-[64px] shrink-0 overflow-hidden rounded-[4px] bg-[#f2f4f7] ring-1 ring-black/5">
                  {item.image && <img alt="" className="size-full object-cover" loading="lazy" src={mediaUrl(item.image)} />}
                </div>
                <div className="min-w-0">
                  <button className="block truncate text-left font-medium text-[var(--admin-text)] hover:underline" onClick={() => setEditing(item)} type="button">
                    {item.title || "Untitled"}
                  </button>
                </div>
              </div>
            </td>
            <td className={`${cell} max-w-[300px] text-[13px] text-[var(--admin-muted)]`}>
              <p className="line-clamp-2">{item.description || "—"}</p>
            </td>
            <td className={`${cell} whitespace-nowrap text-[13px] text-[var(--admin-muted)]`}>{formatDate(item.createdAt)}</td>
            <td className={cell}>
              <span title={!item.showOnHome && item.active && homeCount >= HOME_WORK_LIMIT ? `The Home page shows ${HOME_WORK_LIMIT} work cards. Switch one off first.` : undefined}>
                <Toggle
                  checked={item.showOnHome}
                  disabled={busyId === item.id || (!item.showOnHome && item.active && homeCount >= HOME_WORK_LIMIT)}
                  label={`Show ${item.title} on the Home page`}
                  offText="Off"
                  onChange={(showOnHome) => void change(item.id, (list) => list.map((entry) => (entry.id === item.id ? { ...entry, showOnHome } : entry)))}
                  onText="On"
                  size="sm"
                />
              </span>
            </td>
            <td className={cell}>
              <Toggle
                checked={item.active}
                disabled={busyId === item.id}
                label={`Show ${item.title} on the website`}
                onChange={(active) => void change(item.id, (list) => list.map((entry) => (entry.id === item.id ? { ...entry, active } : entry)))}
                size="sm"
              />
            </td>
            <td className={`${cell} w-[1%] whitespace-nowrap`}>
              <div className="flex items-center justify-end gap-[2px]">
                <button aria-label={`Edit ${item.title}`} className={rowAction} onClick={() => setEditing(item)} title="Edit" type="button">
                  <Icon name="edit" size={16} />
                </button>
                <button
                  aria-label={`Delete ${item.title}`}
                  className={rowActionDanger}
                  disabled={busyId === item.id}
                  onClick={() => {
                    if (window.confirm(`Delete “${item.title}”?`)) void change(item.id, (list) => list.filter((entry) => entry.id !== item.id))
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

      {editing !== undefined && <WorkModal item={editing} onClose={() => setEditing(undefined)} onSave={save} />}
    </div>
  )
}
