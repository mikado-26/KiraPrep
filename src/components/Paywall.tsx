"use client";

import Link from "next/link";

interface PaywallProps {
  schoolSlug: string;
}

export default function Paywall({ schoolSlug }: PaywallProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white border border-[#e2e8f0] p-8 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-light border border-brand-border">
          <span className="text-3xl">🔒</span>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-[#0f172a]">
          You&apos;ve used your 3 free practices
        </h2>
        <p className="mt-2 text-[#64748b]">
          Unlock unlimited practice across all schools with lifetime access.
        </p>
        <button
          onClick={() =>
            alert(
              "Payment integration coming soon! For now, enjoy unlimited practice."
            )
          }
          className="mt-6 w-full rounded-lg bg-brand py-3 font-semibold text-white transition hover:bg-[#1d4ed8]"
        >
          Unlock Lifetime Access — $19
        </button>
        <Link
          href={`/${schoolSlug}`}
          className="mt-3 inline-block text-sm text-[#64748b] hover:text-[#0f172a] transition"
        >
          ← Back to questions
        </Link>
      </div>
    </div>
  );
}
