import { useCallback, useEffect, useState } from "react"
import { api } from "../../content/api"
import type { ContactMessage } from "../../content/types"
import SectionHeader from "../components/SectionHeader"

type MessagesSectionProps = {
  onUnreadCount: (count: number) => void
}

export default function MessagesSection({ onUnreadCount }: MessagesSectionProps) {
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

  const setRead = async (id: number, isRead: boolean) => {
    setMessages((list) => list?.map((message) => (message.id === id ? { ...message, isRead } : message)) ?? null)
    await api(`/messages/${id}`, { method: "PATCH", body: JSON.stringify({ isRead }) }).catch(load)
  }

  const remove = async (id: number) => {
    if (!window.confirm("Delete this message? This cannot be undone.")) return
    setMessages((list) => list?.filter((message) => message.id !== id) ?? null)
    await api(`/messages/${id}`, { method: "DELETE" }).catch(load)
  }

  const shown = (messages ?? []).filter((message) => filter === "all" || !message.isRead)

  return (
    <div className="flex flex-col gap-[28px]">
      <SectionHeader description="Inquiries sent through the Contact page, newest first." title="Messages" />
      <div className="flex flex-wrap items-center gap-[8px]">
        {(["all", "unread"] as const).map((value) => (
          <button
            className={`rounded-[999px] border px-[14px] py-[6px] text-[14px] capitalize ${
              filter === value ? "border-[#091e39] bg-[#091e39] text-white" : "border-[rgba(25,25,25,0.2)] bg-white"
            }`}
            key={value}
            onClick={() => setFilter(value)}
            type="button"
          >
            {value}
          </button>
        ))}
        <button className="ml-auto text-[14px] text-[#8a6a2f] underline underline-offset-4" onClick={() => void load()} type="button">
          Refresh
        </button>
      </div>
      {error && <p className="rounded-[8px] bg-red-50 px-[14px] py-[10px] text-[14px] text-red-800">{error}</p>}
      {messages === null && !error && <p className="text-[14px] text-[#777]">Loading…</p>}
      {messages !== null && shown.length === 0 && (
        <div className="rounded-[12px] border border-dashed border-[rgba(0,0,0,0.15)] bg-white p-[40px] text-center text-[15px] text-[#777]">
          {filter === "unread" ? "No unread messages." : "No messages yet."}
        </div>
      )}
      <div className="flex flex-col gap-[12px]">
        {shown.map((message) => (
          <article
            className={`flex flex-col gap-[12px] rounded-[12px] border bg-white p-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-[20px] ${
              message.isRead ? "border-[rgba(0,0,0,0.08)]" : "border-[#c7994b]"
            }`}
            key={message.id}
          >
            <header className="flex flex-wrap items-start justify-between gap-[8px]">
              <div className="flex flex-col gap-[2px]">
                <h2 className="flex items-center gap-[8px] text-[17px] font-semibold text-[#191919]">
                  {!message.isRead && <span aria-label="Unread" className="size-[8px] rounded-full bg-[#c7994b]" />}
                  {message.firstName} {message.lastName}
                </h2>
                <p className="text-[14px] text-[#555]">{message.company}</p>
              </div>
              <time className="text-[13px] text-[#777]" dateTime={message.createdAt}>
                {new Date(message.createdAt).toLocaleString()}
              </time>
            </header>
            <dl className="grid gap-x-[24px] gap-y-[4px] text-[14px] sm:grid-cols-[max-content_1fr]">
              <dt className="text-[#777]">Email</dt>
              <dd>
                <a className="text-[#091e39] underline underline-offset-2" href={`mailto:${message.email}`}>
                  {message.email}
                </a>
              </dd>
              <dt className="text-[#777]">Phone</dt>
              <dd>
                <a className="text-[#091e39] underline underline-offset-2" href={`tel:${message.phone}`}>
                  {message.phone}
                </a>
              </dd>
              <dt className="text-[#777]">Best time</dt>
              <dd>{message.preferredContactTime}</dd>
            </dl>
            {message.message && <p className="whitespace-pre-wrap rounded-[8px] bg-[#f7f7f8] p-[12px] text-[15px] text-[#191919]">{message.message}</p>}
            <footer className="flex flex-wrap gap-[8px]">
              <a
                className="rounded-[8px] bg-[#091e39] px-[14px] py-[8px] text-[14px] text-white"
                href={`mailto:${message.email}?subject=${encodeURIComponent("Re: your inquiry")}`}
                onClick={() => !message.isRead && void setRead(message.id, true)}
              >
                Reply by email
              </a>
              <button
                className="rounded-[8px] border border-[rgba(25,25,25,0.2)] px-[14px] py-[8px] text-[14px]"
                onClick={() => void setRead(message.id, !message.isRead)}
                type="button"
              >
                Mark as {message.isRead ? "unread" : "read"}
              </button>
              <button
                className="rounded-[8px] px-[14px] py-[8px] text-[14px] text-red-700 hover:bg-red-50"
                onClick={() => void remove(message.id)}
                type="button"
              >
                Delete
              </button>
            </footer>
          </article>
        ))}
      </div>
    </div>
  )
}
