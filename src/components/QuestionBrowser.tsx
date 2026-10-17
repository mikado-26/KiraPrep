"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import AuthGate from "./AuthGate";

export interface QuestionGroup {
  startYear: number;
  label: string; // "2026–27"
  isCurrent: boolean;
  questions: { id: number; text: string; category: string }[];
}

type Filter = { kind: "all" } | { kind: "cycle"; year: number } | { kind: "cat"; name: string };

const FREE_VISIBLE = 3;

export default function QuestionBrowser({
  groups,
  schoolName,
  slug,
}: {
  groups: QuestionGroup[];
  schoolName: string;
  slug: string;
}) {
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [signedIn, setSignedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s?.user));
    return () => l.subscription.unsubscribe();
  }, []);

  // Rank every question in page order so filtering never unlocks extra questions.
  const rank = useMemo(() => {
    const m = new Map<number, number>();
    let i = 0;
    for (const g of groups) for (const q of g.questions) m.set(q.id, i++);
    return m;
  }, [groups]);

  const total = rank.size;

  const categories = useMemo(() => {
    const c = new Map<string, number>();
    for (const g of groups)
      for (const q of g.questions)
        if (q.category && q.category !== "General") c.set(q.category, (c.get(q.category) ?? 0) + 1);
    return [...c.entries()].sort((a, b) => b[1] - a[1]);
  }, [groups]);

  const tag = (active: boolean) =>
    `text-[13px] font-medium rounded-full px-4 py-[6px] border transition-colors cursor-pointer ${
      active
        ? "bg-brand text-white border-brand"
        : "bg-white text-[#475569] border-[#e2e8f0] hover:border-brand-border-dark hover:text-brand"
    }`;

  const isActive = (f: Filter) => JSON.stringify(f) === JSON.stringify(filter);

  const visibleGroups = groups
    .filter((g) => filter.kind !== "cycle" || filter.year === g.startYear)
    .map((g) => ({
      ...g,
      shown: filter.kind === "cat" ? g.questions.filter((q) => q.category === filter.name) : g.questions,
    }))
    .filter((g) => g.shown.length > 0);

  // The first locked question on screen carries the "sign in" button.
  const firstLockedId = signedIn
    ? undefined
    : visibleGroups.flatMap((g) => g.shown).find((q) => (rank.get(q.id) ?? 0) >= FREE_VISIBLE)?.id;

  return (
    <div id="questions">
      {/* Tags */}
      <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Filter questions">
        <button className={tag(isActive({ kind: "all" }))} onClick={() => setFilter({ kind: "all" })}>
          All ({total})
        </button>
        {groups.map((g) => (
          <button
            key={g.startYear}
            className={tag(isActive({ kind: "cycle", year: g.startYear }))}
            onClick={() => setFilter({ kind: "cycle", year: g.startYear })}
          >
            {g.label}
            {g.isCurrent ? " · new" : ""} ({g.questions.length})
          </button>
        ))}
        {categories.map(([name, n]) => (
          <button
            key={name}
            className={tag(isActive({ kind: "cat", name }))}
            onClick={() => setFilter({ kind: "cat", name })}
          >
            {name} ({n})
          </button>
        ))}
      </div>

      {visibleGroups.map((g) => {
        const qs = g.shown;
        return (
          <section key={g.startYear} className="mt-8">
            <h2 className="font-[family-name:var(--font-dm-serif)] text-[22px] text-[#0f172a] mb-1">
              {schoolName} Kira questions — {g.label} cycle
            </h2>
            <p className="text-[13px] text-[#94a3b8] mb-4">
              {g.startYear + 1} intake · {g.questions.length} question{g.questions.length === 1 ? "" : "s"} reported by applicants
            </p>
            <ol className="flex flex-col gap-3">
              {qs.map((q) => {
                const r = rank.get(q.id) ?? 0;
                const locked = !signedIn && r >= FREE_VISIBLE;
                const showLock = q.id === firstLockedId;
                return (
                  <li key={q.id} className="bg-white border border-[#e2e8f0] rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="mt-[2px] flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-brand-light border border-brand-border text-[12px] font-semibold text-brand">
                        {r + 1}
                      </span>
                      <div className="flex-1 min-w-0 relative">
                        <p
                          className={`text-[14px] text-[#1e293b] leading-[1.65] ${locked ? "blur-sm select-none" : ""}`}
                          aria-hidden={locked || undefined}
                        >
                          {q.text}
                        </p>
                        {!locked && q.category && q.category !== "General" && (
                          <span className="mt-2 inline-block text-[12px] text-[#94a3b8]">{q.category}</span>
                        )}
                        {showLock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <button
                              onClick={() => setShowAuth(true)}
                              className="bg-white border border-[#e2e8f0] rounded-full px-4 py-[7px] text-[13px] font-medium text-[#475569] shadow-sm hover:text-brand cursor-pointer"
                            >
                              🔒 Sign in to see all {total} questions
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      {showAuth && !signedIn && (
        <AuthGate nextPath={`/${slug}`} onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
}
