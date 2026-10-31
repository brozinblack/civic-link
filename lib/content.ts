export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  kind: "Civic explainer" | "Opinion" | "Official statement" | "Reporting";
  source: string;
  publishedAt: string;
  readTime: string;
  featured?: boolean;
  body: string[];
};

export const categories = ["All", "Parliament", "Public policy", "Local government", "Youth & education", "Economy", "Fact-checking"];

export const articles: Article[] = [
  {
    slug: "questions-before-sharing-a-claim",
    title: "Before you share a political claim, ask these three questions",
    excerpt: "A practical media-literacy checklist for checking the source, date and evidence behind a post.",
    category: "Fact-checking",
    kind: "Civic explainer",
    source: "Civic Link sample desk",
    publishedAt: "Demo edition",
    readTime: "4 min read",
    featured: true,
    body: [
      "This sample explainer demonstrates the article format. It is not reporting about a current political event.",
      "Start with the original source. A screenshot or forwarded message may leave out the date, full statement or document it came from. Look for the complete source and check whether it is the right source for the claim.",
      "Check when the material was published and what evidence it points to. A real image or quotation can still be presented without its original context. When important details are missing, pause before sharing and describe what remains unconfirmed.",
      "Civic Link Uganda labels this as demo content. Replace it with an editorially reviewed lesson and authoritative references before public launch."
    ]
  },
  {
    slug: "reading-a-public-document",
    title: "A simple guide to reading a public document",
    excerpt: "Find the date, issuing institution and source material before drawing a conclusion.",
    category: "Public policy",
    kind: "Civic explainer",
    source: "Civic Link sample desk",
    publishedAt: "Demo edition",
    readTime: "5 min read",
    body: ["This illustrative sample is not legal advice and does not describe a specific current government process.", "When a public document is shared, locate the complete original version. Note who issued it, when it was issued, what it covers and whether it has since been amended or replaced.", "Separate the text of the document from commentary about it. If a detail is unclear, use the issuing institution's official channel or consult a qualified source before relying on it."]
  },
  {
    slug: "constructive-community-question",
    title: "How to frame a clear question for a public representative",
    excerpt: "A focused question makes it easier for an office to understand the issue and give a useful reply.",
    category: "Local government",
    kind: "Civic explainer",
    source: "Civic Link sample desk",
    publishedAt: "Demo edition",
    readTime: "3 min read",
    body: ["This sample is a communication guide, not an official government service or promise of response.", "Describe the public issue, the area affected and the action or information you are requesting. Keep private details out of a public submission.", "A submission on Civic Link does not guarantee an official response. Keep a copy of any relevant public reference and use the official contact channel when a matter needs urgent attention."]
  },
  {
    slug: "understanding-editorial-labels",
    title: "What do the labels on a civic news story mean?",
    excerpt: "Reporting, opinion, official statements and sponsored material serve different purposes.",
    category: "Fact-checking",
    kind: "Civic explainer",
    source: "Civic Link sample desk",
    publishedAt: "Demo edition",
    readTime: "4 min read",
    body: ["This demonstration guide explains the labels planned for Civic Link Uganda; it is not a report about a public institution.", "Reporting presents sourced information gathered and reviewed by an editorial team. Opinion is a clearly identified viewpoint. An official statement is attributed to the issuing office but is not automatically independently verified.", "Sponsored material should be visibly identified. User submissions remain subject to review and should never be presented as confirmed reporting merely because they appear on the platform."]
  }
];

export type Course = { slug: string; title: string; category: string; summary: string; lessons: number; duration: string; level: string };

export const courses: Course[] = [
  { slug: "understanding-democracy", title: "Understanding Democracy", category: "Foundations", summary: "Explore participation, representation and public accountability through short, carefully sourced lessons.", lessons: 4, duration: "20 min", level: "Beginner" },
  { slug: "constitution-of-uganda", title: "The Constitution of Uganda", category: "Institutions", summary: "A guided learning pathway to reading the Constitution from authoritative source material.", lessons: 5, duration: "30 min", level: "Beginner" },
  { slug: "role-of-parliament", title: "The Role of Parliament", category: "Institutions", summary: "Learn how to find public parliamentary information and distinguish documents from commentary.", lessons: 4, duration: "25 min", level: "Beginner" },
  { slug: "how-laws-are-made", title: "How Laws Are Made", category: "Institutions", summary: "An introductory course designed to be checked against current official procedure before launch.", lessons: 4, duration: "25 min", level: "Beginner" },
  { slug: "local-government", title: "Local Government", category: "Community", summary: "A starting point for learning about local public institutions and where to find official information.", lessons: 3, duration: "18 min", level: "Beginner" },
  { slug: "citizens-rights", title: "Citizens’ Rights and Responsibilities", category: "Foundations", summary: "Review rights and responsibilities using the relevant primary legal sources.", lessons: 5, duration: "30 min", level: "Beginner" },
  { slug: "electoral-education", title: "Electoral Education", category: "Participation", summary: "Find trusted election information and build a plan for checking dates and procedures.", lessons: 4, duration: "22 min", level: "Beginner" },
  { slug: "leadership-and-ethics", title: "Leadership and Public Ethics", category: "Participation", summary: "Consider public-service values, responsible leadership and accountability.", lessons: 3, duration: "18 min", level: "Intermediate" },
  { slug: "public-finance", title: "Public Finance and National Budgets", category: "Public finance", summary: "An introductory guide to budget documents and questions to ask of the source material.", lessons: 4, duration: "25 min", level: "Beginner" },
  { slug: "executive-institutions", title: "Executive and Government Institutions", category: "Institutions", summary: "Learn to identify public bodies and find the primary sources that describe their responsibilities.", lessons: 4, duration: "24 min", level: "Beginner" },
  { slug: "accountability-transparency", title: "Accountability and Transparency", category: "Public finance", summary: "Practice tracing public claims to evidence and keeping corrections and source context visible.", lessons: 3, duration: "20 min", level: "Beginner" },
  { slug: "media-literacy", title: "Media Literacy and Fact-checking", category: "Digital citizenship", summary: "Practice checking a claim's source, context, date and supporting evidence.", lessons: 3, duration: "16 min", level: "Beginner" },
  { slug: "peaceful-participation", title: "Peaceful Political Participation", category: "Participation", summary: "Learn about constructive discussion and peaceful ways to take part in civic life.", lessons: 3, duration: "18 min", level: "Beginner" },
  { slug: "youth-leadership", title: "Youth Leadership", category: "Youth", summary: "Explore practical ways for young people to learn, collaborate and contribute to community life.", lessons: 3, duration: "18 min", level: "Beginner" }
];

export const sampleLessons = [
  { title: "Start with the source", body: "Look for the complete, original document or the institution's own publication page. This demo lesson is an interface example; it is not a substitute for current authoritative guidance." },
  { title: "Separate fact from interpretation", body: "Identify what the source directly states and what is commentary. Check dates, definitions and any amendments before relying on a summary." },
  { title: "Ask a constructive question", body: "Write down what you need to know, which public institution may have the information and which official channel can confirm it." }
];

export type Representative = { slug: string; name: string; office: string; area: string; status: string; about: string };
export const representatives: Representative[] = [
  { slug: "sample-public-profile-1", name: "Sample public profile", office: "Representative profile example", area: "Central Region · demo record", status: "Sample record — not a real office-holder", about: "This placeholder demonstrates a public profile layout. It does not identify or verify a real representative. Replace it only with reviewed public information and an approved professional verification." },
  { slug: "sample-public-profile-2", name: "Sample institutional profile", office: "Institutional contact example", area: "Uganda · demo record", status: "Sample record — not an official contact", about: "This placeholder demonstrates how official contact information may appear after source review. It is not a public office or contact channel." },
  { slug: "sample-public-profile-3", name: "Sample constituency profile", office: "Constituency profile example", area: "Eastern Region · demo record", status: "Sample record — not a real office-holder", about: "This placeholder is fictional and exists only to demonstrate directory navigation and profile layout." }
];

export const civicSections = [
  { title: "News & public affairs", href: "/news", icon: "news" },
  { title: "Civic learning", href: "/learn", icon: "learn" },
  { title: "Connect with leaders", href: "/leaders", icon: "leaders" },
  { title: "Community concerns", href: "/concerns", icon: "concerns" }
];
