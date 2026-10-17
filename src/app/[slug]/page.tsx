import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getActiveSchools,
  getSchoolBySlug,
  getQuestionsBySchoolSorted,
  questions as allQuestions,
  type School,
} from "@/lib/data";
import { summarizeThemes, themePhrase } from "@/lib/themes";
import { CURRENT_INTAKE } from "@/lib/cycle";
import NavBar from "@/components/NavBar";

// Re-render once a day so the year in titles and headings rolls over on its own.
export const revalidate = 86400;

export function generateStaticParams() {
  return getActiveSchools().map((s) => ({ slug: s.slug }));
}

/** Always the current calendar year, whatever year questions were reported. */
function currentYear() {
  return new Date().getFullYear();
}

const VISIBLE = 3; // questions shown in full
const BLURRED = 3; // questions shown blurred after those

function fmtShort(s: number) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

function fmtLong(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  const parts = [];
  if (m) parts.push(`${m} minute${m === 1 ? "" : "s"}`);
  if (r) parts.push(`${r} second${r === 1 ? "" : "s"}`);
  return parts.join(" ");
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function clock(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function buildFaq(school: School) {
  const name = school.display_name;
  const prep = fmtLong(school.prep_sec);
  const answer = fmtLong(school.answer_sec);
  const qs = plural(school.batch_size, "question");
  const one = school.batch_size === 1;
  const minutes = Math.ceil((school.batch_size * (school.prep_sec + school.answer_sec)) / 60);

  return [
    {
      q: `What is the ${name} Kira video interview?`,
      a: `The ${name} Kira video interview is a timed video assessment that is part of your MBA application. A question appears, you get ${prep} to prepare, then the camera records your answer for up to ${answer}, with one take only. You can't know your exact questions in advance, but you can practice first with the same format and real questions reported by applicants.`,
    },
    {
      q: `How long is the ${name} Kira assessment?`,
      a: `The ${name} Kira assessment has ${qs}, with ${prep} to prepare and ${answer} to answer${one ? "" : " each"}. That is about ${plural(minutes, "minute")} of timed questions, plus a short system check at the start.`,
    },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const school = getSchoolBySlug(slug);
  if (!school) return {};

  const n = getQuestionsBySchoolSorted(school.school_id).length;
  const title = `${school.display_name} MBA Kira Interview Questions ${currentYear()} | KiraPrep`;
  const description = `Practice ${n} real ${school.display_name} MBA Kira video interview questions reported by applicants, with the same countdown timer, camera format and pressure as the real Kira. Free to start.`;
  const url = `https://kiraprep.com/${slug}`;

  return {
    title,
    description,
    openGraph: { title, description, url, siteName: "KiraPrep", type: "website" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: url },
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

  const name = school.display_name;
  const year = currentYear();
  // Newest first: the latest reported question leads.
  const questions = getQuestionsBySchoolSorted(school.school_id);
  const latest = questions[0];
  const shown = questions.slice(0, VISIBLE + BLURRED);
  const faq = buildFaq(school);
  const themes = summarizeThemes(
    questions,
    allQuestions.filter((q) => q.status === "active")
  );
  // Every CTA starts the practice page at the first batch.
  const practiceHref = `/${school.slug}/practice?start=first`;
  const batch = Math.max(1, school.batch_size);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://kiraprep.com" },
      { "@type": "ListItem", position: 2, name: `${name} Kira Questions`, item: `https://kiraprep.com/${slug}` },
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const ctaClass =
    "inline-flex items-center justify-center gap-2 bg-brand text-white text-[15px] font-semibold px-7 py-3 rounded-[10px] hover:bg-[#1d4ed8] transition-colors";
  const arrow = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
  const h2 = "font-[family-name:var(--font-dm-serif)] text-[22px] sm:text-[24px] leading-[1.2] text-[#0f172a]";

  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <NavBar />

      <main className="max-w-[760px] mx-auto px-5 sm:px-8 pt-8 pb-20">
        {/* Breadcrumb */}
        <nav className="text-[13px] text-[#64748b] flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand transition-colors">All schools</Link>
          <span>/</span>
          <span className="text-[#334155]">{name}</span>
        </nav>

        {/* Header */}
        <h1 className="font-[family-name:var(--font-dm-serif)] text-[30px] sm:text-[36px] leading-[1.1] text-[#0f172a] mt-4 mb-4 tracking-[-0.5px]">
          {name} MBA Kira Interview Questions {year}
        </h1>
        <p className="text-[15px] text-[#64748b] leading-[1.65] mb-6">
          {`The ${name} Kira video interview is your one chance to show who you are as a person before the interview round. Practice with real questions reported by applicants, with the same countdown timer, camera format and pressure as the actual Kira.`}
        </p>

        {/* Kira-style preview with the latest reported question */}
        <div className="bg-white border border-[#d1d9e6] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="h-[3px] bg-[#e2e8f0] relative">
            <div className="absolute left-0 top-0 h-full bg-brand" style={{ width: `${100 / batch}%` }} />
          </div>
          <div className="flex items-center justify-between px-4 py-[10px] border-b border-[#f0f4f8]">
            <div className="text-[13px] font-bold text-brand flex items-center gap-[6px]">
              <span className="w-[7px] h-[7px] rounded-full bg-brand inline-block" />
              {clock(school.prep_sec)} to prepare
            </div>
            <div className="text-[12px] text-[#94a3b8]">Question 1 of {batch}</div>
          </div>
          <div className="flex">
            <div className="flex-1 min-w-0">
              <div className="bg-[#141e2d] h-[200px] sm:h-[230px] flex items-center justify-center px-4">
                <Link href={practiceHref} className={`${ctaClass} shadow-lg`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M6 4l14 8-14 8z" />
                  </svg>
                  Start Practice
                </Link>
              </div>
              {latest && (
                <div className="px-4 sm:px-6 py-4 text-[14px] sm:text-[15px] text-[#334155] leading-[1.6] border-b border-[#f0f4f8] text-center">
                  <span className="font-semibold text-[#0f172a]">Q1.</span> {latest.text}
                </div>
              )}
              <div className="flex items-center px-4 py-3 gap-4">
                {[
                  [fmtShort(school.prep_sec), "Prep"],
                  [fmtShort(school.answer_sec), "Response"],
                  ["1", "Take"],
                ].map(([v, l], i) => (
                  <div key={l} className="flex items-center gap-4">
                    {i > 0 && <div className="w-px h-6 bg-[#e2e8f0]" />}
                    <div className="text-[10px] text-[#94a3b8] leading-[1.4] uppercase tracking-wide">
                      <strong className="block text-[13px] text-[#334155] font-semibold normal-case tracking-normal">{v}</strong>
                      {l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden sm:flex w-[110px] border-l border-[#f0f4f8] px-2 py-3 flex-col bg-white shrink-0">
              <div className="text-[10px] text-[#64748b] font-semibold mb-2">Practice</div>
              {Array.from({ length: Math.min(batch, 6) }, (_, i) => i + 1).map((n) => (
                <div key={n} className={`flex items-center gap-[6px] py-[5px] px-1 rounded-md ${n === 1 ? "bg-brand-light" : ""}`}>
                  <span className={`w-[11px] h-[11px] rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center ${n === 1 ? "border-brand" : "border-[#d1d9e6]"}`}>
                    {n === 1 && <span className="w-1 h-1 rounded-full bg-brand inline-block" />}
                  </span>
                  <span className={`text-[10px] whitespace-nowrap ${n === 1 ? "text-brand font-semibold" : "text-[#64748b]"}`}>
                    Question {n}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA block */}
        <section className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#e2e8f0] bg-[#f8fafc] rounded-xl px-5 py-5">
          <h2 className="text-[16px] sm:text-[17px] font-semibold text-[#0f172a] leading-[1.45]">
            {plural(questions.length, `${name} Kira interview question`)} reported, with the real
            Kira format and pressure
          </h2>
          <Link href={practiceHref} className={`${ctaClass} shrink-0`}>
            Practice {arrow}
          </Link>
        </section>

        {/* Questions: 3 in full, 3 blurred, then sign in */}
        <section className="mt-12">
          <h2 className={h2}>
            {`${name} Kira questions (updated ${year})`}
          </h2>
          <p className="text-[13px] text-[#94a3b8] mt-1 mb-5">
            {CURRENT_INTAKE} intake · {plural(questions.length, "question")} reported by applicants
          </p>
          <ol className="flex flex-col gap-3">
            {shown.slice(0, VISIBLE).map((q, i) => (
              <li key={q.id} className="bg-white border border-[#e2e8f0] rounded-xl p-5 flex items-start gap-3">
                <span className="mt-[2px] flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-brand-light border border-brand-border text-[12px] font-semibold text-brand">
                  {i + 1}
                </span>
                <p className="text-[14px] text-[#1e293b] leading-[1.65]">{q.text}</p>
              </li>
            ))}
          </ol>
          {shown.length > VISIBLE && (
            <div className="relative mt-3">
              <ol className="flex flex-col gap-3 blur-sm select-none pointer-events-none" aria-hidden>
                {shown.slice(VISIBLE).map((q, i) => (
                  <li key={q.id} className="bg-white border border-[#e2e8f0] rounded-xl p-5 flex items-start gap-3">
                    <span className="mt-[2px] flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-brand-light border border-brand-border text-[12px] font-semibold text-brand">
                      {VISIBLE + i + 1}
                    </span>
                    <p className="text-[14px] text-[#1e293b] leading-[1.65]">{q.text}</p>
                  </li>
                ))}
              </ol>
              <div className="absolute inset-0 flex items-center justify-center">
                <Link
                  href={practiceHref}
                  className="bg-white border border-[#e2e8f0] rounded-full px-5 py-[9px] text-[14px] font-semibold text-[#0f172a] shadow-md hover:text-brand transition-colors"
                >
                  🔒 Sign in to practice all {questions.length} questions
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* What this school asks: generated from its own questions */}
        {themes.top.length > 0 && (
          <section className="mt-14">
            <h2 className={`${h2} mb-3`}>{`What ${name} asks in Kira`}</h2>
            <p className="text-[15px] text-[#475569] leading-[1.7] mb-4">
              {`Applicants have reported ${plural(questions.length, `${name} Kira question`)}. ${
                themes.top.length === 1 ? "The most common theme is" : "The most common themes are"
              } ${themes.top
                .slice(0, 3)
                .map((t) => themePhrase(t.name))
                .join(", ")
                .replace(/, ([^,]*)$/, themes.top.length > 2 ? ", and $1" : " and $1")}.`}
              {themes.distinctive &&
                ` Compared with the other schools we cover, ${name} asks noticeably more ${themePhrase(themes.distinctive)} questions.`}
            </p>
            <ul className="flex flex-col gap-3">
              {themes.top.map((th) => (
                <li key={th.name} className="border-l-2 border-brand-border-dark pl-4">
                  <div className="text-[14px] font-semibold text-[#0f172a]">
                    {th.name} <span className="font-normal text-[#94a3b8]">· {plural(th.count, "question")}</span>
                  </div>
                  <p className="text-[14px] text-[#475569] leading-[1.6] mt-1">
                    {`e.g. "${th.example}"`}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        <section className="mt-14">
          <h2 className={`${h2} mb-4`}>
            {name} Kira FAQ {year}
          </h2>
          <div className="flex flex-col gap-3">
            {faq.map((f, i) => (
              <details key={f.q} open={i === 0} className="group border border-[#e2e8f0] rounded-xl px-5 py-4 open:bg-[#f8fafc]">
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-[15px] font-semibold text-[#0f172a]">
                  <h3>{f.q}</h3>
                  <span className="text-brand text-[18px] leading-none transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 text-[14px] text-[#475569] leading-[1.7]">{f.a}</p>
                {i === 0 && (
                  <p className="mt-2 text-[14px] text-[#475569] leading-[1.7]">
                    Read more about{" "}
                    <Link href="/tips/what-is-kira" className="text-brand font-medium hover:underline">
                      how the Kira assessment works
                    </Link>{" "}
                    and{" "}
                    <Link href="/tips/how-to-prepare" className="text-brand font-medium hover:underline">
                      how to prepare for a Kira interview
                    </Link>
                    .
                  </p>
                )}
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-14 text-center border border-brand-border bg-brand-light rounded-2xl px-6 py-10">
          <h2 className={`${h2} mb-2`}>Ready for your {name} Kira?</h2>
          <p className="text-[14px] text-[#64748b] mb-6">
            Practice with real questions, the same timer, and one take. Free to start.
          </p>
          <Link href={practiceHref} className={ctaClass}>
            Start Practice {arrow}
          </Link>
        </section>
      </main>
    </div>
  );
}
