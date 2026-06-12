import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getActiveSchools,
  getSchoolBySlug,
  getQuestionsBySchool,
} from "@/lib/data";

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
    title: `${school.display_name} MBA Kira Questions 2026 — Practice Free | KiraPrep`,
    description: `Practice real ${school.display_name} Kira video essay questions. Timed practice mode with 194+ questions sourced from Reddit and MBA applicants.`,
  };
}

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = getSchoolBySlug(slug);
  if (!school) notFound();

  const questions = getQuestionsBySchool(school.school_id);
  const visibleCount = 3;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {/* Back link */}
      <Link
        href="/"
        className="text-sm text-gray-400 hover:text-white transition"
      >
        ← All Schools
      </Link>

      {/* Header */}
      <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
        {school.display_name} MBA Kira Questions
      </h1>
      <p className="mt-3 text-gray-400">
        Real questions from {school.display_name}&apos;s Kira video assessment,
        sourced from applicants. {questions.length} questions available.
      </p>

      {/* Session info */}
      <div className="mt-6 flex flex-wrap gap-3">
        <span className="rounded-full bg-gray-800 px-4 py-1.5 text-sm">
          {school.batch_size} questions per session
        </span>
        <span className="rounded-full bg-gray-800 px-4 py-1.5 text-sm">
          {school.prep_sec}s prep time
        </span>
        <span className="rounded-full bg-gray-800 px-4 py-1.5 text-sm">
          {school.answer_sec}s answer time
        </span>
      </div>

      {/* CTA */}
      <Link
        href={`/${school.slug}/practice`}
        className="mt-8 inline-block rounded-lg bg-indigo-600 px-8 py-3 text-lg font-semibold transition hover:bg-indigo-500"
      >
        Practice {school.display_name} Kira Now →
      </Link>

      {/* Questions list */}
      <div className="mt-12 space-y-4">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className={`rounded-lg border border-gray-800 bg-gray-900 p-5 ${
              i >= visibleCount ? "select-none" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-800 text-sm font-medium text-gray-300">
                {i + 1}
              </span>
              <div className="flex-1">
                {i < visibleCount ? (
                  <p className="text-gray-200">{q.text}</p>
                ) : (
                  <div className="relative">
                    <p className="text-gray-200 blur-sm select-none" aria-hidden>
                      {q.text}
                    </p>
                    {i === visibleCount && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="rounded-full bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300">
                          🔒 Practice to unlock all questions
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {i < visibleCount && (
                  <div className="mt-2 flex gap-2">
                    {q.category && (
                      <span className="text-xs text-gray-500">
                        {q.category}
                      </span>
                    )}
                    {q.year && (
                      <span className="text-xs text-gray-500">· {q.year}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 text-center">
        <Link
          href={`/${school.slug}/practice`}
          className="inline-block rounded-lg bg-indigo-600 px-8 py-3 text-lg font-semibold transition hover:bg-indigo-500"
        >
          Start Practicing →
        </Link>
      </div>

      {/* SEO content */}
      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-xl font-bold">
          How to Prepare for {school.display_name} Kira
        </h2>
        <p className="mt-4 text-gray-400 leading-relaxed">
          The {school.display_name} Kira assessment presents {school.batch_size}{" "}
          video questions per session. You get {school.prep_sec} seconds to
          prepare and {school.answer_sec} seconds to record each answer.
          Practice under these exact conditions with KiraPrep to build
          confidence and improve your responses before the real assessment.
        </p>
        <p className="mt-4 text-gray-400 leading-relaxed">
          Questions are sourced from real applicants who shared their experience
          on Reddit and MBA community forums. While we can&apos;t guarantee
          you&apos;ll see these exact questions, practicing with real
          school-specific questions is the best preparation strategy available.
        </p>
      </section>
    </main>
  );
}
