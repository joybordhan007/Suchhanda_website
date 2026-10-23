// Every fixed piece of text on the website (buttons, section headings, labels, footer…),
// with the text the design ships with. The dashboard's "Site Text" section saves changes
// in content.texts; anything not changed there uses the default below.
//
// Texts accept *stars* around words to show them in gold and keep line breaks.
// "{name}" is replaced with the owner name from Site Settings, "{year}" with the year.
// `fontOnly` entries style text that is written elsewhere (e.g. achievement numbers).

export type TextDef = { label: string; text: string; fontOnly?: boolean }

export const TEXT_GROUPS = {
  nav: {
    label: "Menu",
    items: {
      home: { label: "Home", text: "Home" },
      service: { label: "Service", text: "Service" },
      work: { label: "Work", text: "Work" },
      about: { label: "About Me", text: "About Me" },
      blog: { label: "Blog", text: "Blog" },
      reviews: { label: "Reviews", text: "Reviews" },
      contact: { label: "Contact button", text: "Contact Me" },
    },
  },
  home: {
    label: "Home page",
    items: {
      tagline: { label: "Small line above the title", text: "Meta Ads · Google Ads · Specialist" },
      exploreButton: { label: "First button", text: "Explore Me" },
      contactButton: { label: "Second button", text: "Contact Me" },
      servicesHeading: { label: "Services heading", text: "End-to-End Digital *Marketing Solutions*" },
      serviceExplore: { label: "Service card link", text: "Explore" },
      consultationButton: { label: "Free Consultation card button", text: "Contact Me" },
      workHeading: { label: "Work heading", text: "Real Result. *Real Impact*" },
      workButton: { label: "Work button", text: "View All" },
    },
  },
  sections: {
    label: "Shared sections",
    items: {
      achievementNumber: { label: "Achievement numbers", text: "", fontOnly: true },
      achievementLabel: { label: "Achievement labels", text: "", fontOnly: true },
      logosHeading: { label: "Client logos heading", text: "Trusted by *Businesses of all sizes*" },
      reviewsHeading: { label: "Reviews heading", text: "Trusted by *Businesses Proven by Results*" },
      reviewsButton: { label: "Reviews button", text: "View All" },
      reviewsEmpty: { label: "Reviews, when there are none", text: "No reviews yet. Worked with me? Be the first to share your experience." },
      reviewsEmptyButton: { label: "Reviews button, when there are none", text: "Write a Review" },
      reviewText: { label: "Review card text", text: "", fontOnly: true },
      reviewName: { label: "Review card name", text: "", fontOnly: true },
      ctaTitle: { label: "Dark banner title", text: "Ready to Elevate *Your Brand?*" },
      ctaText: { label: "Dark banner text", text: "Let's create something extraordinary together. Schedule a consultation\nto discuss your vision." },
      ctaButton: { label: "Dark banner button", text: "Let's work Together" },
    },
  },
  work: {
    label: "Work page",
    items: {
      aboutButton: { label: "First button", text: "About Me" },
      contactButton: { label: "Second button", text: "Contact Me" },
      empty: { label: "When there is no work", text: "Case studies are coming soon." },
    },
  },
  about: {
    label: "About Me page",
    items: {
      workButton: { label: "First button", text: "View Work" },
      contactButton: { label: "Second button", text: "Contact Me" },
      aboutText: { label: "About text", text: "", fontOnly: true },
      featuredHeading: { label: "Featured In heading", text: "Featured In" },
      certificationsHeading: { label: "Certifications heading", text: "Certification & Award" },
    },
  },
  service: {
    label: "Service pages",
    items: {
      offeringsEyebrow: { label: "Small label above “what's included”", text: "Our Services" },
      processEyebrow: { label: "Small label above the steps", text: "How It Works" },
      whyEyebrow: { label: "Small label in the dark box", text: "Why Choose Me" },
      button: { label: "Dark box button", text: "Let's work Together" },
    },
  },
  blog: {
    label: "Blog",
    items: {
      readMore: { label: "Blog card link", text: "Read Now" },
      empty: { label: "When there are no posts", text: "New articles are coming soon." },
    },
  },
  reviews: {
    label: "Reviews page",
    items: {
      addButton: { label: "Add review button", text: "Add Review" },
      empty: { label: "When there are no reviews", text: "No reviews yet. Be the first to share your experience." },
      formTitle: { label: "Popup title", text: "Share your *experience*" },
      formText: { label: "Popup text", text: "Your review appears on the website after it is approved." },
      formButton: { label: "Popup send button", text: "Submit review" },
      thanksTitle: { label: "Thank-you title", text: "Thank you!" },
      thanksText: { label: "Thank-you text", text: "Your review has been sent. It will be shown on the website as soon as it is approved." },
    },
  },
  contact: {
    label: "Contact page",
    items: {
      infoHeading: { label: "Contact box heading", text: "Contact Information" },
      infoText: {
        label: "Contact box text",
        text: "Find all the ways to reach us, including email, phone, and our office address, so you can get the support and answers you need quickly and easily.",
      },
      details: { label: "Phone, email and address", text: "", fontOnly: true },
      firstName: { label: "First name label", text: "First Name" },
      lastName: { label: "Last name label", text: "Last Name" },
      email: { label: "Email label", text: "Email" },
      phone: { label: "Phone label", text: "Phone Number" },
      company: { label: "Company label", text: "Company Name" },
      time: { label: "Contact time label", text: "Preferred Contact Time" },
      message: { label: "Message label", text: "Message" },
      sendButton: { label: "Send button", text: "Send Inquiry" },
      sent: { label: "After sending", text: "Your inquiry has been sent. Thank you!" },
    },
  },
  footer: {
    label: "Footer",
    items: {
      about: {
        label: "Text under the logo",
        text: "I’m {name} — helping brands scale faster with high-converting ads, precise tracking, and performance-driven strategy that delivers real, lasting results.",
      },
      quickLinks: { label: "First column heading", text: "Quick Links" },
      support: { label: "Second column heading", text: "Support" },
      contactInfo: { label: "Third column heading", text: "Contact Info" },
      contactUs: { label: "Contact link", text: "Contact Us" },
      privacy: { label: "Privacy link", text: "Privacy Policy" },
      terms: { label: "Terms link", text: "Terms of Service" },
      links: { label: "Footer links and contact details", text: "", fontOnly: true },
      copyright: { label: "Copyright line", text: "Copyright © {year} SUCHHANDA MONDOL" },
    },
  },
  // Page text: "# " starts the main heading, "## " a section heading, and an empty line a
  // new paragraph. "{email}" becomes a link to the email in Site Settings.
  legal: {
    label: "Privacy & Terms pages",
    items: {
      privacyTitle: { label: "Privacy Policy title", text: "Privacy Policy" },
      privacySubtitle: { label: "Privacy Policy subtitle", text: "How personal information is handled when you use this website." },
      privacyUpdated: { label: "Privacy Policy date line", text: "Last updated: October 20, 2026" },
      privacyBody: {
        label: "Privacy Policy text",
        text: "# Information and privacy\n\nThis website is a portfolio and contact point for {name}. Information you choose to send through the contact form or by email is used to respond to your inquiry and discuss requested services.\n\n## Information collected\n\nMessages may include your name, email address, phone number, company details, and any project information you provide. The website may also receive standard technical information from your browser or hosting provider, such as device and request data.\n\n## Use and sharing\n\nPersonal information is not sold. It may be handled by service providers needed to host the site or deliver communications, or disclosed when required by law. Information is kept only as long as reasonably needed to respond and maintain business records.\n\n## Your choices and contact\n\nYou may request access to, correction of, or deletion of information you have provided, subject to applicable requirements. Contact {email} with privacy questions. This policy may be updated as the website or applicable requirements change.",
      },
      termsTitle: { label: "Terms of Service title", text: "Terms of Service" },
      termsSubtitle: { label: "Terms of Service subtitle", text: "Terms for accessing and using this portfolio website." },
      termsUpdated: { label: "Terms of Service date line", text: "Last updated: October 20, 2026" },
      termsBody: {
        label: "Terms of Service text",
        text: "# Using this website\n\nThis website provides general information about digital marketing services, work examples, and ways to get in touch. By using it, you agree to use the site lawfully and not interfere with its operation.\n\n## Information and services\n\nWebsite content is provided for general information. A service relationship, scope, fees, timelines, and deliverables are confirmed separately in writing. Results shown in portfolio examples are specific to those projects and do not guarantee similar results.\n\n## Content and external links\n\nUnless otherwise stated, the website design and original written content belong to their respective owners. Third-party names, materials, or links remain the property and responsibility of their owners. External sites are provided for convenience and are not controlled by this website.\n\n## Availability and changes\n\nThe website is provided on an “as available” basis. Content and these terms may be updated from time to time. Questions about these terms can be sent to {email}.",
      },
      headings: { label: "Headings in the page text", text: "", fontOnly: true },
      paragraphs: { label: "Paragraphs in the page text", text: "", fontOnly: true },
    },
  },
} as const satisfies Record<string, { label: string; items: Record<string, TextDef> }>

type Groups = typeof TEXT_GROUPS
export type TextKey = { [G in keyof Groups]: `${G & string}.${keyof Groups[G]["items"] & string}` }[keyof Groups]

// Saved changes: only what differs from the defaults. font "" keeps the design's font.
export type TextOverride = { text?: string; font?: string }
export type SiteTexts = Partial<Record<TextKey, TextOverride>>

export function textDef(key: TextKey): TextDef {
  const [group, item] = key.split(".") as [keyof Groups, string]
  return (TEXT_GROUPS[group].items as Record<string, TextDef>)[item]
}
