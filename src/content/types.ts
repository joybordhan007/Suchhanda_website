// Image fields hold a URL: "/uploads/..." for uploaded images, "/assets/..." for the
// images the site shipped with, or a full https:// link.

export type SocialLink = {
  id: string
  label: string
  url: string
  icon: string
}

export type SiteSettings = {
  ownerName: string
  email: string
  phone: string
  address: string
  socials: SocialLink[]
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

export type Service = {
  id: string
  slug: string
  title: string
  summary: string
  icon: string
  detail: ServiceDetail
}

export type ConsultationCard = {
  title: string
  description: string
}

export type ClientLogo = {
  id: string
  name: string
  image: string
}

export type Review = {
  id: string
  name: string
  image: string
}

export type WorkItem = {
  id: string
  title: string
  description: string
  image: string
  createdAt: string
}

export type BlogBlockType = "heading" | "paragraph" | "bullets" | "numbers" | "image"

export type BlogBlock = {
  id: string
  type: BlogBlockType
  // Lists keep one item per line. Images use `image` and an optional caption in `text`.
  text: string
  image: string
}

export type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  label: string
  tags: string[]
  coverImage: string
  publishedAt: string
  status: "draft" | "published"
  blocks: BlogBlock[]
}

export type SiteContent = {
  settings: SiteSettings
  images: PageImages
  stats: Stat[]
  services: Service[]
  consultation: ConsultationCard
  clientLogos: ClientLogo[]
  reviews: Review[]
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
