import type { SiteTexts } from "./siteText"

// Image fields hold a URL: "/uploads/..." for uploaded images, "/assets/..." for the
// images the site shipped with, or a full https:// link.

export type SocialLink = {
  id: string
  label: string
  url: string
  icon: string
}

// Public tracker IDs (they appear in the page anyway). A tracker loads only when it is
// enabled and has a valid ID. Secrets such as the Conversions API token stay on the server.
export type TrackingSettings = {
  gtmEnabled: boolean
  gtmId: string
  metaPixelEnabled: boolean
  metaPixelId: string
}

export type SiteSettings = {
  ownerName: string
  email: string
  phone: string
  address: string
  socials: SocialLink[]
  tracking: TrackingSettings
}

// Shared by services, work and blog posts: a short number shown as their ID in the
// dashboard, and when they were created.
export type ListEntry = {
  id: string
  serial: number
  createdAt: string
}

export type PageImages = {
  homeHero: string
  aboutPortrait: string
}

export type Stat = {
  id: string
  value: number
  suffix: string
  label: string
}

export type TitledItem = {
  id: string
  title: string
  description: string
}

export type ServiceOffering = TitledItem & {
  icon: string
}

// Text fields named *Title or heading accept *stars* around words to show them in gold.
export type ServiceDetail = {
  tagline: string
  heroTitle: string
  heroDescription: string
  offeringsHeading: string
  offeringsDescription: string
  offerings: ServiceOffering[]
  processImage: string
  processHeading: string
  processDescription: string
  steps: TitledItem[]
  whyHeading: string
  whyDescription: string
  features: TitledItem[]
}

// Fonts chosen for one service, work item or post (FontStyleId values; "" keeps the
// design's font): one for its headings and titles, one for its other text.
export type ItemFonts = { heading: string; text: string }

export type Service = ListEntry & {
  slug: string
  title: string
  summary: string
  fonts?: ItemFonts
  icon: string
  // Inactive services are hidden from the website but kept in the dashboard.
  active: boolean
  // Shown in the Home page services section (up to HOME_SERVICE_LIMIT, in list order).
  showOnHome: boolean
  detail: ServiceDetail
}

export type ConsultationCard = {
  title: string
  description: string
  fonts?: ItemFonts
}

export type ClientLogo = {
  id: string
  name: string
  image: string
}

// A visitor review shown on the website (only approved ones reach the public API).
export type Review = {
  id: number
  name: string
  rating: number
  text: string
  // Uploaded photo, or "" to show an avatar with the first letter of the name.
  image: string
  createdAt: string
}

export type ReviewStatus = "pending" | "approved" | "rejected"

export type HeroPage = "home" | "work" | "about" | "blog" | "contact" | "reviews"

// The big title and the line under it at the top of a page. The title accepts *stars*
// around words to show them in gold; both keep line breaks. Fonts are FontStyleId values.
export type HeroText = {
  title: string
  description: string
  titleFont: string
  descriptionFont: string
}

export type WorkItem = ListEntry & {
  title: string
  description: string
  fonts?: ItemFonts
  image: string
  active: boolean
  // Shown in "Real Result. Real Impact" on the Home page (the newest HOME_WORK_LIMIT).
  showOnHome: boolean
}

export type BlogBlockType = "heading" | "paragraph" | "bullets" | "numbers" | "image"

export type BlogBlock = {
  id: string
  type: BlogBlockType
  // Lists keep one item per line. Images use `image` and an optional caption in `text`.
  text: string
  image: string
}

export type BlogPost = ListEntry & {
  slug: string
  title: string
  excerpt: string
  fonts?: ItemFonts
  label: string
  tags: string[]
  coverImage: string
  publishedAt: string
  status: "draft" | "published"
  blocks: BlogBlock[]
}

// "Featured In" on the About Me page: a logo or screenshot, linking to the article.
export type FeaturedItem = {
  id: string
  name: string
  image: string
  // Opens in a new tab when the image is clicked; "" for no link.
  url: string
}

export type AboutContent = {
  // The text beside the portrait. An empty line starts a new paragraph.
  text: string
  featured: FeaturedItem[]
}

export type SiteContent = {
  settings: SiteSettings
  images: PageImages
  stats: Stat[]
  services: Service[]
  consultation: ConsultationCard
  clientLogos: ClientLogo[]
  heroes: Record<HeroPage, HeroText>
  about: AboutContent
  // Changes to the fixed website text (see content/siteText.ts).
  texts: SiteTexts
  work: WorkItem[]
  blog: BlogPost[]
  updatedAt: string | null
}

export type ContactMessage = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  preferredContactTime: string
  message: string
  createdAt: string
  isRead: boolean
}
