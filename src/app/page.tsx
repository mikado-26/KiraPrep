import type { Metadata } from "next";
import Link from "next/link";
import { getActiveSchools } from "@/lib/data";
import NavBar from "@/components/NavBar";
import KiraPreview from "@/components/KiraPreview";
import FAQItem from "@/components/FAQItem";

export const metadata: Metadata = {
  title: "Kira Interview Practice — Real MBA Questions 2026 | KiraPrep",
  description:
    "Practice real Kira video questions from INSEAD, Kellogg, Harvard and more. Same countdown timer, camera format, and pressure as the actual interview. Free to start.",
  openGraph: {
    title: "Kira Interview Practice — Real MBA Questions 2026 | KiraPrep",
    description:
      "Practice real Kira video questions from INSEAD, Kellogg, Harvard and more. Same countdown timer, camera format, and pressure as the actual interview. Free to start.",
    url: "https://kiraprep.com",
    siteName: "KiraPrep",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kira Interview Practice — Real MBA Questions 2026 | KiraPrep",
    description:
      "Practice real Kira video questions from INSEAD, Kellogg, Harvard and more. Same countdown timer, camera format, and pressure as the actual interview. Free to start.",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a Kira Assessment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An on-demand video interview sent by your school after you submit your application. You have 24–36 hours to complete it. For each question, you get one take and 1–3 minutes to record your answer — no retries, no editing. The admissions team uses it to see how you think, communicate, and present yourself as a person.",
      },
    },
    {
      "@type": "Question",
      name: "What is KiraPrep?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KiraPrep lets you practice with real questions from your target schools — same timer, same camera format, same pressure as the real thing. Since you only get one take, the more you've practiced, the less you freeze.",
      },
    },
    {
      "@type": "Question",
      name: "Where do the questions of KiraPrep come from?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sourced from real applicants, Reddit, GMATClub, and partner communities. We update the bank each application cycle so questions stay current.",
      },
    },
  ],
};

function CheckIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2563eb"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}


export default function HomePage() {
  const schools = getActiveSchools();

  return (
    <main>
      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Nav */}
      <NavBar />

      {/* Hero */}
      <section className="max-w-[920px] mx-auto px-8 pt-9 pb-7">
        {/* Centered heading */}
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-dm-serif)] text-[44px] leading-[1.08] text-[#0f172a] mb-3 tracking-[-1px]">
            Practice <span className="text-brand italic">REAL</span> Kira
            Interview
          </h1>
          <p className="text-[15px] text-[#64748b] mb-[5px]">
            The only time schools see you as a &ldquo;person&rdquo; before the
            interview round.
          </p>
          <p className="text-[14px] font-medium text-brand">
            Don&apos;t waste it!
          </p>
        </div>

        {/* Two-column: bullets + preview */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-[7px] bg-[#f0fdf4] border border-[#bbf7d0] rounded-[20px] py-[6px] px-4 mb-7 text-[14px] text-[#16a34a] font-medium">
              <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e] inline-block" />
              Used by +15,000 applicants
            </div>
            <ul className="flex flex-col gap-[26px]">
              <li className="flex items-start gap-3">
                <div className="w-[22px] h-[22px] bg-brand-light border-[1.5px] border-brand-border-dark rounded-[5px] flex-shrink-0 mt-[2px] flex items-center justify-center">
                  <CheckIcon />
                </div>
                <div>
                  <strong className="block text-[16px] font-semibold text-[#0f172a] mb-1">
                    Real questions from top schools
                  </strong>
                  <span className="text-[14px] text-[#64748b] leading-[1.5]">
                    Updated every application cycle.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-[22px] h-[22px] bg-brand-light border-[1.5px] border-brand-border-dark rounded-[5px] flex-shrink-0 mt-[2px] flex items-center justify-center">
                  <CheckIcon />
                </div>
                <div>
                  <strong className="block text-[16px] font-semibold text-[#0f172a] mb-1">
                    Real Kira-style experience
                  </strong>
                  <span className="text-[14px] text-[#64748b] leading-[1.5]">
                    Same countdown, camera pressure, and format.
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Kira Preview */}
          <KiraPreview />
        </div>
      </section>

      {/* School Section */}
      <section id="schools" className="bg-brand-light py-6 px-8 pb-7">
        <div className="max-w-[920px] mx-auto">
          <h2 className="font-[family-name:var(--font-dm-serif)] text-[18px] text-[#0f172a] mb-[14px]">
            Pick your school
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-[10px]">
            {schools.map((school) => (
              <Link
                key={school.school_id}
                href={`/${school.slug}/practice`}
                className="bg-white border-[1.5px] border-brand-border rounded-[10px] py-[14px] px-3 text-center text-[14px] font-semibold text-[#1e293b] transition-colors duration-150 hover:border-brand hover:text-brand flex items-center justify-center"
              >
                {school.display_name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-8 py-14 border-t border-[#e2e8f0]">
        <div className="max-w-[920px] mx-auto flex flex-col divide-y divide-[#e2e8f0]">
          {[
            {
              label: "What is a Kira Assessment?",
              heading: "1 shot. 0 retry. ~2 minutes each answer.",
              sub: "Kira Assessment is part of your MBA application — a timed video interview sent after you pay the application fee. You have around 24 hours to complete it. 3–5 questions appear on screen and you only get one take to answer each. Schools want to see how you think on your feet, your communication, and your personality beyond written essays.",
              kicker: "Often described as the most nerve-wracking part of the MBA application. One shot. No second take.",
            },
            {
              label: "What does KiraPrep offer?",
              heading: "Practice with real questions.",
              sub: "Same countdown timer, camera format, and pressure as the actual Kira. So when it counts, you don't freeze.",
              kicker: "",
            },
            {
              label: "Where do the questions come from?",
              heading: "Sourced from real applicants.",
              sub: "Reddit, GMATClub, and applicant partners — reviewed and updated every application cycle.",
              kicker: "",
            },
          ].map((item, i) => (
            <FAQItem
              key={item.label}
              label={item.label}
              heading={item.heading}
              sub={item.sub}
              kicker={item.kicker}
              collapsible={i === 0}
            />
          ))}
        </div>
      </section>

      {/* SEO School Links */}
      <section className="border-t border-[#e2e8f0] bg-brand-light px-8 py-8">
        <div className="max-w-[920px] mx-auto">
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#94a3b8] mb-4">
            Practice by school
          </p>
          <div className="flex flex-wrap gap-[10px]">
            {[
              { label: "INSEAD Kira Questions", slug: "insead" },
              { label: "Kellogg Kira Questions", slug: "kellogg" },
              { label: "Harvard Kira Questions", slug: "harvard" },
              { label: "Oxford Saïd Kira Questions", slug: "oxford-said" },
              { label: "MIT Sloan Kira Questions", slug: "mit-sloan" },
              { label: "LBS Kira Questions", slug: "lbs" },
              { label: "Foster Kira Questions", slug: "foster" },
              { label: "Yale SOM Kira Questions", slug: "yale-som" },
              { label: "Haas Kira Questions", slug: "haas" },
              { label: "McCombs Kira Questions", slug: "mccombs" },
              { label: "IESE Kira Questions", slug: "iese" },
            ].map((s) => (
              <Link
                key={s.slug}
                href={`/${s.slug}/practice`}
                className="inline-flex items-center gap-[6px] bg-white border-[1.5px] border-brand-border text-[13px] font-medium text-[#334155] px-4 py-[7px] rounded-full hover:border-brand hover:text-brand transition-all duration-150"
              >
                {s.label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e2e8f0] py-6 px-8">
        <div className="max-w-[920px] mx-auto flex items-center justify-between">
          <span className="font-[family-name:var(--font-dm-serif)] text-[15px] text-[#1a1a1a]">
            kiraprep<span className="text-brand">.com</span>
          </span>
          <div className="flex gap-6">
            <Link href="/tips" className="text-[13px] text-[#94a3b8] hover:text-[#64748b]">
              Tips
            </Link>
            <Link href="/pricing" className="text-[13px] text-[#94a3b8] hover:text-[#64748b]">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
