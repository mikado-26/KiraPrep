import { MetadataRoute } from "next";

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
  ];
}
