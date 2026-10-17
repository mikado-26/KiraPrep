import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getActiveSchools,
  getSchoolBySlug,
  getPracticeBatches,
} from "@/lib/data";
import PracticeScreen from "@/components/PracticeScreen";

export function generateStaticParams() {
  return getActiveSchools().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const school = getSchoolBySlug(slug);
  if (!school) return {};
  return {
    title: `Practice ${school.display_name} Kira Questions | KiraPrep`,
    description: `Timed ${school.display_name} Kira video interview practice session.`,
    robots: { index: false, follow: true },
  };
}

export default async function PracticePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = getSchoolBySlug(slug);
  if (!school) notFound();

  // Newest intake first, each with that intake's own Kira format.
  const batches = getPracticeBatches(school.school_id);
  if (batches.length === 0) notFound();

  return (
    <PracticeScreen
      school={{
        school_id: school.school_id,
        display_name: school.display_name,
        slug: school.slug,
      }}
      batches={batches}
    />
  );
}
