import CtaBanner from "../components/CtaBanner"
import Footer from "../components/Footer"
import { publishedPosts } from "../content/selectors"
import { useSiteContent } from "../content/store"
import type { BlogPost } from "../content/types"
import { assetPathPrefix, mediaUrl, withBase } from "../paths"

const imgArrowForward = `${assetPathPrefix}/b1262.svg`

function BlogCard({ post }: { post: BlogPost }) {
  const path = `/blog/${post.slug}`
  return (
    <a
      className="blog-card bg-white content-stretch drop-shadow-[0px_2px_2px_rgba(0,0,0,0.1)] flex flex-col gap-[24px] items-center relative rounded-[8px] shrink-0 w-[504px]"
      data-name="Component"
      data-path={path}
      href={withBase(path)}
    >
      <div className="h-[300px] relative rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-[504px] overflow-hidden" data-name="Image">
        {post.coverImage && <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-tl-[8px] rounded-tr-[8px] size-full" src={mediaUrl(post.coverImage)} />}
      </div>
      <div className="content-stretch flex flex-col items-start pb-[24px] px-[24px] relative shrink-0 w-full" data-name="Content">
        <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
            {post.tags.length > 0 && (
              <div className="content-stretch flex flex-wrap gap-[8px] items-start relative shrink-0">
                {post.tags.map((tag) => (
                  <div className="bg-[rgba(199,153,75,0.1)] border border-[rgba(199,153,75,0.2)] border-solid content-stretch flex items-center justify-center px-[6px] py-[4px] relative rounded-[9999px] shrink-0" key={tag}>
                    <div className="[word-break:break-word] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#c7994b] text-[12px] text-left whitespace-nowrap">
                      <p className="leading-[1.2]">{tag}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 text-[#091e39] text-left w-full">
              <div className="flex flex-col font-['Inter:Semi_Bold'] font-semibold justify-center relative shrink-0 text-[20px] w-full">
                <p className="blog-card-title leading-[1.2]">{post.title}</p>
              </div>
              <div className="flex flex-col font-['Inter:Regular'] font-normal justify-center relative shrink-0 text-[18px] w-full">
                <p className="blog-card-excerpt leading-[1.3]">{post.excerpt}</p>
              </div>
            </div>
          </div>
          <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
            <div className="[word-break:break-word] flex flex-col font-['Inter:Medium'] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#c7994b] text-[16px] text-left whitespace-nowrap">
              <p className="leading-[1.2]">Read Now</p>
            </div>
            <div className="relative shrink-0 size-[20px]" data-name="arrow-forward">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowForward} />
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}

export default function Blog() {
  const posts = publishedPosts(useSiteContent().blog)
  const rows = Array.from({ length: Math.ceil(posts.length / 3) }, (_, index) => posts.slice(index * 3, index * 3 + 3))

  return (
    <div className="flow-page bg-[#fefefe] relative w-full" data-node-id="1:1583" data-name="Blog">
      <div className="relative h-[480px] overflow-clip w-[1920px]" data-node-id="1:1584" data-name="Hero">
        <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[32px] items-center left-[410px] text-[#091e39] top-[208px] w-[1100px]" data-node-id="1:1585" data-name="Frame">
          <p className="font-['Noto_Serif:Bold'] font-bold leading-[0] relative shrink-0 text-[64px] whitespace-nowrap" data-node-id="1:1586" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
            <span className="leading-[1.2]">{`Digital `}</span>
            <span className="leading-[1.2] text-[#c7994b]">Marketing Blog</span>
          </p>
          <p className="font-['Anuphan:Regular'] font-normal leading-[1.3] min-w-full relative shrink-0 text-[32px] text-center w-[min-content]" data-node-id="1:1587">
            Practical Marketing Insights to Help Your Business Grow
          </p>
        </div>
      </div>
      <div className="mx-auto flex flex-col gap-[56px] items-start w-[1280px]" data-node-id="1:1588" data-name="Frame">
        {posts.length === 0 && <p className="w-full text-center text-[18px] text-[#3e3e3e]">New articles are coming soon.</p>}
        {rows.map((row, index) => (
          <div className="content-stretch flex gap-[24px] items-stretch relative shrink-0 w-full" key={index}>
            {row.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ))}
      </div>
      <CtaBanner className="mx-auto mt-[120px]" nodeId="1:1736" />
      <div className="mt-[120px]">
        <Footer />
      </div>
    </div>
  )
}
