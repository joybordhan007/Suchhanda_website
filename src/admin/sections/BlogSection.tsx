import { useState, type ReactNode } from "react"
import { slugify } from "../../content/selectors"
import type { BlogPost } from "../../content/types"
import { mediaUrl, siteHref } from "../../paths"
import BlockEditor from "../components/BlockEditor"
import EditorBar from "../components/EditorBar"
import ImageField from "../components/ImageField"
import NameModal from "../components/NameModal"
import SectionHeader from "../components/SectionHeader"
import Table from "../components/Table"
import TextField from "../components/TextField"
import Toggle from "../components/Toggle"
import { formatDate, formatId, nextSerial } from "../format"
import Icon from "../components/Icon"
import { cell, idClass, primaryButton, rowAction, rowActionDanger, rowClass } from "../styles"
import { newId, type ManagedSectionProps } from "../types"
import { useEditableItem } from "../useEditableItem"

// Keeps the typed text (including a trailing comma) while editing.
function TagsField({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [text, setText] = useState(tags.join(", "))
  return (
    <TextField
      hint="Separate tags with commas, e.g. “Google Ads, Meta Ads”."
      label="Tags"
      onChange={(next) => {
        setText(next)
        onChange(next.split(",").map((tag) => tag.trim()).filter(Boolean))
      }}
      value={text}
    />
  )
}

function EditorPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="admin-card flex flex-col gap-[16px] p-[18px] sm:p-[24px]">
      <h2 className="text-[16px] font-semibold text-[var(--admin-text)]">{title}</h2>
      {children}
    </section>
  )
}

function PostEditor({
  post,
  duplicateSlug,
  onSave,
  onBack,
}: {
  post: BlogPost
  duplicateSlug: (slug: string) => boolean
  onSave: (next: BlogPost) => Promise<void>
  onBack: () => void
}) {
  const editor = useEditableItem(post, onSave)
  const { value, update } = editor

  return (
    <div className="flex flex-col gap-[20px]">
      <EditorBar
        backLabel="All blog posts"
        isDirty={editor.isDirty}
        message={editor.message}
        onBack={() => editor.confirmLeave() && onBack()}
        onSave={() => void editor.submit()}
        saving={editor.saving}
        status={
          <Toggle
            checked={value.status === "published"}
            label="Publish this post on the website"
            offText="Draft"
            onChange={(published) => update({ status: published ? "published" : "draft" })}
            onText="Published"
          />
        }
        subtitle={`${formatId("BLG", value.serial)} · Created ${formatDate(value.createdAt)}`}
        title={value.title}
      />

      <EditorPanel title="Card on the Blog page">
        <ImageField
          hint="Landscape image, about 16:9. Also shown large at the top of the article."
          label="Cover image"
          onChange={(coverImage) => update({ coverImage })}
          value={value.coverImage}
        />
        <TextField
          label="Title"
          onChange={(title) => update({ title, ...(!value.slug || value.slug === slugify(value.title) ? { slug: slugify(title) } : {}) })}
          value={value.title}
        />
        <TextField
          hint="Shown under the title on the card (two lines) and on the article page."
          label="Short summary"
          multiline
          onChange={(excerpt) => update({ excerpt })}
          rows={3}
          value={value.excerpt}
        />
        <TagsField onChange={(tags) => update({ tags })} tags={value.tags} />
      </EditorPanel>

      <EditorPanel title="Publishing">
        <div className="grid gap-[16px] md:grid-cols-2">
          <TextField
            hint={duplicateSlug(value.slug) ? "Another post already uses this address." : `Page address: /blog/${value.slug || "…"}`}
            label="Page address (slug)"
            onChange={(slug) => update({ slug: slugify(slug) })}
            value={value.slug}
          />
          <TextField
            hint="Posts are listed newest first by this date."
            label="Publish date"
            onChange={(publishedAt) => update({ publishedAt })}
            type="date"
            value={value.publishedAt}
          />
        </div>
      </EditorPanel>

      <EditorPanel title="Article page">
        <TextField
          hint="Small gold line above the title, e.g. “New Blog”. Leave empty to hide it."
          label="Label"
          onChange={(label) => update({ label })}
          value={value.label}
        />
        <p className="text-[13px] text-[#777]">The article shows the title, summary and cover image above, then these blocks in order.</p>
        <BlockEditor blocks={value.blocks} onChange={(blocks) => update({ blocks })} />
      </EditorPanel>

      {post.status === "published" && (
        <a
          className="self-start text-[14px] font-medium text-[#8a6a2f] underline underline-offset-4"
          href={siteHref(`/blog/${post.slug}`)}
          rel="noreferrer"
          target="_blank"
        >
          Open this article ↗ <span className="text-[#777] no-underline">(shows the last saved version)</span>
        </a>
      )}
    </div>
  )
}

export default function BlogSection({ content, commit, itemId, open }: ManagedSectionProps) {
  // "new" comes from the Dashboard quick actions: open the create popup straight away.
  const [creating, setCreating] = useState(itemId === "new")
  const [busyId, setBusyId] = useState<string | null>(null)
  const posts = [...content.blog].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  if (itemId && itemId !== "new") {
    const post = content.blog.find((item) => item.id === itemId)
    if (!post) {
      return (
        <div className="flex flex-col items-start gap-[12px]">
          <p className="text-[15px] text-[#555]">This post no longer exists.</p>
          <button className={primaryButton} onClick={() => open("blog")} type="button">
            Back to all posts
          </button>
        </div>
      )
    }
    return (
      <PostEditor
        duplicateSlug={(slug) => content.blog.some((item) => item.id !== post.id && item.slug === slug)}
        key={post.id}
        onBack={() => open("blog")}
        onSave={(next) => commit((current) => ({ ...current, blog: current.blog.map((item) => (item.id === next.id ? next : item)) }))}
        post={post}
      />
    )
  }

  const change = async (id: string, apply: (blog: BlogPost[]) => BlogPost[]) => {
    setBusyId(id)
    try {
      await commit((current) => ({ ...current, blog: apply(current.blog) }))
    } finally {
      setBusyId(null)
    }
  }

  const create = async (title: string) => {
    const now = new Date().toISOString()
    const post: BlogPost = {
      id: newId(),
      serial: nextSerial(content.blog),
      createdAt: now,
      slug: slugify(title),
      title,
      excerpt: "",
      label: "New Blog",
      tags: [],
      coverImage: "",
      publishedAt: now.slice(0, 10),
      // New posts stay drafts until they are written and switched on.
      status: "draft",
      blocks: [],
    }
    await commit((current) => ({ ...current, blog: [post, ...current.blog] }))
    setCreating(false)
    open("blog", post.id)
  }

  return (
    <div className="flex flex-col gap-[28px]">
      <div className="flex flex-wrap items-end justify-between gap-[16px]">
        <SectionHeader description="Only published posts appear on the website; drafts stay here until you switch them on." title="Blog" />
        <button className={primaryButton} onClick={() => setCreating(true)} type="button">
          <Icon name="plus" size={16} />
          Add blog
        </button>
      </div>

      <Table
        empty={
          posts.length === 0 && {
            icon: "blog",
            title: "No posts yet",
            text: "Write your first article; it stays a draft until you publish it.",
            action: (
              <button className={primaryButton} onClick={() => setCreating(true)} type="button">
                <Icon name="plus" size={16} />
                Add blog
              </button>
            ),
          }
        }
        footer={posts.length > 0 && `${posts.filter((post) => post.status === "published").length} published · ${posts.filter((post) => post.status !== "published").length} drafts`}
        headers={["ID", "Blog", "Created", "Status", { label: "Actions", align: "right", srOnly: true }]}
      >
        {posts.map((post) => (
          <tr className={rowClass} key={post.id}>
            <td className={`${cell} ${idClass} w-[96px]`}>{formatId("BLG", post.serial)}</td>
            <td className={cell}>
              <div className="flex items-center gap-[12px]">
                <div className="h-[40px] w-[64px] shrink-0 overflow-hidden rounded-[4px] bg-[#f2f4f7] ring-1 ring-black/5">
                  {post.coverImage && <img alt="" className="size-full object-cover" loading="lazy" src={mediaUrl(post.coverImage)} />}
                </div>
                <div className="min-w-0">
                  <button className="block max-w-[360px] truncate text-left font-medium text-[var(--admin-text)] hover:underline" onClick={() => open("blog", post.id)} type="button">
                    {post.title || "Untitled"}
                  </button>
                  <p className="mt-[2px] truncate text-[12px] text-[var(--admin-muted)]">/blog/{post.slug}</p>
                </div>
              </div>
            </td>
            <td className={`${cell} whitespace-nowrap text-[13px] text-[var(--admin-muted)]`}>{formatDate(post.createdAt)}</td>
            <td className={cell}>
              <Toggle
                checked={post.status === "published"}
                disabled={busyId === post.id}
                label={`Publish ${post.title} on the website`}
                offText="Draft"
                onChange={(published) =>
                  void change(post.id, (list) => list.map((item) => (item.id === post.id ? { ...item, status: published ? "published" : "draft" } : item)))
                }
                onText="Published"
                size="sm"
              />
            </td>
            <td className={`${cell} w-[1%] whitespace-nowrap`}>
              <div className="flex items-center justify-end gap-[2px]">
                <button aria-label={`Edit ${post.title}`} className={rowAction} onClick={() => open("blog", post.id)} title="Edit" type="button">
                  <Icon name="edit" size={16} />
                </button>
                <button
                  aria-label={`Delete ${post.title}`}
                  className={rowActionDanger}
                  disabled={busyId === post.id}
                  onClick={() => {
                    if (window.confirm(`Delete “${post.title}”? This cannot be undone.`)) void change(post.id, (list) => list.filter((item) => item.id !== post.id))
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

      {creating && (
        <NameModal
          hint="You can write the article on the next screen. It stays a draft until you publish it."
          label="Blog title"
          onClose={() => setCreating(false)}
          onSubmit={create}
          placeholder="e.g. 5 Meta Ads Mistakes to Avoid"
          submitLabel="Create blog"
          title="Add a blog post"
        />
      )}
    </div>
  )
}
