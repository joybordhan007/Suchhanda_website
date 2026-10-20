import type { SiteContent } from "../../content/types"
import SectionHeader from "../components/SectionHeader"

type DashboardSectionProps = {
  content: SiteContent
  unreadMessages: number | null
  onOpen: (section: string) => void
}

export default function DashboardSection({ content, unreadMessages, onOpen }: DashboardSectionProps) {
  const published = content.blog.filter((post) => post.status === "published").length
  const cards = [
    {
      section: "messages",
      label: "Messages",
      value: unreadMessages === null ? "…" : unreadMessages === 0 ? "No unread" : `${unreadMessages} unread`,
      highlight: (unreadMessages ?? 0) > 0,
    },
    { section: "services", label: "Services", value: `${content.services.length} services` },
    { section: "work", label: "Work", value: `${content.work.length} items` },
    { section: "blog", label: "Blog", value: `${published} published · ${content.blog.length - published} drafts` },
    { section: "logos", label: "Client logos", value: `${content.clientLogos.length} logos` },
    { section: "reviews", label: "Reviews", value: `${content.reviews.length} images` },
    { section: "stats", label: "Achievements", value: content.stats.map((stat) => `${stat.value}${stat.suffix}`).join(" · ") },
    { section: "images", label: "Page images", value: "Home & About photos" },
    { section: "settings", label: "Site settings", value: `${content.settings.socials.length} social links` },
  ]

  return (
    <div className="flex flex-col gap-[28px]">
      <SectionHeader
        description="Choose what to edit. Changes go live on the website as soon as you press Save changes."
        title="Dashboard"
      />
      <p className="text-[14px] text-[#666]">
        Last saved: {content.updatedAt ? new Date(content.updatedAt).toLocaleString() : "never (the website shows its original content)"}
      </p>
      <div className="grid gap-[16px] sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <button
            className={`flex flex-col items-start gap-[8px] rounded-[12px] border bg-white p-[20px] text-left shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition hover:border-[#c7994b] ${
              card.highlight ? "border-[#c7994b]" : "border-[rgba(0,0,0,0.08)]"
            }`}
            key={card.section}
            onClick={() => onOpen(card.section)}
            type="button"
          >
            <span className="text-[13px] font-medium uppercase tracking-wide text-[#777]">{card.label}</span>
            <span className="text-[20px] font-semibold text-[#091e39]">{card.value}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
