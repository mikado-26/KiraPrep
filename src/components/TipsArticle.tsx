import type { Metadata } from "next";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { getActiveSchools } from "@/lib/data";
import { tips, type TipArticle } from "@/lib/tips";

export function tipMetadata(t: TipArticle): Metadata {
  const url = `https://kiraprep.com/tips/${t.slug}`;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: url },
    openGraph: {
      title: t.title,
      description: t.description,
      url,
      siteName: "KiraPrep",
      type: "article",
    },
    twitter: { card: "summary_large_image", title: t.title, description: t.description },
  };
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-[family-name:var(--font-dm-serif)] text-[24px] leading-[1.2] text-[#0f172a] mt-12 mb-4">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[16px] font-semibold text-[#0f172a] mt-7 mb-2">{children}</h3>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] text-[#475569] leading-[1.75] mb-4">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc pl-5 mb-5 flex flex-col gap-2 text-[15px] text-[#475569] leading-[1.7] marker:text-brand">
      {children}
    </ul>
  );
}

export function OL({ children }: { children: React.ReactNode }) {
  return (
    <ol className="list-decimal pl-5 mb-5 flex flex-col gap-2 text-[15px] text-[#475569] leading-[1.7] marker:text-brand marker:font-semibold">
      {children}
    </ol>
  );
}

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 bg-brand-light border border-brand-border rounded-[10px] px-5 py-4 text-[14px] text-[#1e3a8a] leading-[1.7]">
      {children}
    </div>
  );
}

export default function TipsArticle({
  tip,
  children,
}: {
  tip: TipArticle;
  children: React.ReactNode;
}) {
  const url = `https://kiraprep.com/tips/${tip.slug}`;
  const schools = getActiveSchools();
  const others = tips.filter((t) => t.slug !== tip.slug);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: tip.h1,
    description: tip.description,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "KiraPrep", url: "https://kiraprep.com" },
    publisher: { "@type": "Organization", name: "KiraPrep", url: "https://kiraprep.com" },
    datePublished: tip.datePublished,
    dateModified: tip.dateModified,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://kiraprep.com" },
      { "@type": "ListItem", position: 2, name: "Kira Interview Tips", item: "https://kiraprep.com/tips" },
      { "@type": "ListItem", position: 3, name: tip.h1, item: url },
    ],
  };

  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <NavBar />

      <main className="max-w-[720px] mx-auto px-5 sm:px-8 pt-10 pb-20">
        <nav className="text-[13px] text-[#64748b] flex items-center gap-1.5">
          <Link href="/" className="hover:text-brand transition-colors">Home</Link>
          <span>/</span>
          <Link href="/tips" className="hover:text-brand transition-colors">Kira Interview Tips</Link>
        </nav>

        <h1 className="font-[family-name:var(--font-dm-serif)] text-[34px] sm:text-[40px] leading-[1.1] text-[#0f172a] mt-5 mb-3 tracking-[-0.5px]">
          {tip.h1}
        </h1>
        <p className="text-[13px] text-[#94a3b8] mb-8">
          {tip.readMinutes} min read · Updated{" "}
          {new Date(tip.dateModified).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>

        <article>{children}</article>

        {/* Practice CTA */}
        <section className="mt-14 border border-[#e2e8f0] rounded-[14px] p-6 bg-[#f8fafc]">
          <h2 className="font-[family-name:var(--font-dm-serif)] text-[22px] text-[#0f172a] mb-2">
            Practice with real questions from your school
          </h2>
          <p className="text-[14px] text-[#64748b] leading-[1.6] mb-5">
            Same countdown timer and one-take camera format as the real Kira assessment.
          </p>
          <div className="flex flex-wrap gap-2">
            {schools.map((s) => (
              <Link
                key={s.slug}
                href={`/${s.slug}`}
                className="text-[13px] font-medium text-brand bg-white border border-brand-border rounded-full px-4 py-[6px] hover:bg-brand-light transition-colors"
              >
                {s.display_name}
              </Link>
            ))}
          </div>
        </section>

        {others.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8] mb-4">
              Keep reading
            </h2>
            <div className="flex flex-col gap-3">
              {others.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tips/${t.slug}`}
                  className="block border border-[#e2e8f0] rounded-[10px] px-5 py-4 hover:border-brand-border-dark transition-colors"
                >
                  <span className="block text-[16px] font-semibold text-[#0f172a]">{t.h1}</span>
                  <span className="block text-[14px] text-[#64748b] mt-1">{t.summary}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
