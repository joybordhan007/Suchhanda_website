import { useState } from "react"
import { slugify } from "../../content/selectors"
import type { BlogPost } from "../../content/types"
import { withBase } from "../../paths"
import BlockEditor from "../components/BlockEditor"
import ImageField from "../components/ImageField"
import ListEditor from "../components/ListEditor"
import SectionHeader from "../components/SectionHeader"
import TextField from "../components/TextField"
import { newId, type SectionProps } from "../types"

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

function PostEditor({ post, update, duplicateSlug }: { post: BlogPost; update: (patch: Partial<BlogPost>) => void; duplicateSlug: boolean }) {
  return (
    <div className="flex flex-col gap-[20px]">
      <section className="flex flex-col gap-[16px] rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-[#fafafa] p-[16px] sm:p-[20px]">
        <h3 className="text-[15px] font-semibold text-[#091e39]">Card on the Blog page</h3>
        <ImageField
          hint="Landscape image, about 16:9. Also shown large at the top of the article."
          label="Cover image"
          onChange={(coverImage) => update({ coverImage })}
          value={post.coverImage}
        />
        <TextField
          label="Title"
          onChange={(title) => update({ title, ...(!post.slug || post.slug === slugify(post.title) ? { slug: slugify(title) } : {}) })}
          value={post.title}
        />
        <TextField
          hint="Shown under the title on the card (two lines) and on the article page."
          label="Short summary"
          multiline
          onChange={(excerpt) => update({ excerpt })}
          rows={3}
          value={post.excerpt}
        />
        <TagsField onChange={(tags) => update({ tags })} tags={post.tags} />
      </section>

      <section className="flex flex-col gap-[16px] rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-[#fafafa] p-[16px] sm:p-[20px]">
        <h3 className="text-[15px] font-semibold text-[#091e39]">Publishing</h3>
        <div className="grid gap-[16px] md:grid-cols-3">
          <TextField
            hint={duplicateSlug ? "Another post already uses this address." : `Page address: /blog/${post.slug || "…"}`}
            label="Page address (slug)"
            onChange={(slug) => update({ slug: slugify(slug) })}
            value={post.slug}
          />
          <TextField label="Publish date" onChange={(publishedAt) => update({ publishedAt })} type="date" value={post.publishedAt} />
          <div className="flex flex-col gap-[6px]">
            <span className="text-[13px] font-medium uppercase tracking-wide text-[#555]">Status</span>
            <div className="flex gap-[8px]">
              {(["draft", "published"] as const).map((status) => (
                <button
                  className={`flex-1 rounded-[8px] border px-[12px] py-[10px] text-[15px] capitalize ${
                    post.status === status ? "border-[#091e39] bg-[#091e39] text-white" : "border-[rgba(25,25,25,0.2)] bg-white text-[#191919]"
                  }`}
                  key={status}
                  onClick={() => update({ status })}
                  type="button"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-[16px] rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-[#fafafa] p-[16px] sm:p-[20px]">
        <h3 className="text-[15px] font-semibold text-[#091e39]">Article page</h3>
        <TextField
          hint="Small gold line above the title, e.g. “New Blog”. Leave empty to hide it."
          label="Label"
          onChange={(label) => update({ label })}
          value={post.label}
        />
        <p className="text-[13px] text-[#777]">
          The article shows the title, summary and cover image above, then these blocks in order.
        </p>
        <BlockEditor blocks={post.blocks} onChange={(blocks) => update({ blocks })} />
      </section>

      {post.status === "published" && (
        <a
          className="self-start text-[14px] font-medium text-[#8a6a2f] underline underline-offset-4"
          href={withBase(`/blog/${post.slug}`)}
          rel="noreferrer"
          target="_blank"
        >
          Open this article ↗ <span className="text-[#777] no-underline">(shows the last saved version)</span>
        </a>
      )}
    </div>
  )
}

export default function BlogSection({ content, onChange }: SectionProps) {
  const posts = [...content.blog].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  const slugCounts = content.blog.reduce<Record<string, number>>((counts, post) => {
    counts[post.slug] = (counts[post.slug] ?? 0) + 1
    return counts
  }, {})

  return (
    <div className="flex flex-col gap-[28px]">
      <SectionHeader
        description="Blog posts, newest first. Only published posts appear on the website; drafts stay here until you publish them."
        title="Blog"
      />
      <ListEditor
        addLabel="Add post"
        addToStart
        badge={(post) => (
          <span
            className={`shrink-0 rounded-full px-[8px] py-[2px] text-[12px] font-medium ${
              post.status === "published" ? "bg-green-50 text-green-800" : "bg-[#f0f0f0] text-[#666]"
            }`}
          >
            {post.status === "published" ? "Published" : "Draft"}
          </span>
        )}
        createItem={() => ({
          id: newId(),
          slug: slugify("New post"),
          title: "New post",
          excerpt: "",
          label: "New Blog",
          tags: [],
          coverImage: "",
          publishedAt: new Date().toISOString().slice(0, 10),
          status: "draft" as const,
          blocks: [],
        })}
        emptyText="No posts yet."
        itemTitle={(post) => post.title}
        items={posts}
        onChange={(blog) => onChange({ blog })}
        openByDefault={false}
        renderItem={(post, update) => <PostEditor duplicateSlug={slugCounts[post.slug] > 1} post={post} update={update} />}
        sortable={false}
      />
    </div>
  )
}
