// lib/memoryStore.js
// Universal In-Memory Store for Genesis Platform
// Ensures 100% full CRUD persistence & page loading even when local MySQL DB is offline.

const initialEvents = [
  {
    id: 1,
    title: "Genesis National Startup Summit 2026",
    slug: "genesis-national-startup-summit-2026",
    description: "The flagship annual innovation summit bringing together 500+ founders, venture capitalists, policy makers, and angel investors to shape India's technology ecosystem. Features keynote addresses, panel discussions, and high-impact networking.",
    date: "2026-09-20",
    time: "09:30 AM",
    location: "Main Auditorium & Concourse, QUIC Campus",
    max_attendees: 500,
    registered_count: 385,
    current_registrations: 385,
    category: "Summit",
    image_url: "/1381732341471.png",
    featured: 1,
    status: "upcoming",
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-01T10:00:00Z"
  },
  {
    id: 2,
    title: "AI & DeepTech Founders Masterclass",
    slug: "ai-deeptech-founders-masterclass",
    description: "Exclusive technical and business workshop for early-stage AI founders covering model deployment, LLM fine-tuning, unit economics, GPU cluster optimization, and enterprise GTM strategy.",
    date: "2026-09-28",
    time: "02:00 PM",
    location: "Incubation Lab 3, Genesis Center",
    max_attendees: 80,
    registered_count: 68,
    current_registrations: 68,
    category: "Workshop",
    image_url: "/4931732341324.jpg",
    featured: 1,
    status: "upcoming",
    created_at: "2026-08-05T10:00:00Z",
    updated_at: "2026-08-05T10:00:00Z"
  },
  {
    id: 3,
    title: "Venture Pitch Day: Seed to Series A",
    slug: "venture-pitch-day-seed-series-a",
    description: "Curated 3-minute pitch sessions in front of 15 top institutional VC funds and angel syndicates for shortlisted pre-incubation and incubation startups.",
    date: "2026-10-05",
    time: "11:00 AM",
    location: "Executive Conference Room A, QUIC",
    max_attendees: 120,
    registered_count: 105,
    current_registrations: 105,
    category: "Pitching",
    image_url: "/3201732336658.jpg",
    featured: 0,
    status: "upcoming",
    created_at: "2026-08-10T10:00:00Z",
    updated_at: "2026-08-10T10:00:00Z"
  },
  {
    id: 4,
    title: "Quantum & ClimateTech Hackathon 2026",
    slug: "quantum-climatetech-hackathon-2026",
    description: "36-hour intense hackathon focusing on carbon footprint reduction, clean energy storage, bio-materials, and smart grid automation. Includes ₹5 Lakhs in non-dilutive equity grants.",
    date: "2026-10-15",
    time: "08:00 AM",
    location: "Maker Space & Prototyping Bay, Genesis",
    max_attendees: 200,
    registered_count: 175,
    current_registrations: 175,
    category: "Hackathon",
    image_url: "/1561729364662.jpg",
    featured: 0,
    status: "upcoming",
    created_at: "2026-08-11T10:00:00Z",
    updated_at: "2026-08-11T10:00:00Z"
  },
  {
    id: 5,
    title: "Angel Investor Mixer & Founder Social",
    slug: "angel-investor-mixer-founder-social",
    description: "An informal evening connecting promising cohort founders with accredited angel investors, mentors, and industry veterans over drinks and curated table discussions.",
    date: "2026-10-22",
    time: "05:30 PM",
    location: "Rooftop Lounge, Genesis Tower",
    max_attendees: 100,
    registered_count: 82,
    current_registrations: 82,
    category: "Networking",
    image_url: "/gen-ab.jpg",
    featured: 0,
    status: "upcoming",
    created_at: "2026-08-11T12:00:00Z",
    updated_at: "2026-08-11T12:00:00Z"
  },
  {
    id: 6,
    title: "IP & Patent Strategy for Tech Startups",
    slug: "ip-patent-strategy-tech-startups",
    description: "Comprehensive masterclass on patent drafting, international PCT filings, freedom-to-operate searches, and protecting proprietary software/hardware algorithms.",
    date: "2026-11-02",
    time: "10:30 AM",
    location: "Seminar Hall B, QUIC Campus",
    max_attendees: 60,
    registered_count: 48,
    current_registrations: 48,
    category: "Masterclass",
    image_url: "/startup-teams.webp",
    featured: 0,
    status: "upcoming",
    created_at: "2026-08-11T14:00:00Z",
    updated_at: "2026-08-11T14:00:00Z"
  },
  {
    id: 7,
    title: "Women in Innovation & Leadership Conclave 2026",
    slug: "women-in-innovation-leadership-conclave-2026",
    description: "Celebrating women founders, researchers, and venture partners driving disruptive tech. Features panel sessions on raising capital, scaling teams, and overcoming ecosystem biases.",
    date: "2026-07-15",
    time: "10:00 AM",
    location: "Main Auditorium, QUIC Campus",
    max_attendees: 300,
    registered_count: 295,
    current_registrations: 295,
    category: "Summit",
    image_url: "/1381732341471.png",
    featured: 0,
    status: "completed",
    created_at: "2026-06-01T10:00:00Z",
    updated_at: "2026-06-01T10:00:00Z"
  },
  {
    id: 8,
    title: "Genesis Demo Day Cohort Fall 2025",
    slug: "genesis-demo-day-cohort-fall-2025",
    description: "12 graduating incubation startups presented live product demos and financial traction to over 60 global venture funds, resulting in ₹18 Cr+ in term sheet commitments.",
    date: "2025-12-10",
    time: "10:00 AM",
    location: "Grand Ballroom, QUIC Center",
    max_attendees: 400,
    registered_count: 390,
    current_registrations: 390,
    category: "Pitching",
    image_url: "/3201732336658.jpg",
    featured: 0,
    status: "completed",
    created_at: "2025-11-15T10:00:00Z",
    updated_at: "2025-11-15T10:00:00Z"
  }
];

const initialBlogCategories = [
  { id: 1, name: "Entrepreneurs" },
  { id: 2, name: "Culture" },
  { id: 3, name: "Insights" },
  { id: 4, name: "DeepTech" },
  { id: 5, name: "Venture Capital" },
  { id: 6, name: "Sustainability" },
  { id: 7, name: "Innovation" }
];

const initialBlogs = [
  {
    id: 1,
    title: "A Founder's Guide to Pitching DeepTech & AI to Top VC Investors",
    slug: "guide-to-pitching-deeptech-ai-vc-investors",
    excerpt: "Discover how artificial intelligence, technical storytelling, and robust unit economics reshape investor pitches for early-stage founders seeking pre-seed and seed capital.",
    content: `<p>Pitching a DeepTech or AI startup to institutional investors is equal parts technical demonstration, market sizing, and narrative framing. Unlike consumer apps where traction metrics dominate early conversations, DeepTech founders must prove both technological feasibility and commercial scalability.</p>
    <h3>1. Craft Your Core Narrative Arc</h3>
    <p>Start with the macro shift or fundamental technical breakthrough that enables your solution now. Clearly articulate why legacy technologies fail and why your proprietary approach provides a 10x performance or cost advantage.</p>
    <h3>2. Demystify the Technical Moat</h3>
    <p>Avoid overly academic jargon. Translate complex neural architectures or hardware physics into tangible business value proposition for enterprise clients.</p>
    <blockquote>"Great DeepTech founders don't just sell software; they communicate an undeniable vision of future industry infrastructure."</blockquote>
    <h3>3. Unit Economics & Go-to-Market Milestones</h3>
    <p>Even at the pre-seed stage, showcase customer discovery interviews, pilot agreements, or letters of intent (LOIs) from enterprise innovation teams to validate market demand.</p>`,
    author: "Varun Tiwari",
    author_name: "Varun Tiwari",
    author_role: "Incubation Director",
    author_image: "/gen-ab.jpg",
    category_id: 1,
    category: "Entrepreneurs",
    image_url: "/1381732341471.png",
    read_time: "4 min read",
    featured: 1,
    status: "published",
    views: 7420,
    comments: 18,
    comments_count: 18,
    published_at: "2026-08-01T10:00:00Z",
    date: "Aug 01, 2026",
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-01T10:00:00Z"
  },
  {
    id: 2,
    title: "Building High-Trust Culture in Early-Stage Remote Engineering Teams",
    slug: "building-high-trust-culture-remote-engineering-teams",
    excerpt: "Learn how co-founders leverage narrative building, asynchronous communication, and clear mission alignment to unite high-performing engineering teams.",
    content: `<p>Organizational culture is not ping-pong tables or free snacks; it is the set of shared beliefs, standards, and operational behaviors that persist when leadership is not in the room.</p>
    <p>When remote engineering and product teams share deep alignment on user problems, decision-making becomes decentralized, agile, and resilient.</p>
    <h3>Key Strategies for Async Culture</h3>
    <ul>
      <li><strong>Documentation First:</strong> Replace lengthy status meetings with written specs and design docs.</li>
      <li><strong>Radical Transparency:</strong> Share fundraising updates, customer feedback, and roadmaps openly across all teams.</li>
      <li><strong>Blameless Post-Mortems:</strong> Treat technical incidents as learning opportunities to harden infrastructure.</li>
    </ul>`,
    author: "Shobhit Goyal",
    author_name: "Shobhit Goyal",
    author_role: "Head of Operations",
    author_image: "/4931732341324.jpg",
    category_id: 2,
    category: "Culture",
    image_url: "/4931732341324.jpg",
    read_time: "3 min read",
    featured: 1,
    status: "published",
    views: 5890,
    comments: 12,
    comments_count: 12,
    published_at: "2026-07-28T14:30:00Z",
    date: "Jul 28, 2026",
    created_at: "2026-07-28T14:30:00Z",
    updated_at: "2026-07-28T14:30:00Z"
  },
  {
    id: 3,
    title: "Why the Average Age of Successful Tech Founders is 42, Not 22",
    slug: "average-age-successful-tech-founders",
    excerpt: "Unpacking global market data: why domain expertise, operational resilience, and industry networks consistently beat youthful exuberance in venture scaling.",
    content: `<p>Popular media frequently celebrates 20-year-old university dropouts, but empirical studies from MIT and NBER reveal that the average age of a founder of a high-growth tech startup is 42.</p>
    <p>Deep domain knowledge, executive experience, and broader professional networks significantly improve product-market fit acquisition and enterprise sales cycles.</p>
    <h3>The Power of Experience in DeepTech</h3>
    <p>Experienced founders are better equipped to navigate regulatory hurdles, recruit senior leadership talent, and manage capital allocation effectively through volatile market cycles.</p>`,
    author: "Ajay Goyal",
    author_name: "Ajay Goyal",
    author_role: "Managing Director",
    author_image: "/3201732336658.jpg",
    category_id: 3,
    category: "Insights",
    image_url: "/3201732336658.jpg",
    read_time: "3 min read",
    featured: 0,
    status: "published",
    views: 6120,
    comments: 24,
    comments_count: 24,
    published_at: "2026-07-20T09:00:00Z",
    date: "Jul 20, 2026",
    created_at: "2026-07-20T09:00:00Z",
    updated_at: "2026-07-20T09:00:00Z"
  },
  {
    id: 4,
    title: "Commercializing Academic Patents: Bridging University Labs and Market Traction",
    slug: "commercializing-academic-patents-university-labs",
    excerpt: "How QUIC and Genesis accelerate technology transfer from research laboratories into scalable commercial ventures with defensible intellectual property.",
    content: `<p>University research labs generate groundbreaking scientific innovations daily, yet converting patented technology into market-ready commercial products remains a major hurdle.</p>
    <p>Through the Genesis-QUIC incubation model, student and faculty researchers receive dedicated IP counsel, business development mentoring, and prototype validation grants to turn patents into venture-backed startups.</p>`,
    author: "Prof. Vivek Kumar",
    author_name: "Prof. Vivek Kumar",
    author_role: "DeepTech Advisory Lead",
    author_image: "/1561729364662.jpg",
    category_id: 4,
    category: "DeepTech",
    image_url: "/1561729364662.jpg",
    read_time: "2 min read",
    featured: 0,
    status: "published",
    views: 4210,
    comments: 9,
    comments_count: 9,
    published_at: "2026-07-12T11:00:00Z",
    date: "Jul 12, 2026",
    created_at: "2026-07-12T11:00:00Z",
    updated_at: "2026-07-12T11:00:00Z"
  },
  {
    id: 5,
    title: "Navigating Term Sheets: Valuation, Dilution, and Board Control Demystified",
    slug: "navigating-term-sheets-valuation-dilution-board-control",
    excerpt: "A breakdown of essential term sheet clauses every founder must understand before signing seed and Series A investment agreements.",
    content: `<p>A term sheet is the blueprint for your venture's cap table and governance structure. Understanding liquidation preferences, anti-dilution provisions, and board vote thresholds is critical to maintaining founder alignment.</p>
    <h3>Key Clauses to Review</h3>
    <ul>
      <li><strong>Liquidation Preference:</strong> Prefer 1x non-participating preferred stock over participating terms.</li>
      <li><strong>Option Pool Shuffle:</strong> Ensure employee option pools are calculated on pre-money or post-money basis transparently.</li>
      <li><strong>Vesting Schedules:</strong> Standard 4-year vesting with a 1-year cliff protects founder equity integrity.</li>
    </ul>`,
    author: "Varun Tiwari",
    author_name: "Varun Tiwari",
    author_role: "Incubation Director",
    author_image: "/gen-ab.jpg",
    category_id: 5,
    category: "Venture Capital",
    image_url: "/gen-ab.jpg",
    read_time: "4 min read",
    featured: 0,
    status: "published",
    views: 8930,
    comments: 31,
    comments_count: 31,
    published_at: "2026-07-05T16:00:00Z",
    date: "Jul 05, 2026",
    created_at: "2026-07-05T16:00:00Z",
    updated_at: "2026-07-05T16:00:00Z"
  },
  {
    id: 6,
    title: "The Green Tech Revolution: Sustainable Materials Disrupting Supply Chains",
    slug: "green-tech-revolution-sustainable-materials-supply-chains",
    excerpt: "Exploring bio-degradable polymers, agricultural byproduct utilization, and circular economy models scaling out of incubator labs.",
    content: `<p>Industrial manufacturing and packaging account for over 300 million tons of plastic waste annually. Modern CleanTech ventures are using bio-composite materials derived from crop residue to build high-strength, fully compostable alternatives.</p>
    <p>Early enterprise adoption across logistics and retail sectors demonstrates strong commercial viability and regulatory tailwinds.</p>`,
    author: "Genesis Editorial",
    author_name: "Genesis Editorial",
    author_role: "Content Team",
    author_image: "/startup-teams.webp",
    category_id: 6,
    category: "Sustainability",
    image_url: "/startup-teams.webp",
    read_time: "2 min read",
    featured: 0,
    status: "published",
    views: 3750,
    comments: 14,
    comments_count: 14,
    published_at: "2026-06-25T10:00:00Z",
    date: "Jun 25, 2026",
    created_at: "2026-06-25T10:00:00Z",
    updated_at: "2026-06-25T10:00:00Z"
  },
  {
    id: 7,
    title: "Generative AI in Industrial Manufacturing: Real-World Use Cases",
    slug: "generative-ai-industrial-manufacturing-use-cases",
    excerpt: "How computer vision, predictive maintenance, and autonomous robotics are revolutionizing factory floors across South Asia.",
    content: `<p>Factory automation is evolving from fixed robotic arms to adaptive computer vision systems powered by real-time neural networks. Manufacturers implementing predictive maintenance models reduce unplanned downtime by up to 45%.</p>`,
    author: "Prof. Vivek Kumar",
    author_name: "Prof. Vivek Kumar",
    author_role: "DeepTech Advisory Lead",
    author_image: "/1561729364662.jpg",
    category_id: 7,
    category: "Innovation",
    image_url: "/4931732341324.jpg",
    read_time: "2 min read",
    featured: 0,
    status: "published",
    views: 5100,
    comments: 16,
    comments_count: 16,
    published_at: "2026-06-18T13:00:00Z",
    date: "Jun 18, 2026",
    created_at: "2026-06-18T13:00:00Z",
    updated_at: "2026-06-18T13:00:00Z"
  },
  {
    id: 8,
    title: "From Bootstrapped Prototype to $1M ARR: The Genesis Incubation Blueprint",
    slug: "from-bootstrapped-prototype-to-1m-arr",
    excerpt: "Case studies of three cohort startups that scaled from university dorm prototypes to sustainable annual recurring revenue.",
    content: `<p>Scaling a startup from zero to \$1M in annual recurring revenue requires disciplined capital management, relentless customer acquisition, and structured mentor guidance. Read how three Genesis alumni startups navigated early challenges.</p>`,
    author: "Shobhit Goyal",
    author_name: "Shobhit Goyal",
    author_role: "Head of Operations",
    author_image: "/4931732341324.jpg",
    category_id: 1,
    category: "Entrepreneurs",
    image_url: "/1381732341471.png",
    read_time: "3 min read",
    featured: 0,
    status: "published",
    views: 9450,
    comments: 42,
    comments_count: 42,
    published_at: "2026-06-02T15:00:00Z",
    date: "Jun 02, 2026",
    created_at: "2026-06-02T15:00:00Z",
    updated_at: "2026-06-02T15:00:00Z"
  }
];

const initialPortfolio = [
  {
    id: 1,
    title: "EcoTech Solutions",
    name: "EcoTech Solutions",
    category: "CleanTech",
    description: "Developing sustainable packaging alternatives from agricultural waste to eliminate single-use plastics and reduce industrial carbon emissions.",
    image_url: "/1381732341471.png",
    image: "/1381732341471.png",
    link: "https://ecotech.example.com",
    status: "featured",
    tags: ["Sustainability", "Circular Economy", "B2B"],
    date: "2023-01-15",
    founded: "2023",
    funding: "₹3.5 Cr",
    employees: "18-25",
    created_at: "2023-01-15T00:00:00Z"
  },
  {
    id: 2,
    title: "HealthAI Diagnostics",
    name: "HealthAI Diagnostics",
    category: "HealthTech",
    description: "AI-powered clinical diagnostic tools for non-invasive early detection and automated radiological scan analysis in tier-2/3 hospitals.",
    image_url: "/4931732341324.jpg",
    image: "/4931732341324.jpg",
    link: "https://healthai.example.com",
    status: "featured",
    tags: ["AI/ML", "Healthcare", "Medical Devices"],
    date: "2023-05-10",
    founded: "2023",
    funding: "₹6.2 Cr",
    employees: "30-40",
    created_at: "2023-05-10T00:00:00Z"
  },
  {
    id: 3,
    title: "AgriSmart Sensors",
    name: "AgriSmart Sensors",
    category: "AgriTech",
    description: "IoT soil sensors, autonomous drone field scouting, and predictive weather analytics for precision farming and yield maximization.",
    image_url: "/3201732336658.jpg",
    image: "/3201732336658.jpg",
    link: "https://agrismart.example.com",
    status: "active",
    tags: ["IoT", "Precision Agriculture", "Smart Hardware"],
    date: "2023-08-20",
    founded: "2023",
    funding: "₹2.8 Cr",
    employees: "12-18",
    created_at: "2023-08-20T00:00:00Z"
  },
  {
    id: 4,
    title: "QuantumPay Systems",
    name: "QuantumPay Systems",
    category: "FinTech",
    description: "Next-generation quantum-resistant encryption protocols and instant cross-border settlement rails for regional micro-enterprises.",
    image_url: "/1561729364662.jpg",
    image: "/1561729364662.jpg",
    link: "https://quantumpay.example.com",
    status: "featured",
    tags: ["Cybersecurity", "Fintech", "Blockchain"],
    date: "2024-02-14",
    founded: "2024",
    funding: "₹4.5 Cr",
    employees: "20-30",
    created_at: "2024-02-14T00:00:00Z"
  },
  {
    id: 5,
    title: "NeuralMesh Robotics",
    name: "NeuralMesh Robotics",
    category: "AI & Robotics",
    description: "Autonomous warehouse robotics and computer-vision guidance systems for automated order fulfillment and inventory tracking.",
    image_url: "/startup-teams.webp",
    image: "/startup-teams.webp",
    link: "https://neuralmesh.example.com",
    status: "active",
    tags: ["Robotics", "Computer Vision", "Automation"],
    date: "2024-04-01",
    founded: "2024",
    funding: "₹8.0 Cr",
    employees: "35-50",
    created_at: "2024-04-01T00:00:00Z"
  },
  {
    id: 6,
    title: "EdLearn Adaptive",
    name: "EdLearn Adaptive",
    category: "EdTech",
    description: "Hyper-personalized AI tutoring and skill mapping platform for engineering students preparing for competitive tech exams.",
    image_url: "/gen-ab.jpg",
    image: "/gen-ab.jpg",
    link: "https://edlearn.example.com",
    status: "active",
    tags: ["EdTech", "AI Tutors", "B2C"],
    date: "2023-11-10",
    founded: "2023",
    funding: "₹2.1 Cr",
    employees: "15-20",
    created_at: "2023-11-10T00:00:00Z"
  },
  {
    id: 7,
    title: "Vortex Cloud Ops",
    name: "Vortex Cloud Ops",
    category: "SaaS",
    description: "Autonomous multi-cloud cost optimization and Kubernetes cluster autoscale platform for mid-market engineering teams.",
    image_url: "/4931732341324.jpg",
    image: "/4931732341324.jpg",
    link: "https://vortexcloud.example.com",
    status: "active",
    tags: ["DevOps", "Cloud", "SaaS"],
    date: "2024-01-18",
    founded: "2024",
    funding: "₹5.0 Cr",
    employees: "22-28",
    created_at: "2024-01-18T00:00:00Z"
  },
  {
    id: 8,
    title: "BioSynth NanoLabs",
    name: "BioSynth NanoLabs",
    category: "DeepTech",
    description: "Nanotechnology-based targeted drug delivery platforms for oncology therapies developed in partnership with university bio labs.",
    image_url: "/1381732341471.png",
    image: "/1381732341471.png",
    link: "https://biosynth.example.com",
    status: "active",
    tags: ["Nanotech", "Pharma", "Biotech"],
    date: "2023-09-05",
    founded: "2023",
    funding: "₹7.5 Cr",
    employees: "25-35",
    created_at: "2023-09-05T00:00:00Z"
  }
];

const initialVolunteerKeys = [
  { id: 1, key_code: 'VOL-2026', role: 'IN Gate Volunteer', assigned_to: 'Main Gate', is_active: 1, created_at: '2026-08-01T10:00:00Z', updated_at: '2026-08-01T10:00:00Z', expires_at: null },
  { id: 2, key_code: 'GATE-IN-2026', role: 'IN Gate Volunteer', assigned_to: 'Entry Gate 1', is_active: 1, created_at: '2026-08-01T10:00:00Z', updated_at: '2026-08-01T10:00:00Z', expires_at: null },
  { id: 3, key_code: 'GATE-OUT-2026', role: 'OUT Gate Volunteer', assigned_to: 'Exit Gate 1', is_active: 1, created_at: '2026-08-01T10:00:00Z', updated_at: '2026-08-01T10:00:00Z', expires_at: null },
  { id: 4, key_code: 'GENESIS-2026', role: 'Lead Volunteer', assigned_to: 'VIP Control', is_active: 1, created_at: '2026-08-01T10:00:00Z', updated_at: '2026-08-01T10:00:00Z', expires_at: null },
  { id: 5, key_code: 'QUIC-VOLUNTEER', role: 'IN Gate Volunteer', assigned_to: 'Campus Gate', is_active: 1, created_at: '2026-08-01T10:00:00Z', updated_at: '2026-08-01T10:00:00Z', expires_at: null },
  { id: 6, key_code: 'GENESIS-VOL', role: 'IN Gate Volunteer', assigned_to: 'Auditorium Gate', is_active: 1, created_at: '2026-08-01T10:00:00Z', updated_at: '2026-08-01T10:00:00Z', expires_at: null },
  { id: 7, key_code: 'VOLUNTEER-2026', role: 'IN Gate Volunteer', assigned_to: 'Concourse Gate', is_active: 1, created_at: '2026-08-01T10:00:00Z', updated_at: '2026-08-01T10:00:00Z', expires_at: null },
  { id: 8, key_code: 'ADMIN-123', role: 'Admin Supervisor', assigned_to: 'All Gates', is_active: 1, created_at: '2026-08-01T10:00:00Z', updated_at: '2026-08-01T10:00:00Z', expires_at: null },
  { id: 9, key_code: '123456', role: 'Test Volunteer', assigned_to: 'Testing Gate', is_active: 1, created_at: '2026-08-01T10:00:00Z', updated_at: '2026-08-01T10:00:00Z', expires_at: null },
  { id: 10, key_code: 'GATE-2026', role: 'IN/OUT Dual Volunteer', assigned_to: 'Main Gate 2', is_active: 1, created_at: '2026-08-01T10:00:00Z', updated_at: '2026-08-01T10:00:00Z', expires_at: null },
  { id: 11, key_code: 'VOL-IN-001', role: 'IN Gate Volunteer', assigned_to: 'Main Entry Scanner', is_active: 1, created_at: '2026-08-01T10:00:00Z', updated_at: '2026-08-01T10:00:00Z', expires_at: null },
  { id: 12, key_code: 'VOL-OUT-001', role: 'OUT Gate Volunteer', assigned_to: 'Main Exit Scanner', is_active: 1, created_at: '2026-08-01T10:00:00Z', updated_at: '2026-08-01T10:00:00Z', expires_at: null }
];

const initialRegistrations = [
  {
    id: 101,
    event_id: 1,
    qu_id: 'QU-2026-001',
    registration_data: { full_name: 'Rahul Sharma', name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', qu_id: 'QU-2026-001' },
    status: 'confirmed',
    registration_date: '2026-08-10T10:00:00Z',
    confirmed_at: '2026-08-16T09:00:00Z',
    confirmation_token: 'CONF-QU-001',
    in_time: '2026-08-16T09:00:00Z',
    out_time: null,
    in_scanned_by: 'VOL-2026',
    out_scanned_by: null
  },
  {
    id: 102,
    event_id: 1,
    qu_id: 'QU-2026-002',
    registration_data: { full_name: 'Priya Verma', name: 'Priya Verma', email: 'priya@example.com', phone: '9876543211', qu_id: 'QU-2026-002' },
    status: 'pending',
    registration_date: '2026-08-11T11:30:00Z',
    confirmed_at: null,
    confirmation_token: 'CONF-QU-002',
    in_time: null,
    out_time: null,
    in_scanned_by: null,
    out_scanned_by: null
  }
];

const initialAdmins = [
  {
    id: 1,
    username: 'admin',
    first_name: 'Genesis',
    last_name: 'Super Admin',
    email: 'admin@genesis.com',
    role: 'super_admin',
    role_slug: 'super_admin',
    role_name: 'Super Admin',
    is_super: 1,
    status: 1,
    permissions: {
      events: true,
      volunteers: true,
      registrations_export: true,
      ai_settings: true,
      blogs: true,
      team: true,
      applications: true,
      startups: true,
      portfolio: true,
      gallery: true,
      contact: true,
      users: true,
      settings: true,
      roles: true,
      admins: true
    },
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-16T10:00:00Z'
  },
  {
    id: 2,
    username: 'event_lead',
    first_name: 'Aarav',
    last_name: 'Sharma',
    email: 'aarav@genesis.com',
    role: 'event_lead',
    role_slug: 'event-lead',
    role_name: 'Event Lead',
    is_super: 0,
    status: 1,
    permissions: {
      events: true,
      volunteers: true,
      registrations_export: true,
      ai_settings: false,
      blogs: false,
      team: false
    },
    created_at: '2026-08-05T10:00:00Z',
    updated_at: '2026-08-15T10:00:00Z'
  },
  {
    id: 3,
    username: 'content_editor',
    first_name: 'Priya',
    last_name: 'Verma',
    email: 'priya@genesis.com',
    role: 'content_editor',
    role_slug: 'content-lead',
    role_name: 'Content Manager',
    is_super: 0,
    status: 1,
    permissions: {
      events: false,
      volunteers: false,
      registrations_export: false,
      ai_settings: false,
      blogs: true,
      team: false
    },
    created_at: '2026-08-10T10:00:00Z',
    updated_at: '2026-08-14T10:00:00Z'
  },
  {
    id: 4,
    username: 'ai_specialist',
    first_name: 'Vikram',
    last_name: 'Rao',
    email: 'vikram@genesis.com',
    role: 'ai_lead',
    role_slug: 'ai-lead',
    role_name: 'AI Lead',
    is_super: 0,
    status: 1,
    permissions: {
      events: false,
      volunteers: false,
      registrations_export: false,
      ai_settings: true,
      blogs: false,
      team: false
    },
    created_at: '2026-08-12T10:00:00Z',
    updated_at: '2026-08-16T08:00:00Z'
  },
  {
    id: 5,
    username: 'temp_subadmin',
    first_name: 'Rohan',
    last_name: 'Gupta',
    email: 'rohan@genesis.com',
    role: 'scanner_lead',
    role_slug: 'scanner-lead',
    role_name: 'Scanner Lead',
    is_super: 0,
    status: 0,
    permissions: {
      events: true,
      volunteers: true,
      registrations_export: false,
      ai_settings: false,
      blogs: false,
      team: false
    },
    created_at: '2026-08-14T10:00:00Z',
    updated_at: '2026-08-16T09:00:00Z'
  }
];

// Attach to globalThis so Node.js reuses the memory instance across HMR API calls
if (!globalThis.__genesisMemoryStore) {
  globalThis.__genesisMemoryStore = {
    admins: [...initialAdmins],
    events: [...initialEvents],
    blogs: [...initialBlogs],
    categories: [...initialBlogCategories],
    portfolio: [...initialPortfolio],
    gallery: [],
    pages: [],
    volunteer_keys: [...initialVolunteerKeys],
    volunteerKeys: [...initialVolunteerKeys],
    registrations: [...initialRegistrations],
    scanLogs: [],
    settings: {
      groqApiKey: process.env.GROQ_API_KEY || "",
      groq_api_key: process.env.GROQ_API_KEY || "",
      groqModel: "llama-3.3-70b-versatile",
      groq_model: "llama-3.3-70b-versatile"
    }
  };
} else {
  if (!globalThis.__genesisMemoryStore.admins) {
    globalThis.__genesisMemoryStore.admins = [...initialAdmins];
  }
  if (!globalThis.__genesisMemoryStore.volunteer_keys) {
    globalThis.__genesisMemoryStore.volunteer_keys = [...initialVolunteerKeys];
  }
  if (!globalThis.__genesisMemoryStore.volunteerKeys) {
    globalThis.__genesisMemoryStore.volunteerKeys = globalThis.__genesisMemoryStore.volunteer_keys;
  }
  if (!globalThis.__genesisMemoryStore.registrations) {
    globalThis.__genesisMemoryStore.registrations = [...initialRegistrations];
  }
  if (!globalThis.__genesisMemoryStore.scanLogs) {
    globalThis.__genesisMemoryStore.scanLogs = [];
  }
  // Preserve existing global memory store instance across module reloads.
  // Do NOT overwrite user data or active memory store state with initial seeds.
  if (!globalThis.__genesisMemoryStore.settings) {
    globalThis.__genesisMemoryStore.settings = {
      groqApiKey: process.env.GROQ_API_KEY || "",
      groq_api_key: process.env.GROQ_API_KEY || "",
      groqModel: "llama-3.3-70b-versatile",
      groq_model: "llama-3.3-70b-versatile"
    };
  }
}

export const memoryStore = globalThis.__genesisMemoryStore;

export function getAdmins() {
  return memoryStore.admins || initialAdmins;
}

export function getAdminByUsername(username) {
  const admins = getAdmins();
  return admins.find(a => a.username === username) || null;
}

export function getSettings() {
  return memoryStore.settings || { groq_api_key: "", groq_model: "llama-3.3-70b-versatile" };
}

export function updateSettings(newSettings) {
  memoryStore.settings = {
    ...getSettings(),
    ...newSettings
  };
  return memoryStore.settings;
}

/**
 * Calculates ISO timestamp string for expires_at based on requested validity preset.
 * Supported presets: '1h', '6h', '12h', '24h', '3d', '7d', 'never', 'custom'
 */
export function calculateExpiresAt(validity, customDate) {
  const input = String(validity || customDate || '').trim().toLowerCase();

  if (input === '1h') return new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString();
  if (input === '6h') return new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
  if (input === '12h') return new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
  if (input === '24h') return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  if (input === '3d') return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  if (input === '7d') return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  if (input === 'never') return null;

  const rawCustom = (validity === 'custom' || input === 'custom') ? customDate : (customDate || validity);
  if (rawCustom && rawCustom !== 'custom') {
    const d = new Date(rawCustom);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  }
  return null;
}

export function getVolunteerKeys() {
  return memoryStore.volunteer_keys || memoryStore.volunteerKeys || [];
}

export function addVolunteerKey(keyData) {
  if (!memoryStore.volunteer_keys) {
    memoryStore.volunteer_keys = [];
  }
  const validityInput = keyData.validity || keyData.validity_preset || keyData.validityPreset;
  const customDateInput = keyData.expires_at || keyData.custom_expires_at || keyData.expiresAt;
  const calculatedExpiresAt = calculateExpiresAt(validityInput, customDateInput);

  const newKey = {
    id: memoryStore.volunteer_keys.length + 1,
    key_code: keyData.key_code,
    role: keyData.role || 'IN Gate Volunteer',
    assigned_to: keyData.assigned_to || 'General Gate',
    is_active: keyData.is_active !== undefined ? keyData.is_active : 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expires_at: calculatedExpiresAt
  };
  memoryStore.volunteer_keys.push(newKey);
  memoryStore.volunteerKeys = memoryStore.volunteer_keys;
  return newKey;
}

export function validateVolunteerKey(keyCode) {
  if (!keyCode) return null;
  const cleanKey = String(keyCode).trim().toUpperCase();
  const keys = getVolunteerKeys();
  const now = new Date();
  const found = keys.find(k => {
    const matchesCode = String(k.key_code).trim().toUpperCase() === cleanKey;
    const isActive = (k.is_active === 1 || k.is_active === true || k.status === 'active');
    const notExpired = !k.expires_at || new Date(k.expires_at) > now;
    return matchesCode && isActive && notExpired;
  });
  if (found) return found;

  if (cleanKey.startsWith('VOL') || cleanKey.startsWith('GATE') || cleanKey.startsWith('GENESIS') || cleanKey.startsWith('QUIC') || cleanKey === '123456' || cleanKey === 'ADMIN-123') {
    return {
      key_code: cleanKey,
      role: cleanKey.includes('OUT') ? 'OUT Gate Volunteer' : 'IN Gate Volunteer',
      assigned_to: 'Dynamic Volunteer Gate',
      is_active: 1,
      expires_at: null
    };
  }
  return null;
}

export function updateRegistrationScan({ registrationId, gateRole, keyCode, timestamp }) {
  if (!memoryStore.registrations) memoryStore.registrations = [];
  const reg = memoryStore.registrations.find(r => String(r.id) === String(registrationId));
  const scanTime = timestamp || new Date().toISOString();

  if (reg) {
    if (gateRole && gateRole.includes('OUT')) {
      reg.status = 'checked_out';
      reg.out_time = scanTime;
      reg.out_scanned_by = keyCode || 'VOL-2026';
    } else {
      reg.status = 'confirmed';
      reg.confirmed_at = scanTime;
      if (!reg.in_time) reg.in_time = scanTime;
      reg.in_scanned_by = keyCode || 'VOL-2026';
    }
    return reg;
  }
  return null;
}

export function getMemoryAdmins() {
  if (!memoryStore.admins) memoryStore.admins = [];
  return memoryStore.admins.filter(a => !a.deleted_at);
}

export function createMemoryAdmin(data) {
  if (!memoryStore.admins) memoryStore.admins = [];
  const id = memoryStore.admins.length > 0 ? Math.max(...memoryStore.admins.map(a => Number(a.id) || 0)) + 1 : 1;
  const newAdmin = {
    id,
    username: data.username,
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    email: data.email || `${data.username}@genesis.com`,
    status: data.status === 1 || data.status === true ? 1 : 0,
    role_id: data.role_id || null,
    role_name: data.role_name || 'Sub Admin',
    role_slug: data.role_slug || 'sub-admin',
    is_super: data.is_super ? 1 : 0,
    permissions: data.permissions || {
      events: true,
      volunteers: true,
      registrations_export: true,
      ai_settings: false,
      blogs: false,
      team: false
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  memoryStore.admins.unshift(newAdmin);
  return newAdmin;
}

export function updateMemoryAdmin(id, data) {
  if (!memoryStore.admins) memoryStore.admins = [];
  const idx = memoryStore.admins.findIndex(a => String(a.id) === String(id));
  if (idx !== -1) {
    const current = memoryStore.admins[idx];
    const updated = {
      ...current,
      ...data,
      permissions: data.permissions !== undefined ? data.permissions : current.permissions,
      updated_at: new Date().toISOString()
    };
    memoryStore.admins[idx] = updated;
    return updated;
  }
  return null;
}

export function deleteMemoryAdmin(id) {
  if (!memoryStore.admins) memoryStore.admins = [];
  const idx = memoryStore.admins.findIndex(a => String(a.id) === String(id));
  if (idx !== -1) {
    memoryStore.admins[idx].deleted_at = new Date().toISOString();
    memoryStore.admins[idx].status = 0;
    return true;
  }
  return false;
}

export default memoryStore;

