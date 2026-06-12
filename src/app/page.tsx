import Link from "next/link";
import { getActiveSchools } from "@/lib/data";
import NavBar from "@/components/NavBar";
import KiraPreview from "@/components/KiraPreview";

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
    </main>
  );
}
