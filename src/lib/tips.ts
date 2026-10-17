export interface TipArticle {
  slug: string;
  title: string; // <title> tag
  h1: string;
  description: string;
  summary: string; // card blurb on /tips
  readMinutes: number;
  datePublished: string;
  dateModified: string;
}

export const tips: TipArticle[] = [
  {
    slug: "what-is-kira",
    title: "What is Kira Talent? Complete Guide 2026 | KiraPrep",
    h1: "What is Kira Talent?",
    description:
      "What the Kira Talent video assessment is, how it works, how long it takes, and the question format at INSEAD, Kellogg, Oxford, LBS and other MBA programs.",
    summary:
      "How the Kira video assessment works, how long it takes, and what the format looks like at each school.",
    readMinutes: 6,
    datePublished: "2026-10-17",
    dateModified: "2026-10-17",
  },
  {
    slug: "how-to-prepare",
    title: "How to Prepare for a Kira Video Interview | KiraPrep",
    h1: "How to Prepare for a Kira Interview",
    description:
      "A step-by-step plan to prepare for your MBA Kira video interview: practice under real timing, structure answers in the prep window, and set up your camera.",
    summary:
      "A step-by-step plan: what to practice, how to use the prep window, and how to set up your camera and room.",
    readMinutes: 7,
    datePublished: "2026-10-17",
    dateModified: "2026-10-17",
  },
];

export function getTip(slug: string): TipArticle {
  const t = tips.find((x) => x.slug === slug);
  if (!t) throw new Error(`Unknown tip: ${slug}`);
  return t;
}
