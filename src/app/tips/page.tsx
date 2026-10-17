import type { Metadata } from "next";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { tips } from "@/lib/tips";

const title = "Kira Interview Tips & Preparation Guide | KiraPrep";
const description =
  "Step-by-step guides, camera setup, timing strategies, and the Kira format at INSEAD, Kellogg, Oxford, LBS and other MBA programs.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://kiraprep.com/tips" },
  openGraph: { title, description, url: "https://kiraprep.com/tips", siteName: "KiraPrep", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function TipsHub() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://kiraprep.com" },
      { "@type": "ListItem", position: 2, name: "Kira Interview Tips", item: "https://kiraprep.com/tips" },
    ],
  };

  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <NavBar />
      <main className="max-w-[720px] mx-auto px-5 sm:px-8 pt-10 pb-20">
        <h1 className="font-[family-name:var(--font-dm-serif)] text-[34px] sm:text-[40px] leading-[1.1] text-[#0f172a] mb-3 tracking-[-0.5px]">
          How to Ace Your Kira Video Interview
        </h1>
        <p className="text-[15px] text-[#64748b] leading-[1.6] mb-10">
          Guides to the Kira Talent format, how to prepare, and what schools are looking for.
        </p>
        <div className="flex flex-col gap-4">
          {tips.map((t) => (
            <Link
              key={t.slug}
              href={`/tips/${t.slug}`}
              className="group block border border-[#e2e8f0] rounded-[14px] p-6 hover:border-brand-border-dark hover:shadow-sm transition-all"
            >
              <span className="block font-[family-name:var(--font-dm-serif)] text-[22px] text-[#0f172a] group-hover:text-brand transition-colors">
                {t.h1}
              </span>
              <span className="block text-[14px] text-[#64748b] leading-[1.6] mt-2">{t.summary}</span>
              <span className="block text-[13px] text-[#94a3b8] mt-3">{t.readMinutes} min read</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
