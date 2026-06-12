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
