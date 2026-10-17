import { MetadataRoute } from "next";
import { tips } from "@/lib/tips";
import { getActiveSchools } from "@/lib/data";
import { CONTENT_UPDATED } from "@/lib/cycle";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kiraprep.com";
  // A real "last changed" date: bump CONTENT_UPDATED in lib/cycle.ts when questions change.
  const updated = new Date(CONTENT_UPDATED);
  const tipsUpdated = new Date(
    Math.max(...tips.map((t) => new Date(t.dateModified).getTime()))
  );

  return [
    { url: base, lastModified: updated, changeFrequency: "weekly", priority: 1 },
    ...getActiveSchools().map((s) => ({
      url: `${base}/${s.slug}`,
      lastModified: updated,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${base}/tips`, lastModified: tipsUpdated, changeFrequency: "monthly", priority: 0.7 },
    ...tips.map((t) => ({
      url: `${base}/tips/${t.slug}`,
      lastModified: new Date(t.dateModified),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
