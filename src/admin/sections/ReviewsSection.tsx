import { useCallback, useEffect, useRef, useState } from "react"
import { api } from "../../content/api"
import type { Review, ReviewStatus } from "../../content/types"
import { mediaUrl } from "../../paths"
import Icon from "../components/Icon"
import SectionHeader from "../components/SectionHeader"
import Table from "../components/Table"
import { formatDateTime, formatId } from "../format"
import { cell, idClass, primaryButton, rowAction, rowActionDanger, rowClass, secondaryButton } from "../styles"

type AdminReview = Review & { status: ReviewStatus }
type Counts = Record<ReviewStatus, number>

type ReviewsSectionProps = {
  itemId?: string
  open: (section: string, itemId?: string) => void
  onPendingCount: (count: number) => void
}

const FILTERS = ["pending", "approved", "rejected", "all"] as const
type Filter = (typeof FILTERS)[number]

const statusStyle: Record<ReviewStatus, string> = {
  pending: "bg-[#fdf6e9] text-[var(--admin-gold-ink)]",
  approved: "bg-[#ecfdf3] text-[#067647]",
  rejected: "bg-[#f2f4f7] text-[#475467]",
}

const statusLabel: Record<ReviewStatus, string> = { pending: "Pending", approved: "Approved", rejected: "Rejected" }

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`} className="flex items-center gap-[1px]" role="img">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg aria-hidden="true" fill={star <= rating ? "#f5b400" : "#e4e7ec"} height={14} key={star} viewBox="0 0 20 20" width={14}>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  )
}

function Avatar({ review, size = 36 }: { review: Review; size?: number }) {
  const src = mediaUrl(review.image)
  return src ? (
    <img alt="" className="shrink-0 rounded-full object-cover" src={src} style={{ width: size, height: size }} />
  ) : (
    <span className="flex shrink-0 items-center justify-center rounded-full bg-[#f2f4f7] font-semibold text-[var(--admin-text-2)]" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {review.name.charAt(0).toUpperCase()}
    </span>
  )
}

function ReviewDetail({
  review,
  busy,
  onBack,
  onStatus,
  onDelete,
}: {
  review: AdminReview
  busy: boolean
  onBack: () => void
  onStatus: (status: ReviewStatus) => void
  onDelete: () => void
}) {
  return (
    <div className="flex flex-col gap-[20px]">
      <button className="flex items-center gap-[4px] self-start text-[13px] font-semibold text-[var(--admin-muted)] hover:text-[var(--admin-text)]" onClick={onBack} type="button">
        <Icon name="back" size={16} />
        All reviews
      </button>
      <div className="flex flex-wrap items-center justify-between gap-[16px]">
        <div className="flex items-center gap-[14px]">
          <Avatar review={review} size={56} />
          <div>
            <p className="text-[13px] text-[var(--admin-muted)]">{formatId("REV", review.id)}</p>
            <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-[var(--admin-text)]">{review.name}</h1>
            {(review.role || review.company) && <p className="text-[14px] text-[var(--admin-text-2)]">{[review.role, review.company].filter(Boolean).join(" · ")}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-[8px]">
          {review.status !== "approved" && (
            <button className={primaryButton} disabled={busy} onClick={() => onStatus("approved")} type="button">
              <Icon name="check" size={16} />
              Approve
            </button>
          )}
          {review.status !== "rejected" && (
            <button className={secondaryButton} disabled={busy} onClick={() => onStatus("rejected")} type="button">
              <Icon name="close" size={16} />
              {review.status === "approved" ? "Hide from website" : "Reject"}
            </button>
          )}
          <button className="admin-btn admin-btn-danger" disabled={busy} onClick={onDelete} type="button">
            <Icon name="trash" size={16} />
            Delete
          </button>
        </div>
      </div>
      <div className="admin-card flex flex-col gap-[16px] p-[24px]">
        <div className="flex flex-wrap items-center gap-[12px]">
          <span className={`admin-badge ${statusStyle[review.status]}`}>{statusLabel[review.status]}</span>
          <Stars rating={review.rating} />
          <span className="text-[13px] text-[var(--admin-muted)]">Sent {formatDateTime(review.createdAt)}</span>
        </div>
        <p className="whitespace-pre-line text-[16px] leading-[1.6] text-[var(--admin-text)] [word-break:break-word]">{review.text}</p>
      </div>
    </div>
  )
}

// Reviews visitors send from the Reviews page. Only approved ones are shown on the website.
export default function ReviewsSection({ itemId, open, onPendingCount }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<AdminReview[] | null>(null)
  const [counts, setCounts] = useState<Counts>({ pending: 0, approved: 0, rejected: 0 })
  const [filter, setFilter] = useState<Filter>("pending")
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const firstLoad = useRef(true)

  const applyCounts = useCallback(
    (next: Counts) => {
      setCounts(next)
      onPendingCount(next.pending)
    },
    [onPendingCount],
  )

  const load = useCallback(async () => {
    try {
      const data = await api<{ reviews: AdminReview[]; counts: Counts }>("/admin/reviews")
      setReviews(data.reviews)
      applyCounts(data.counts)
      // With nothing waiting, open on the full list instead of an empty "Pending" tab.
      if (firstLoad.current && data.counts.pending === 0) setFilter("all")
      firstLoad.current = false
      setError("")
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load reviews.")
    }
  }, [applyCounts])

  useEffect(() => {
    void load()
  }, [load])

  const setStatus = async (id: number, status: ReviewStatus) => {
    setBusyId(id)
    try {
      const data = await api<{ counts: Counts }>(`/admin/reviews/${id}`, { method: "PATCH", body: JSON.stringify({ status }) })
      setReviews((list) => list?.map((review) => (review.id === id ? { ...review, status } : review)) ?? null)
      applyCounts(data.counts)
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Could not update the review.")
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id: number) => {
    if (!window.confirm("Delete this review for good? Its photo is deleted too.")) return
    setBusyId(id)
    try {
      const data = await api<{ counts: Counts }>(`/admin/reviews/${id}`, { method: "DELETE" })
      setReviews((list) => list?.filter((review) => review.id !== id) ?? null)
      applyCounts(data.counts)
      if (itemId) open("reviews")
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete the review.")
    } finally {
      setBusyId(null)
    }
  }

  if (itemId) {
    const selected = reviews?.find((review) => String(review.id) === itemId)
    if (!reviews) return <p className="text-[15px] text-[var(--admin-muted)]">{error || "Loading…"}</p>
    if (!selected) {
      return (
        <div className="flex flex-col items-start gap-[12px]">
          <p className="text-[15px] text-[var(--admin-text-2)]">This review no longer exists.</p>
          <button className={primaryButton} onClick={() => open("reviews")} type="button">
            Back to all reviews
          </button>
        </div>
      )
    }
    return (
      <ReviewDetail
        busy={busyId === selected.id}
        onBack={() => open("reviews")}
        onDelete={() => void remove(selected.id)}
        onStatus={(status) => void setStatus(selected.id, status)}
        review={selected}
      />
    )
  }

  const shown = (reviews ?? []).filter((review) => filter === "all" || review.status === filter)
  const total = counts.pending + counts.approved + counts.rejected

  return (
    <div className="flex flex-col gap-[24px]">
      <SectionHeader
        description="Reviews sent from the Reviews page on the website. They stay hidden until you approve them; the newest three approved ones also show in “Trusted by Businesses” on the Home and Work pages."
        title="Reviews"
      />
      <div className="flex flex-wrap items-center gap-[8px]">
        {FILTERS.map((value) => (
          <button
            className={`flex h-[34px] items-center gap-[8px] rounded-[4px] border px-[14px] text-[13px] font-semibold capitalize transition ${
              filter === value ? "border-[var(--admin-navy)] bg-[var(--admin-navy)] text-white" : "border-[var(--admin-border)] bg-white text-[var(--admin-text-2)] hover:border-[var(--admin-gold)]"
            }`}
            key={value}
            onClick={() => setFilter(value)}
            type="button"
          >
            {value}
            <span className={`rounded-[4px] px-[6px] text-[11px] ${filter === value ? "bg-white/15" : "bg-[#f2f4f7]"}`}>{value === "all" ? total : counts[value]}</span>
          </button>
        ))}
        <button className="admin-btn admin-btn-ghost ml-auto h-[34px]" onClick={() => void load()} type="button">
          <Icon name="refresh" size={15} />
          Refresh
        </button>
      </div>
      {error && <p className="rounded-[4px] border border-[#fecdca] bg-[#fef3f2] px-[14px] py-[10px] text-[14px] text-[#b42318]">{error}</p>}
      <Table
        empty={
          reviews !== null &&
          shown.length === 0 && {
            icon: "star",
            title: filter === "pending" ? "Nothing waiting for approval" : "No reviews here",
            text: filter === "pending" ? "New reviews from the website appear here first." : "Reviews sent from the website's Reviews page appear here.",
          }
        }
        footer={reviews !== null && total > 0 && `${counts.approved} shown on the website · ${counts.pending} waiting · ${total} total`}
        headers={["ID", "Reviewer", "Review", "Sent", "Status", { label: "Actions", align: "right", srOnly: true }]}
      >
        {reviews === null && !error && (
          <tr>
            <td className={`${cell} text-[var(--admin-muted)]`} colSpan={6}>
              Loading…
            </td>
          </tr>
        )}
        {shown.map((review) => (
          <tr className={`${rowClass} cursor-pointer`} key={review.id} onClick={() => open("reviews", String(review.id))}>
            <td className={`${cell} ${idClass} w-[96px]`}>{formatId("REV", review.id)}</td>
            <td className={`${cell} w-[220px]`}>
              <span className="flex items-center gap-[10px]">
                <Avatar review={review} />
                <span className="min-w-0">
                  <span className="block truncate font-medium text-[var(--admin-text)]">{review.name}</span>
                  {(review.role || review.company) && (
                    <span className="block truncate text-[12px] text-[var(--admin-muted)]">{[review.role, review.company].filter(Boolean).join(" · ")}</span>
                  )}
                  <Stars rating={review.rating} />
                </span>
              </span>
            </td>
            <td className={`${cell} max-w-[360px] text-[13px] text-[var(--admin-text-2)]`}>
              <p className="line-clamp-2">{review.text}</p>
            </td>
            <td className={`${cell} whitespace-nowrap text-[13px] text-[var(--admin-muted)]`}>{formatDateTime(review.createdAt)}</td>
            <td className={cell}>
              <span className={`admin-badge ${statusStyle[review.status]}`}>{statusLabel[review.status]}</span>
            </td>
            <td className={`${cell} w-[1%] whitespace-nowrap`} onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-end gap-[2px]">
                {review.status !== "approved" && (
                  <button aria-label={`Approve review from ${review.name}`} className={rowAction} disabled={busyId === review.id} onClick={() => void setStatus(review.id, "approved")} title="Approve" type="button">
                    <Icon className="text-[#067647]" name="check" size={16} />
                  </button>
                )}
                {review.status !== "rejected" && (
                  <button
                    aria-label={`${review.status === "approved" ? "Hide" : "Reject"} review from ${review.name}`}
                    className={rowAction}
                    disabled={busyId === review.id}
                    onClick={() => void setStatus(review.id, "rejected")}
                    title={review.status === "approved" ? "Hide from website" : "Reject"}
                    type="button"
                  >
                    <Icon name="close" size={16} />
                  </button>
                )}
                <button aria-label={`Delete review from ${review.name}`} className={rowActionDanger} disabled={busyId === review.id} onClick={() => void remove(review.id)} title="Delete" type="button">
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  )
}
