import type { ServiceDetail, SiteContent, TitledItem } from "./types"

const genericSteps: TitledItem[] = [
  { id: "step-1", title: "Understand Your Goals", description: "I learn about your business, target audience and competitors." },
  { id: "step-2", title: "Set Up & Optimize", description: "I create the right campaign structure, keywords and ad targeting." },
  { id: "step-3", title: "Track & Improve", description: "I monitor performance, make data-driven changes and optimize regularly." },
  { id: "step-4", title: "Grow Your Business", description: "You get more traffic, more leads and higher sales." },
]

const genericFeatures: TitledItem[] = [
  { id: "feature-1", title: "Data-Driven Strategy", description: "Every decision is backed by real data and insights." },
  { id: "feature-2", title: "Transparent Reporting", description: "Clear reports, no confusion. Just results." },
  { id: "feature-3", title: "Flexible Budget", description: "Maximum your ROI with efficient ad spend." },
  { id: "feature-4", title: "Ongoing Support", description: "I'm always here to help and optimize your campaigns." },
]

// Detail page for services that do not have their own copy yet: the shared sections
// are filled in, the service-specific list is left empty (and hidden) until edited.
export function basicDetail(title: string, description: string): ServiceDetail {
  return {
    tagline: "MORE CLICKS · BETTER LEADS · HIGHER SALES",
    heroTitle: title,
    heroDescription: description,
    offeringsHeading: `What's included in *${title}*`,
    offeringsDescription: "",
    offerings: [],
    processImage: "/assets/aa9cc.png",
    processHeading: "My Simple *4-Step Process*",
    processDescription: "A clear and effective process to get your business on the right track.",
    steps: genericSteps,
    whyHeading: `Results-Driven *${title}*`,
    whyDescription:
      "I focus on what matters real results. With data-driven strategies and continuous optimization, I help your business grow sustainably.",
    features: genericFeatures,
  }
}

export const defaultContent: SiteContent = {
  settings: {
    ownerName: "Suchhanda Mondol",
    email: "adritamondol065@gmail.com",
    phone: "+8801947760296",
    address: "Mirpur 2, Dhaka, Bangladesh",
    socials: [
      { id: "facebook", label: "Facebook", url: "https://www.facebook.com/", icon: "/assets/4aa89.svg" },
      { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/", icon: "/assets/0684a.svg" },
      { id: "whatsapp", label: "WhatsApp", url: "https://wa.me/8801947760296", icon: "/assets/a4902.svg" },
    ],
    tracking: { gtmEnabled: false, gtmId: "", metaPixelEnabled: false, metaPixelId: "" },
  },
  images: {
    homeHero: "/assets/47d1e.png",
    aboutPortrait: "/assets/0be7f.png",
  },
  stats: [
    { id: "experience", value: 3, suffix: "+", label: "Years Experience" },
    { id: "projects", value: 500, suffix: "+", label: "Project Completed" },
    { id: "award", value: 2025, suffix: "", label: "Best Marketer Award" },
    { id: "service", value: 100, suffix: "+", label: "Dedicated Service" },
  ],
  services: [
    {
      id: "meta-ads",
      serial: 1,
      createdAt: "2026-01-01T00:00:00.000Z",
      active: true,
      showOnHome: true,
      slug: "meta-ads-management",
      title: "Meta Ads Management",
      summary: "Full-funnel Facebook & Instagram campaigns from audience research to creatives that convert.",
      icon: "/assets/5ba1b.svg",
      detail: basicDetail(
        "Meta Ads Management",
        "Full-funnel Facebook & Instagram campaigns from audience research to creatives that convert.",
      ),
    },
    {
      id: "google-ads",
      serial: 2,
      createdAt: "2026-01-02T00:00:00.000Z",
      active: true,
      showOnHome: true,
      slug: "google-ads-management",
      title: "Google Ads Management",
      summary: "Search, Shopping & Display campaigns managed for maximum ROI and measurable growth.",
      icon: "/assets/456b1.svg",
      detail: {
        tagline: "MORE CLICKS · BETTER LEADS · HIGHER SALES",
        heroTitle: "Google Ads That *Drives*\n*Real Business* Growth",
        heroDescription:
          "Get your business in front of the right audience at the right time. I create and manage high-performing Google Ads campaigns that bring quality traffic, generate leads and increase your revenue.",
        offeringsHeading: "Comprehensive *Google Ads Solutions*",
        offeringsDescription:
          "From search to video, I create campaigns that help you reach, engage and convert your ideal customers.",
        offerings: [
          {
            id: "search",
            icon: "/assets/2d3f7.svg",
            title: "Search Ads",
            description: "Capture high-intent customers when they're actively searching for your products or services.",
          },
          {
            id: "display",
            icon: "/assets/024f0.svg",
            title: "Display Ads",
            description: "Build brand awareness and reach potential customers across millions of websites and apps.",
          },
          {
            id: "shopping",
            icon: "/assets/de37e.svg",
            title: "Shopping Ads",
            description: "Showcase your products with eye-catching ads and drive more qualified sales.",
          },
          {
            id: "youtube",
            icon: "/assets/youtube-ads.svg",
            title: "YouTube Ads",
            description: "Engage your audience with compelling video ads and grow your brand story.",
          },
          {
            id: "pmax",
            icon: "/assets/63e41.svg",
            title: "Performance Max Campaign",
            description: "Get the best results across all Google channels with AI-powered campaigns.",
          },
        ],
        processImage: "/assets/aa9cc.png",
        processHeading: "My Simple *4-Step Process*",
        processDescription: "A clear and effective process to get your business on the right track with Google Ads.",
        steps: genericSteps,
        whyHeading: "Results-Driven *Google Ads Management*",
        whyDescription:
          "I focus on what matters real results. With data-driven strategies and continuous optimization, I help your business grow sustainably.",
        features: genericFeatures,
      },
    },
    {
      id: "tracking",
      serial: 3,
      createdAt: "2026-01-03T00:00:00.000Z",
      active: true,
      showOnHome: true,
      slug: "pixel-and-tag-manager",
      title: "Pixel & Tag Manager",
      summary: "Accurate tracking setup so every conversion is captured and every decision is data-backed.",
      icon: "/assets/c2944.svg",
      detail: basicDetail(
        "Pixel & Tag Manager",
        "Accurate tracking setup so every conversion is captured and every decision is data-backed.",
      ),
    },
    {
      id: "cro",
      serial: 4,
      createdAt: "2026-01-04T00:00:00.000Z",
      active: true,
      showOnHome: true,
      slug: "conversion-rate-optimization",
      title: "Conversion Rate Optimization",
      summary: "Turn more of your existing traffic into paying customers through strategic CRO.",
      icon: "/assets/6e620.png",
      detail: basicDetail(
        "Conversion Rate Optimization",
        "Turn more of your existing traffic into paying customers through strategic CRO.",
      ),
    },
    {
      id: "audit",
      serial: 5,
      createdAt: "2026-01-05T00:00:00.000Z",
      active: true,
      showOnHome: true,
      slug: "ads-audit-and-optimization",
      title: "Ads Audit & Optimization",
      summary:
        "A thorough review of your existing Meta or Google Ads account — uncovering wasted spend and finding fastest paths to better results.",
      icon: "/assets/b85eb.png",
      detail: basicDetail(
        "Ads Audit & Optimization",
        "A thorough review of your existing Meta or Google Ads account — uncovering wasted spend and finding fastest paths to better results.",
      ),
    },
  ],
  consultation: {
    title: "Free Consultation",
    description: "Not sure where to start? Let's talk about your goals and the best path forward.",
  },
  clientLogos: [
    { id: "nagad", name: "Nagad", image: "/assets/5c6b9.svg" },
    { id: "brac", name: "BRAC", image: "/assets/e6b17.svg" },
    { id: "google", name: "Google", image: "/assets/a7d41.svg" },
    { id: "bkash", name: "bKash", image: "/assets/54b41.svg" },
    { id: "facebook", name: "Facebook", image: "/assets/3aaae.svg" },
    { id: "whatsapp", name: "WhatsApp", image: "/assets/e9a13.svg" },
    { id: "youtube", name: "YouTube", image: "/assets/24766.svg" },
    { id: "tiktok", name: "TikTok", image: "/assets/e19b7.svg" },
    { id: "teams", name: "Microsoft Teams", image: "/assets/3efa1.svg" },
    { id: "twitter", name: "Twitter", image: "/assets/975d6.svg" },
  ],
  reviews: [
    { id: "review-1", name: "Client review", image: "/assets/bbc34.png" },
    { id: "review-2", name: "Client review", image: "/assets/bbc34.png" },
    { id: "review-3", name: "Client review", image: "/assets/bbc34.png" },
  ],
  work: [
    {
      id: "work-4",
      serial: 4,
      active: true,
      showOnHome: true,
      title: "Google Ads",
      description: "Search campaign results with lower cost per conversion.",
      image: "/assets/30d72.png",
      createdAt: "2026-01-04T00:00:00.000Z",
    },
    {
      id: "work-3",
      serial: 3,
      active: true,
      showOnHome: true,
      title: "Meta Ads",
      description: "Purchase campaign with steady daily budget and strong return.",
      image: "/assets/29777.png",
      createdAt: "2026-01-03T00:00:00.000Z",
    },
    {
      id: "work-2",
      serial: 2,
      active: true,
      showOnHome: false,
      title: "Google Ads",
      description: "Website purchases tracked end to end with clear cost per result.",
      image: "/assets/4492d.png",
      createdAt: "2026-01-02T00:00:00.000Z",
    },
    {
      id: "work-1",
      serial: 1,
      active: true,
      showOnHome: false,
      title: "Meta Ads",
      description: "Conversion campaign scaled with consistent ROAS.",
      image: "/assets/cd2eb.png",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  blog: [
    {
      id: "post-1",
      serial: 1,
      createdAt: "2026-10-20T00:00:00.000Z",
      slug: "why-your-saas-needs-a-design-system",
      title: "Why Your SaaS Needs a Design System",
      excerpt:
        "At some point in every growing SaaS product, someone opens a pull request and notices that there are now four different shades of blue being used for primary buttons.",
      label: "New Blog",
      tags: ["Google Ads", "Meta Ads"],
      coverImage: "/assets/bb30e.png",
      publishedAt: "2026-10-20",
      status: "published",
      blocks: [
        {
          id: "block-1",
          type: "paragraph",
          text: "Nobody made a decision to have four shades. It just happened, one component at a time, over 18 months of shipping.",
          image: "",
        },
        { id: "block-2", type: "heading", text: "Why it matters", image: "" },
        {
          id: "block-3",
          type: "bullets",
          text: "Consistent look across every page\nFaster design and development\nFewer one-off decisions",
          image: "",
        },
      ],
    },
  ],
  updatedAt: null,
}
