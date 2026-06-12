import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getActiveSchools,
  getSchoolBySlug,
  getQuestionsBySchool,
} from "@/lib/data";
import NavBar from "@/components/NavBar";

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

  function fmtTime(s: number) {
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return r ? `${m}m ${r}s` : `${m}m`;
  }

  return (
    <div className="bg-white min-h-screen">
      <NavBar />

      <main className="max-w-[720px] mx-auto px-8 pt-10 pb-20">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="text-[13px] text-[#64748b] hover:text-brand transition-colors flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          All Schools
        </Link>

        {/* Header */}
        <h1 className="font-[family-name:var(--font-dm-serif)] text-[34px] leading-[1.1] text-[#0f172a] mt-5 mb-2 tracking-[-0.5px]">
          {school.display_name} Kira Questions
        </h1>
        <p className="text-[15px] text-[#64748b] leading-[1.6]">
          Real questions from {school.display_name}&apos;s Kira video assessment,
          sourced from applicants. {questions.length} questions available.
        </p>

        {/* Session info pills */}
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="bg-brand-light border border-brand-border text-brand text-[13px] font-medium rounded-full px-4 py-[5px]">
            {school.batch_size} questions / session
          </span>
          <span className="bg-brand-light border border-brand-border text-brand text-[13px] font-medium rounded-full px-4 py-[5px]">
            {fmtTime(school.prep_sec)} prep
          </span>
          <span className="bg-brand-light border border-brand-border text-brand text-[13px] font-medium rounded-full px-4 py-[5px]">
            {fmtTime(school.answer_sec)} response
          </span>
        </div>

        {/* CTA */}
        <Link
          href={`/${school.slug}/practice`}
          className="mt-7 inline-flex items-center gap-2 bg-brand text-white text-[15px] font-semibold px-7 py-3 rounded-[10px] hover:bg-[#1d4ed8] transition-colors"
        >
          Practice {school.display_name} Kira
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Questions list */}
        <div className="mt-10 flex flex-col gap-3">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className="bg-white border border-[#e2e8f0] rounded-xl p-5"
            >
              <div className="flex items-start gap-3">
                <span className="mt-[2px] flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-brand-light border border-brand-border text-[12px] font-semibold text-brand">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {i < visibleCount ? (
                    <>
                      <p className="text-[14px] text-[#1e293b] leading-[1.65]">{q.text}</p>
                      <div className="mt-2 flex gap-2">
                        {q.category && (
                          <span className="text-[12px] text-[#94a3b8]">{q.category}</span>
                        )}
                        {q.year && (
                          <span className="text-[12px] text-[#94a3b8]">· {q.year}</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="relative">
                      <p className="text-[14px] text-[#1e293b] leading-[1.65] blur-sm select-none" aria-hidden>
                        {q.text}
                      </p>
                      {i === visibleCount && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-white border border-[#e2e8f0] rounded-full px-4 py-[7px] text-[13px] font-medium text-[#64748b] shadow-sm">
                            🔒 Sign in to unlock all questions
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <Link
            href={`/${school.slug}/practice`}
            className="inline-flex items-center gap-2 bg-brand text-white text-[15px] font-semibold px-7 py-3 rounded-[10px] hover:bg-[#1d4ed8] transition-colors"
          >
            Start Practicing
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* SEO content */}
        <section className="mt-16 pt-10 border-t border-[#e2e8f0]">
          <h2 className="font-[family-name:var(--font-dm-serif)] text-[22px] text-[#0f172a]">
            How to Prepare for {school.display_name} Kira
          </h2>
          <p className="mt-4 text-[14px] text-[#64748b] leading-[1.75]">
            The {school.display_name} Kira assessment presents {school.batch_size} video
            questions per session. You get {fmtTime(school.prep_sec)} to prepare and{" "}
            {fmtTime(school.answer_sec)} to record each answer. Practice under these
            exact conditions with KiraPrep to build confidence and improve your responses
            before the real assessment.
          </p>
          <p className="mt-4 text-[14px] text-[#64748b] leading-[1.75]">
            Questions are sourced from real applicants who shared their experience on
            Reddit and MBA community forums. While we can&apos;t guarantee you&apos;ll
            see these exact questions, practicing with real school-specific questions is
            the best preparation strategy available.
          </p>
        </section>
      </main>
    </div>
  );
}
