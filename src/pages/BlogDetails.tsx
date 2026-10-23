import CtaBanner from "../components/CtaBanner"
import Footer from "../components/Footer"
import HighlightText from "../components/HighlightText"
import { fontStyle } from "../content/fonts"
import { useSiteContent } from "../content/store"
import type { BlogBlock, ItemFonts } from "../content/types"
import { mediaUrl, withBase } from "../paths"

const lines = (text: string) => text.split("\n").map((line) => line.trim()).filter(Boolean)

function Block({ block, fonts }: { block: BlogBlock; fonts?: ItemFonts }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="font-['Inter:Semi_Bold'] font-semibold leading-[1.2] text-[20px]" style={fontStyle(fonts?.heading)}>
          {block.text}
        </h2>
      )
    case "paragraph":
      return (
        <div className="font-['Inter:Regular'] font-normal text-[18px] w-full" style={fontStyle(fonts?.text)}>
          {lines(block.text).map((line, index) => (
            <p className="leading-[1.3] mb-0" key={index}>
              <HighlightText className="leading-[1.3]" text={line} />
            </p>
          ))}
        </div>
      )
    case "bullets":
    case "numbers": {
      const List = block.type === "bullets" ? "ul" : "ol"
      return (
        <List className={`font-['Inter:Regular'] font-normal text-[18px] w-full ${block.type === "bullets" ? "list-disc" : "list-decimal"}`} style={fontStyle(fonts?.text)}>
          {lines(block.text).map((line, index) => (
            <li className="ms-[27px] leading-[1.3]" key={index}>
              <HighlightText className="leading-[1.3]" text={line} />
            </li>
          ))}
        </List>
      )
    }
    case "image":
      return block.image ? (
        <figure className="w-full">
          <img alt={block.text} className="block w-full h-auto border border-[#091e39] border-solid rounded-[2px]" src={mediaUrl(block.image)} />
          {block.text && (
            <figcaption className="mt-[8px] text-[14px] text-[#3e3e3e]" style={fontStyle(fonts?.text)}>
              {block.text}
            </figcaption>
          )}
        </figure>
      ) : null
  }
}

// A heading and the text right after it sit close together (16px); sections are 42px apart.
function groupBlocks(blocks: BlogBlock[]) {
  const groups: BlogBlock[][] = []
  for (const block of blocks) {
    const last = groups.at(-1)
    const startsGroup = block.type === "heading" || block.type === "image" || !last || last[0].type === "image"
    if (startsGroup) groups.push([block])
    else last.push(block)
  }
  return groups
}

export default function BlogDetails({ slug }: { slug?: string }) {
  const { blog } = useSiteContent()
  const post = blog.find((item) => item.slug === slug && item.status === "published")

  if (!post) {
    return (
      <div className="flow-page bg-[#fefefe] relative w-full" data-name="Blog details">
        <div className="mx-auto flex w-[1280px] flex-col items-center gap-[24px] pt-[260px] pb-[200px] text-center text-[#091e39]">
          <p className="font-['Inter:Bold'] text-[48px] font-bold">Article not found</p>
          <p className="text-[18px]">This article may have been moved or unpublished.</p>
          <a className="rounded-[999px] bg-[#091e39] px-[24px] py-[14px] text-[16px] text-white" data-path="/blog" href={withBase("/blog")}>
            Back to Blog
          </a>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flow-page bg-[#fefefe] relative w-full" data-node-id="1:1867" data-name="Blog details">
      <article className="mx-auto flex flex-col gap-[64px] items-center pt-[210px] w-[1280px]" data-name="Blog Post">
        <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-[826px]" data-name="Header Text">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-center justify-center relative shrink-0 text-center w-full" data-name="Text Wrapper">
            {post.label && (
              <p className="font-['Nunito_Sans:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#c7994b] text-[14px] uppercase" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
                {post.label}
              </p>
            )}
            <h1 className="font-['Inter:Bold'] font-bold leading-[1.2] not-italic relative shrink-0 text-[#091e39] text-[60px] w-full" style={fontStyle(post.fonts?.heading)}>
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="font-['Inter:Regular'] font-normal leading-[1.2] not-italic relative shrink-0 text-[#091e39] text-[16px] w-full" style={fontStyle(post.fonts?.text)}>
                {post.excerpt}
              </p>
            )}
          </div>
        </div>
        {post.coverImage && (
          <div className="blog-hero-image border border-[#091e39] border-solid h-[640px] relative rounded-[2px] shrink-0 w-[1248px] overflow-hidden" data-name="Hero Image">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[2px] size-full" src={mediaUrl(post.coverImage)} />
          </div>
        )}
        <div className="blog-body flex flex-col gap-[42px] items-start relative shrink-0 w-full text-[#091e39]" data-name="Blog Text Wrapper">
          {groupBlocks(post.blocks).map((group) => (
            <div className="[word-break:break-word] flex flex-col gap-[16px] items-start w-full" key={group[0].id}>
              {group.map((block) => (
                <Block block={block} fonts={post.fonts} key={block.id} />
              ))}
            </div>
          ))}
        </div>
      </article>
      <CtaBanner className="mx-auto mt-[120px]" nodeId="1:1736" />
      <div className="mt-[120px]">
        <Footer />
      </div>
    </div>
  )
}
