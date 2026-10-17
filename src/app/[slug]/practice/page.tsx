import { permanentRedirect } from "next/navigation";
import { getActiveSchools } from "@/lib/data";

export function generateStaticParams() {
  return getActiveSchools().map((s) => ({ slug: s.slug }));
}

/**
 * Practice now runs on the school page itself. Old /[slug]/practice links
 * land on the school page and open practice straight away.
 */
export default async function PracticeRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/${slug}?start=1`);
}
