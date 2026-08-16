// lib/fallbackBlogs.ts
// Fallback seed dataset and utilities for Genesis Public Blogs UI

export interface Blog {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  author_avatar?: string | null
  category: string
  image_url: string | null
  featured: boolean
  views: number
  comments: number
  date: string
  published_at?: string
  created_at?: string
}

export const FALLBACK_BLOGS: Blog[] = [
  {
    id: 1,
    title: "A Founder's Guide to Pitching DeepTech & AI to Top VC Investors",
    slug: "guide-to-pitching-deeptech-ai-vc-investors",
    excerpt: "Discover how artificial intelligence, technical storytelling, and robust unit economics reshape investor pitches for early-stage founders seeking pre-seed and seed capital.",
    content: `
# A Founder's Guide to Pitching DeepTech & AI to Top VC Investors

Pitching a **DeepTech or AI startup** to institutional investors is equal parts technical demonstration, market sizing, and narrative framing. Unlike consumer apps where traction metrics dominate early conversations, DeepTech founders must prove both technological feasibility and commercial scalability.

## 1. Craft Your Core Narrative Arc

Start with the macro shift or fundamental technical breakthrough that enables your solution now. Clearly articulate why legacy technologies fail and why your proprietary approach provides a **10x performance or cost advantage**.

## 2. Demystify the Technical Moat

Avoid overly academic jargon. Translate complex neural architectures or hardware physics into tangible business value propositions for enterprise clients.

> "Great DeepTech founders don't just sell software; they communicate an undeniable vision of future industry infrastructure."

## 3. Unit Economics & Go-to-Market Milestones

Even at the pre-seed stage, showcase customer discovery interviews, pilot agreements, or letters of intent (LOIs) from enterprise innovation teams to validate market demand.
    `,
    author: "Varun Tiwari",
    author_avatar: "/Mr_Varun_Tiwari.jpg",
    category: "Entrepreneurs",
    image_url: "/1381732341471.png",
    featured: true,
    views: 7420,
    comments: 18,
    date: "Aug 01, 2026",
    published_at: "2026-08-01T10:00:00Z"
  },
  {
    id: 2,
    title: "Building High-Trust Culture in Early-Stage Remote Engineering Teams",
    slug: "building-high-trust-culture-remote-engineering-teams",
    excerpt: "Learn how co-founders leverage narrative building, asynchronous communication, and clear mission alignment to unite high-performing engineering teams.",
    content: `
# Building High-Trust Culture in Early-Stage Remote Engineering Teams

Organizational culture is not ping-pong tables or free snacks; it is the set of shared beliefs, standards, and operational behaviors that persist when leadership is not in the room.

When remote engineering and product teams share deep alignment on user problems, decision-making becomes decentralized, agile, and resilient.

## Key Strategies for Async Culture

- **Documentation First:** Replace lengthy status meetings with written specs and design docs.
- **Radical Transparency:** Share fundraising updates, customer feedback, and roadmaps openly across all teams.
- **Blameless Post-Mortems:** Treat technical incidents as learning opportunities to harden infrastructure.
    `,
    author: "Shobhit Goyal",
    author_avatar: "/Mr_Shobhit_Goyal.jpg",
    category: "Culture",
    image_url: "/4931732341324.jpg",
    featured: true,
    views: 5890,
    comments: 12,
    date: "Jul 28, 2026",
    published_at: "2026-07-28T14:30:00Z"
  },
  {
    id: 3,
    title: "Why the Average Age of Successful Tech Founders is 42, Not 22",
    slug: "average-age-successful-tech-founders",
    excerpt: "Unpacking global market data: why domain expertise, operational resilience, and industry networks consistently beat youthful exuberance in venture scaling.",
    content: `
# Why the Average Age of Successful Tech Founders is 42, Not 22

Popular media frequently celebrates 20-year-old university dropouts, but empirical studies from MIT and NBER reveal that the average age of a founder of a high-growth tech startup is **42**.

Deep domain knowledge, executive experience, and broader professional networks significantly improve product-market fit acquisition and enterprise sales cycles.

## The Power of Experience in DeepTech

Experienced founders are better equipped to navigate regulatory hurdles, recruit senior leadership talent, and manage capital allocation effectively through volatile market cycles.
    `,
    author: "Ajay Goyal",
    author_avatar: "/Mr_Ajay_Goyal.jpg",
    category: "Insights",
    image_url: "/3201732336658.jpg",
    featured: false,
    views: 6120,
    comments: 24,
    date: "Jul 20, 2026",
    published_at: "2026-07-20T09:00:00Z"
  },
  {
    id: 4,
    title: "Commercializing Academic Patents: Bridging University Labs and Market Traction",
    slug: "commercializing-academic-patents-university-labs",
    excerpt: "How QUIC and Genesis accelerate technology transfer from research laboratories into scalable commercial ventures with defensible intellectual property.",
    content: `
# Commercializing Academic Patents: Bridging University Labs and Market Traction

University research labs generate groundbreaking scientific innovations daily, yet converting patented technology into market-ready commercial products remains a major hurdle.

Through the **Genesis-QUIC incubation model**, student and faculty researchers receive dedicated IP counsel, business development mentoring, and prototype validation grants to turn patents into venture-backed startups.
    `,
    author: "Prof. Vivek Kumar",
    author_avatar: "/Prof_Vivek_Kumar.jpeg",
    category: "DeepTech",
    image_url: "/1561729364662.jpg",
    featured: false,
    views: 4210,
    comments: 9,
    date: "Jul 12, 2026",
    published_at: "2026-07-12T11:00:00Z"
  },
  {
    id: 5,
    title: "Navigating Term Sheets: Valuation, Dilution, and Board Control Demystified",
    slug: "navigating-term-sheets-valuation-dilution-board-control",
    excerpt: "A breakdown of essential term sheet clauses every founder must understand before signing seed and Series A investment agreements.",
    content: `
# Navigating Term Sheets: Valuation, Dilution, and Board Control Demystified

A term sheet is the blueprint for your venture's cap table and governance structure. Understanding liquidation preferences, anti-dilution provisions, and board vote thresholds is critical to maintaining founder alignment.

## Key Clauses to Review

- **Liquidation Preference:** Prefer 1x non-participating preferred stock over participating terms.
- **Option Pool Shuffle:** Ensure employee option pools are calculated on pre-money or post-money basis transparently.
- **Vesting Schedules:** Standard 4-year vesting with a 1-year cliff protects founder equity integrity.
    `,
    author: "Varun Tiwari",
    author_avatar: "/Mr_Varun_Tiwari.jpg",
    category: "Venture Capital",
    image_url: "/gen-ab.jpg",
    featured: false,
    views: 8930,
    comments: 31,
    date: "Jul 05, 2026",
    published_at: "2026-07-05T16:00:00Z"
  },
  {
    id: 6,
    title: "The Green Tech Revolution: Sustainable Materials Disrupting Supply Chains",
    slug: "green-tech-revolution-sustainable-materials-supply-chains",
    excerpt: "Exploring bio-degradable polymers, agricultural byproduct utilization, and circular economy models scaling out of incubator labs.",
    content: `
# The Green Tech Revolution: Sustainable Materials Disrupting Supply Chains

Industrial manufacturing and packaging account for over 300 million tons of plastic waste annually. Modern CleanTech ventures are using bio-composite materials derived from crop residue to build high-strength, fully compostable alternatives.

Early enterprise adoption across logistics and retail sectors demonstrates strong commercial viability and regulatory tailwinds.
    `,
    author: "Raksha Thammaiah",
    author_avatar: "/raksha-thammaiah.jpg",
    category: "Sustainability",
    image_url: "/startup-teams.webp",
    featured: false,
    views: 3750,
    comments: 14,
    date: "Jun 25, 2026",
    published_at: "2026-06-25T10:00:00Z"
  },
  {
    id: 7,
    title: "Generative AI in Industrial Manufacturing: Real-World Use Cases",
    slug: "generative-ai-industrial-manufacturing-use-cases",
    excerpt: "How computer vision, predictive maintenance, and autonomous robotics are revolutionizing factory floors across South Asia.",
    content: `
# Generative AI in Industrial Manufacturing: Real-World Use Cases

Factory automation is evolving from fixed robotic arms to adaptive computer vision systems powered by real-time neural networks. Manufacturers implementing predictive maintenance models reduce unplanned downtime by up to 45%.
    `,
    author: "Prof. Vivek Kumar",
    author_avatar: "/Prof_Vivek_Kumar.jpeg",
    category: "Innovation",
    image_url: "/4931732341324.jpg",
    featured: false,
    views: 5100,
    comments: 16,
    date: "Jun 18, 2026",
    published_at: "2026-06-18T13:00:00Z"
  },
  {
    id: 8,
    title: "From Bootstrapped Prototype to $1M ARR: The Genesis Incubation Blueprint",
    slug: "from-bootstrapped-prototype-to-1m-arr",
    excerpt: "Case studies of three cohort startups that scaled from university dorm prototypes to sustainable annual recurring revenue.",
    content: `
# From Bootstrapped Prototype to $1M ARR: The Genesis Incubation Blueprint

Scaling a startup from zero to $1M in annual recurring revenue requires disciplined capital management, relentless customer acquisition, and structured mentor guidance. Read how three Genesis alumni startups navigated early challenges.
    `,
    author: "Shobhit Goyal",
    author_avatar: "/Mr_Shobhit_Goyal.jpg",
    category: "Entrepreneurs",
    image_url: "/1381732341471.png",
    featured: false,
    views: 9450,
    comments: 42,
    date: "Jun 02, 2026",
    published_at: "2026-06-02T15:00:00Z"
  }
]

/**
 * Calculates estimated reading time based on content word count
 */
export function calculateReadingTime(content?: string): string {
  if (!content) return "3 min read"
  const textWithoutHtml = content.replace(/<[^>]*>/g, " ")
  const wordCount = textWithoutHtml.trim().split(/\s+/).filter(w => w.length > 0).length
  const minutes = Math.max(1, Math.ceil(wordCount / 200))
  return `${minutes} min read`
}

/**
 * Retrieves a blog post by slug or ID from FALLBACK_BLOGS
 */
export function getBlogBySlug(slug: string): Blog | undefined {
  if (!slug) return undefined
  const normalizedSlug = slug.trim().toLowerCase()
  return FALLBACK_BLOGS.find(
    b => b.slug.toLowerCase() === normalizedSlug || b.id.toString() === normalizedSlug
  )
}

/**
 * Formats date string safely
 */
export function formatBlogDate(dateStr?: string): string {
  if (!dateStr) return "Aug 2026"
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  } catch {
    return dateStr
  }
}

/**
 * Parses markdown to HTML if content is plain markdown, or returns HTML as-is
 */
export function renderMarkdownOrHtml(content: string): string {
  if (!content) return ""
  
  // If content contains standard HTML tags like <p>, <h3>, <div>, use it directly
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content
  }

  // Convert basic Markdown to HTML
  let html = content

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-white mt-8 mb-4">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mt-10 mb-5">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold text-white mt-10 mb-6">$1</h1>')

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-[#6CBD45] bg-[#141824] p-5 my-6 rounded-r-xl italic text-slate-300">$1</blockquote>')

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-200">$1</em>')

  // Unordered lists
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc text-slate-300 my-1">$1</li>')
  html = html.replace(/^\* (.*$)/gim, '<li class="ml-6 list-disc text-slate-300 my-1">$1</li>')

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-[#6CBD45] underline hover:text-emerald-400" target="_blank" rel="noopener noreferrer">$1</a>')

  // Paragraphs
  const paragraphs = html.split(/\n\s*\n/)
  html = paragraphs
    .map(p => {
      const trimmed = p.trim()
      if (trimmed.startsWith('<h') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<li')) {
        return trimmed
      }
      return `<p class="text-slate-300 leading-relaxed mb-5">${trimmed}</p>`
    })
    .join('')

  return html
}
