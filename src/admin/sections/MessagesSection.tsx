import { useCallback, useEffect, useState } from "react"
import { api } from "../../content/api"
import type { ContactMessage } from "../../content/types"
import Icon from "../components/Icon"
import SectionHeader from "../components/SectionHeader"
import Table from "../components/Table"
import { formatDateTime, formatId } from "../format"
import { cell, idClass, primaryButton, rowAction, rowClass, secondaryButton } from "../styles"

type MessagesSectionProps = {
  itemId?: string
  open: (section: string, itemId?: string) => void
  onUnreadCount: (count: number) => void
}

function MessageDetail({
  message,
  onBack,
  onSetRead,
  onDelete,
}: {
  message: ContactMessage
  onBack: () => void
  onSetRead: (isRead: boolean) => void
  onDelete: () => void
}) {
  const rows: [string, string][] = [
    ["First name", message.firstName],
    ["Last name", message.lastName],
    ["Email", message.email],
    ["Phone", message.phone],
    ["Company", message.company],
    ["Preferred contact time", message.preferredContactTime],
    ["Sent", formatDateTime(message.createdAt)],
  ]

  return (
    <div className="flex flex-col gap-[20px]">
      <button className="flex items-center gap-[4px] self-start text-[13px] font-semibold text-[var(--admin-muted)] hover:text-[var(--admin-text)]" onClick={onBack} type="button">
        <Icon name="back" size={16} />
        All messages
      </button>
      <div className="flex flex-wrap items-start justify-between gap-[12px]">
        <div>
          <p className="font-mono text-[13px] text-[#777]">{formatId("MSG", message.id)}</p>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-[var(--admin-text)]">
            {message.firstName} {message.lastName}
          </h1>
        </div>
        <div className="flex flex-wrap gap-[8px]">
          <a className={primaryButton} href={`mailto:${message.email}?subject=${encodeURIComponent("Re: your inquiry")}`}>
            <Icon name="reply" size={16} />
            Reply by email
          </a>
          <button className={secondaryButton} onClick={() => onSetRead(!message.isRead)} type="button">
            Mark as {message.isRead ? "unread" : "read"}
          </button>
          <button className="admin-btn admin-btn-danger" onClick={onDelete} type="button">
            <Icon name="trash" size={16} />
            Delete
          </button>
        </div>
      </div>
      <section className="admin-card p-[20px] sm:p-[24px]">
        <dl className="grid gap-x-[32px] gap-y-[12px] text-[15px] sm:grid-cols-[max-content_1fr]">
          {rows.map(([label, value]) => (
            <div className="contents" key={label}>
              <dt className="text-[#777]">{label}</dt>
              <dd className="text-[#191919]">
                {label === "Email" ? (
                  <a className="text-[#091e39] underline underline-offset-2" href={`mailto:${value}`}>
                    {value}
                  </a>
                ) : label === "Phone" ? (
                  <a className="text-[#091e39] underline underline-offset-2" href={`tel:${value}`}>
                    {value}
                  </a>
                ) : (
                  value || "—"
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="admin-card p-[20px] sm:p-[24px]">
        <h2 className="mb-[10px] text-[13px] font-semibold text-[var(--admin-muted)]">Message</h2>
        <p className="whitespace-pre-wrap text-[16px] leading-[1.6] text-[#191919]">{message.message || "(No message written.)"}</p>
      </section>
    </div>
  )
}

export default function MessagesSection({ itemId, open, onUnreadCount }: MessagesSectionProps) {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const load = useCallback(async () => {
    try {
      const { messages: list } = await api<{ messages: ContactMessage[] }>("/messages")
      setMessages(list)
      setError("")
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load messages.")
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (messages) onUnreadCount(messages.filter((message) => !message.isRead).length)
  }, [messages, onUnreadCount])

  const setRead = useCallback(
    async (id: number, isRead: boolean) => {
      setMessages((list) => list?.map((message) => (message.id === id ? { ...message, isRead } : message)) ?? null)
      await api(`/messages/${id}`, { method: "PATCH", body: JSON.stringify({ isRead }) }).catch(load)
    },
    [load],
  )

  const remove = async (id: number) => {
    if (!window.confirm("Delete this message? This cannot be undone.")) return
    setMessages((list) => list?.filter((message) => message.id !== id) ?? null)
    await api(`/messages/${id}`, { method: "DELETE" }).catch(load)
    open("messages")
  }

  const selected = itemId ? messages?.find((message) => String(message.id) === itemId) : undefined

  // Opening a message marks it as read.
  useEffect(() => {
    if (selected && !selected.isRead) void setRead(selected.id, true)
  }, [selected, setRead])

  if (itemId) {
    if (messages === null) return <p className="text-[14px] text-[#777]">{error || "Loading…"}</p>
    if (!selected) {
      return (
        <div className="flex flex-col items-start gap-[12px]">
          <p className="text-[15px] text-[#555]">This message no longer exists.</p>
          <button className={primaryButton} onClick={() => open("messages")} type="button">
            Back to all messages
          </button>
        </div>
      )
    }
    return (
      <MessageDetail
        message={selected}
        onBack={() => open("messages")}
        onDelete={() => void remove(selected.id)}
        onSetRead={(isRead) => void setRead(selected.id, isRead)}
      />
    )
  }

  const shown = (messages ?? []).filter((message) => filter === "all" || !message.isRead)

  return (
    <div className="flex flex-col gap-[24px]">
      <SectionHeader description="Inquiries sent through the Contact page, newest first. Click a message to read it." title="Messages" />
      <div className="flex flex-wrap items-center gap-[8px]">
        {(["all", "unread"] as const).map((value) => (
          <button
            className={`h-[34px] rounded-[9px] border px-[14px] text-[13px] font-semibold capitalize transition ${
              filter === value ? "border-[var(--admin-navy)] bg-[var(--admin-navy)] text-white" : "border-[var(--admin-border)] bg-white text-[var(--admin-text-2)] hover:border-[var(--admin-gold)]"
            }`}
            key={value}
            onClick={() => setFilter(value)}
            type="button"
          >
            {value}
          </button>
        ))}
        <button className="admin-btn admin-btn-ghost ml-auto h-[34px]" onClick={() => void load()} type="button">
          <Icon name="refresh" size={15} />
          Refresh
        </button>
      </div>
      {error && <p className="rounded-[12px] border border-[#fecdca] bg-[#fef3f2] px-[14px] py-[10px] text-[14px] text-[#b42318]">{error}</p>}
      <Table
        empty={
          messages !== null &&
          shown.length === 0 && {
            icon: "messages",
            title: filter === "unread" ? "No unread messages" : "No messages yet",
            text: filter === "unread" ? "You're all caught up." : "Inquiries sent through the Contact page appear here.",
          }
        }
        footer={messages !== null && messages.length > 0 && `${messages.filter((message) => !message.isRead).length} unread · ${messages.length} total`}
        headers={["ID", "Name", "Email", "Sent", { label: "Open", align: "right", srOnly: true }]}
      >
        {messages === null && !error && (
          <tr>
            <td className={`${cell} text-[var(--admin-muted)]`} colSpan={5}>
              Loading…
            </td>
          </tr>
        )}
        {shown.map((message) => (
          <tr className={`${rowClass} cursor-pointer`} key={message.id} onClick={() => open("messages", String(message.id))}>
            <td className={`${cell} ${idClass} w-[110px]`}>
              <span className="flex items-center gap-[8px]">
                <span aria-hidden="true" className={`size-[7px] shrink-0 rounded-full ${message.isRead ? "bg-transparent" : "bg-[var(--admin-gold)]"}`} />
                {formatId("MSG", message.id)}
              </span>
            </td>
            <td className={cell}>
              <span className={message.isRead ? "font-medium text-[var(--admin-text-2)]" : "font-semibold text-[var(--admin-text)]"}>
                {message.firstName} {message.lastName}
              </span>
              {!message.isRead && <span className="sr-only"> (unread)</span>}
            </td>
            <td className={`${cell} text-[13px] text-[var(--admin-muted)]`}>{message.email}</td>
            <td className={`${cell} whitespace-nowrap text-[13px] text-[var(--admin-muted)]`}>{formatDateTime(message.createdAt)}</td>
            <td className={`${cell} w-[1%] text-right`}>
              <button
                aria-label={`Open message from ${message.firstName} ${message.lastName}`}
                className={rowAction}
                onClick={(event) => {
                  event.stopPropagation()
                  open("messages", String(message.id))
                }}
                title="Open"
                type="button"
              >
                <Icon className="rotate-180" name="back" size={16} />
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  )
}
