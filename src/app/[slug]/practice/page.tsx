import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getActiveSchools,
  getSchoolBySlug,
  getQuestionsBySchoolSorted,
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

  const questions = getQuestionsBySchoolSorted(school.school_id);

  return (
    <PracticeScreen
      school={{
        school_id: school.school_id,
        display_name: school.display_name,
        slug: school.slug,
        batch_size: school.batch_size,
        prep_sec: school.prep_sec,
        answer_sec: school.answer_sec,
      }}
      questions={questions.map((q) => ({ id: q.id, text: q.text }))}
    />
  );
}
