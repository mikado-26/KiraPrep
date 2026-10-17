import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getActiveSchools,
  getSchoolBySlug,
  getSchoolFormats,
  getQuestionsBySchoolSorted,
  type School,
  type SchoolFormat,
  type Question,
} from "@/lib/data";
import {
  CURRENT_CYCLE_START,
  CURRENT_CYCLE_LABEL,
  CURRENT_INTAKE,
  cycleLabel,
  contentUpdatedLabel,
} from "@/lib/cycle";
import NavBar from "@/components/NavBar";
import SchoolPractice, { StartPracticeButton } from "@/components/SchoolPractice";
import QuestionBrowser, { type QuestionGroup } from "@/components/QuestionBrowser";

export function generateStaticParams() {
  return getActiveSchools().map((s) => ({ slug: s.slug }));
}

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

function describeFormat(f: SchoolFormat) {
  return `${plural(f.batch_size, "video question")}, with ${fmtLong(f.prep_sec)} to prepare and ${fmtLong(f.answer_sec)} to answer each`;
}

function groupByCycle(questions: Question[]): QuestionGroup[] {
  const byYear = new Map<number, Question[]>();
  for (const q of questions) {
    const list = byYear.get(q.year) ?? [];
    list.push(q);
    byYear.set(q.year, list);
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, qs]) => ({
      startYear: year,
      label: cycleLabel(year),
      isCurrent: year === CURRENT_CYCLE_START,
      questions: qs.map((q) => ({ id: q.id, text: q.text, category: q.category })),
    }));
}

function buildFaq(school: School, questions: Question[], formats: SchoolFormat[]) {
  const name = school.display_name;
  const current = questions.filter((q) => q.year === CURRENT_CYCLE_START);
  const latestYear = questions[0]?.year;
  const latest = formats[0];
  const currentFormat = formats.find((f) => f.year === CURRENT_CYCLE_START);
  const prevFormat = formats.find((f) => f.year < CURRENT_CYCLE_START);
  const minutes = Math.ceil((latest.batch_size * (latest.prep_sec + latest.answer_sec)) / 60);

  const items: { q: string; a: string }[] = [];

  items.push({
    q: `What are the ${name} Kira questions for the ${CURRENT_INTAKE} intake?`,
    a: current.length
      ? `Applicants in the ${CURRENT_CYCLE_LABEL} cycle (${CURRENT_INTAKE} intake) have reported ${plural(current.length, `${name} Kira question`)} so far, including: "${current[0].text}" The full list is on this page, and we add new questions as applicants report them.`
      : `We haven't collected ${CURRENT_CYCLE_LABEL} questions for ${name} yet. Questions from the ${latestYear ? cycleLabel(latestYear) : "previous"} cycle are the closest guide${questions[0] ? `, for example: "${questions[0].text}"` : "."} We add new questions as ${CURRENT_INTAKE}-intake applicants report them.`,
  });

  items.push({
    q: `How long is the ${name} Kira assessment?`,
    a: `Based on the ${cycleLabel(latest.year)} cycle, the ${name} Kira assessment has ${describeFormat(latest)}. That is about ${plural(minutes, "minute")} of timed questions, plus a short system check. You get one take per question.`,
  });

  let changed: string;
  if (currentFormat && prevFormat) {
    const same =
      currentFormat.batch_size === prevFormat.batch_size &&
      currentFormat.prep_sec === prevFormat.prep_sec &&
      currentFormat.answer_sec === prevFormat.answer_sec;
    changed = same
      ? `No. Applicants report the same format as ${cycleLabel(prevFormat.year)}: ${describeFormat(currentFormat)}.`
      : `Yes. Applicants in ${CURRENT_CYCLE_LABEL} report ${describeFormat(currentFormat)}. In ${cycleLabel(prevFormat.year)} it was ${describeFormat(prevFormat)}.`;
  } else if (currentFormat) {
    changed = `In ${CURRENT_CYCLE_LABEL}, applicants report ${describeFormat(currentFormat)}.`;
  } else {
    changed = `We don't have a ${CURRENT_CYCLE_LABEL} format report for ${name} yet. In ${cycleLabel(latest.year)} it was ${describeFormat(latest)}. Always follow the instructions in your Kira invitation email.`;
  }
  items.push({ q: `Has the ${name} Kira format changed for ${CURRENT_CYCLE_LABEL}?`, a: changed });

  items.push({
    q: `How do I practice for the ${name} Kira interview?`,
    a: `Practice real ${name} questions under the same timer: ${fmtLong(latest.prep_sec)} to think, then ${fmtLong(latest.answer_sec)} on camera with no retakes. You can do this free on KiraPrep with the ${plural(questions.length, "question")} on this page.`,
  });

  return items;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const school = getSchoolBySlug(slug);
  if (!school) return {};

  const qs = getQuestionsBySchoolSorted(school.school_id);
  const title = `${school.display_name} MBA Kira Questions ${CURRENT_CYCLE_LABEL} (${CURRENT_INTAKE} Intake) | KiraPrep`;
  const description = `Practice ${qs.length} real ${school.display_name} MBA Kira video interview questions, updated for the ${CURRENT_CYCLE_LABEL} cycle (${CURRENT_INTAKE} intake). Same timer, camera and one-take format as the real Kira.`;
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
  const questions = getQuestionsBySchoolSorted(school.school_id);
  const formats = getSchoolFormats(school.school_id);
  const groups = groupByCycle(questions);
  const faq = buildFaq(school, questions, formats);
  const hasCurrentFormat = formats.some((f) => f.year === CURRENT_CYCLE_START);
  const alias = school.aliases?.[0];

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
    "inline-flex items-center gap-2 bg-brand text-white text-[15px] font-semibold px-7 py-3 rounded-[10px] hover:bg-[#1d4ed8] transition-colors cursor-pointer";
  const arrow = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
  const pill = "text-[12px] font-medium rounded-full px-3 py-[4px] border";

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
        <h1 className="font-[family-name:var(--font-dm-serif)] text-[30px] sm:text-[36px] leading-[1.1] text-[#0f172a] mt-4 mb-3 tracking-[-0.5px]">
          {name} MBA Kira Interview Questions
        </h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`${pill} bg-brand-light border-brand-border text-brand`}>{CURRENT_CYCLE_LABEL} cycle</span>
          <span className={`${pill} bg-brand-light border-brand-border text-brand`}>{CURRENT_INTAKE} intake</span>
          <span className={`${pill} bg-[#f8fafc] border-[#e2e8f0] text-[#64748b]`}>Updated {contentUpdatedLabel()}</span>
        </div>
        <p className="text-[15px] text-[#64748b] leading-[1.6] mb-6">
          Real Kira video assessment questions reported by applicants to {school.full_name}
          {alias ? ` (${alias})` : ""}. Try the first one below with the same{" "}
          {fmtShort(school.prep_sec)} prep and {fmtShort(school.answer_sec)} answer timer as the real thing.
        </p>

        {/* Kira-style preview → sign in → camera → practice */}
        <SchoolPractice
          school={{
            school_id: school.school_id,
            display_name: name,
            slug: school.slug,
            batch_size: school.batch_size,
            prep_sec: school.prep_sec,
            answer_sec: school.answer_sec,
          }}
          formatCycle={cycleLabel(school.format_year)}
          questions={questions.map((q) => ({ id: q.id, text: q.text, year: q.year }))}
        />

        {/* CTA bar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#e2e8f0] bg-[#f8fafc] rounded-xl px-5 py-4">
          <div className="text-[14px] text-[#475569] leading-[1.5]">
            <strong className="text-[#0f172a]">{plural(questions.length, "real question")}</strong> ·{" "}
            {plural(school.batch_size, "question")} per session · {fmtShort(school.answer_sec)} to answer
          </div>
          <StartPracticeButton className={ctaClass}>Practice {name} Kira {arrow}</StartPracticeButton>
        </div>

        {/* Tags + questions grouped by cycle */}
        <div className="mt-10">
          <QuestionBrowser groups={groups} schoolName={name} slug={school.slug} />
        </div>

        {/* Format by year */}
        <section className="mt-14">
          <h2 className="font-[family-name:var(--font-dm-serif)] text-[22px] text-[#0f172a] mb-4">
            {name} Kira format by year
          </h2>
          <div className="overflow-x-auto border border-[#e2e8f0] rounded-[10px]">
            <table className="w-full text-[14px] text-left">
              <thead className="bg-[#f8fafc] text-[#0f172a]">
                <tr>
                  <th className="font-semibold px-4 py-3">Cycle</th>
                  <th className="font-semibold px-4 py-3">Video questions</th>
                  <th className="font-semibold px-4 py-3">Prep time</th>
                  <th className="font-semibold px-4 py-3">Answer time</th>
                </tr>
              </thead>
              <tbody className="text-[#475569]">
                {formats.map((f) => (
                  <tr key={f.year} className="border-t border-[#e2e8f0]">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {cycleLabel(f.year)} <span className="text-[#94a3b8]">({f.year + 1} intake)</span>
                    </td>
                    <td className="px-4 py-3">{f.batch_size}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{fmtShort(f.prep_sec)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{fmtShort(f.answer_sec)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!hasCurrentFormat && (
            <p className="mt-3 text-[13px] text-[#94a3b8] leading-[1.6]">
              No {CURRENT_CYCLE_LABEL} format report yet, so practice uses the latest reported format.
              Always follow the instructions in your Kira invitation email.
            </p>
          )}
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="font-[family-name:var(--font-dm-serif)] text-[22px] text-[#0f172a] mb-4">
            {name} Kira FAQ
          </h2>
          <div className="flex flex-col gap-3">
            {faq.map((f, i) => (
              <details
                key={f.q}
                open={i === 0}
                className="group border border-[#e2e8f0] rounded-xl px-5 py-4 open:bg-[#f8fafc]"
              >
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-[15px] font-semibold text-[#0f172a]">
                  <h3>{f.q}</h3>
                  <span className="text-brand text-[18px] leading-none transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 text-[14px] text-[#475569] leading-[1.7]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Prepare */}
        <section className="mt-14">
          <h2 className="font-[family-name:var(--font-dm-serif)] text-[22px] text-[#0f172a] mb-3">
            How to prepare for the {name} Kira
          </h2>
          <p className="text-[14px] text-[#64748b] leading-[1.75]">
            You can&apos;t know your exact questions in advance, but you can get used to the
            format: a short countdown, then a camera that records once. New to Kira? Read{" "}
            <Link href="/tips/what-is-kira" className="text-brand font-medium hover:underline">
              what the Kira assessment is and how it works
            </Link>{" "}
            and our{" "}
            <Link href="/tips/how-to-prepare" className="text-brand font-medium hover:underline">
              step-by-step guide to preparing for a Kira interview
            </Link>
            .
          </p>
        </section>

        {/* Final CTA */}
        <section className="mt-14 text-center border border-brand-border bg-brand-light rounded-2xl px-6 py-10">
          <h2 className="font-[family-name:var(--font-dm-serif)] text-[24px] text-[#0f172a] mb-2">
            Ready for your {name} Kira?
          </h2>
          <p className="text-[14px] text-[#64748b] mb-6">
            Practice with real questions, the same timer, and one take. Free to start.
          </p>
          <StartPracticeButton className={ctaClass}>Start practice {arrow}</StartPracticeButton>
        </section>
      </main>
    </div>
  );
}
