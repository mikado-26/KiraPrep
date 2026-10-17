import { MetadataRoute } from "next";
import { tips } from "@/lib/tips";

const schools = [
  "insead-kira-questions",
  "oxford-said-kira-questions",
  "foster-kira-questions",
  "iese-kira-questions",
  "kellogg-kira-questions",
  "mit-sloan-kira-questions",
  "yale-som-kira-questions",
  "haas-kira-questions",
  "mccombs-kira-questions",
  "lbs-kira-questions",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kiraprep.com";

  const schoolUrls = schools.map((slug) => ({
    url: `${base}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    ...schoolUrls,
    {
      url: `${base}/tips`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...tips.map((t) => ({
      url: `${base}/tips/${t.slug}`,
      lastModified: new Date(t.dateModified),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
