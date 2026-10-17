"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import AuthGate from "./AuthGate";
import PracticeScreen from "./PracticeScreen";

/** Other buttons on the page call startPractice() to open the same flow. */
const START_EVENT = "kiraprep:start-practice";
export function startPractice() {
  window.dispatchEvent(new Event(START_EVENT));
}

interface Props {
  school: {
    school_id: string;
    display_name: string;
    slug: string;
    batch_size: number;
    prep_sec: number;
    answer_sec: number;
  };
  formatCycle: string;
  questions: { id: number; text: string; year?: number }[];
}

function fmt(s: number) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

function clock(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Kira-style preview of the first question. "Start practice" asks the visitor
 * to sign in (if needed), then PracticeScreen asks for the camera and runs the
 * session as a full-screen layer on this same page.
 */
export default function SchoolPractice({ school, formatCycle, questions }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [started, setStarted] = useState(false);

  // Refs so the start handler always sees the latest auth state.
  const userRef = useRef<User | null>(null);
  const authCheckedRef = useRef(false);
  const pendingStartRef = useRef(false);

  const openFor = useCallback((u: User | null) => {
    if (u) setStarted(true);
    else setShowAuth(true);
  }, []);

  useEffect(() => {
    // Coming back from Google sign-in (or an old /practice link): ?start=1
    const params = new URLSearchParams(window.location.search);
    if (params.get("start") === "1") {
      pendingStartRef.current = true;
      params.delete("start");
      const qs = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      userRef.current = data.user;
      authCheckedRef.current = true;
      setUser(data.user);
      if (pendingStartRef.current) {
        pendingStartRef.current = false;
        openFor(data.user);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      userRef.current = session?.user ?? null;
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [openFor]);

  const requestStart = useCallback(() => {
    if (!authCheckedRef.current) {
      pendingStartRef.current = true; // resolved once getUser() returns
      return;
    }
    openFor(userRef.current);
  }, [openFor]);

  useEffect(() => {
    window.addEventListener(START_EVENT, requestStart);
    return () => window.removeEventListener(START_EVENT, requestStart);
  }, [requestStart]);

  // Lock page scroll while the practice layer is open.
  useEffect(() => {
    if (!started) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [started]);

  const first = questions[0];
  const total = Math.max(1, school.batch_size);

  return (
    <>
      <div className="bg-white border border-[#d1d9e6] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        {/* Progress bar */}
        <div className="h-[3px] bg-[#e2e8f0] relative">
          <div className="absolute left-0 top-0 h-full bg-brand" style={{ width: `${100 / total}%` }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-[10px] border-b border-[#f0f4f8]">
          <div className="text-[13px] font-bold text-brand flex items-center gap-[6px]">
            <span className="w-[7px] h-[7px] rounded-full bg-brand inline-block" />
            {clock(school.prep_sec)} to prepare
          </div>
          <div className="text-[12px] text-[#94a3b8]">
            Question 1 of {total}
          </div>
        </div>

        <div className="flex">
          <div className="flex-1 min-w-0">
            {/* Camera area with the start button */}
            <div className="bg-[#141e2d] h-[200px] sm:h-[230px] flex flex-col items-center justify-center gap-4 relative px-4">
              <button
                onClick={requestStart}
                className="inline-flex items-center gap-2 bg-brand text-white text-[15px] font-semibold px-6 py-3 rounded-[10px] hover:bg-[#1d4ed8] transition-colors cursor-pointer shadow-lg"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M6 4l14 8-14 8z" />
                </svg>
                Start practice — free
              </button>
              <p className="text-[12px] text-white/50 text-center">
                Sign in with Google, then allow your camera. Your video never leaves your device.
              </p>
            </div>

            {/* Question */}
            {first && (
              <div className="px-4 sm:px-6 py-4 text-[14px] sm:text-[15px] text-[#334155] leading-[1.6] border-b border-[#f0f4f8] text-center">
                <span className="font-semibold text-[#0f172a]">Q1.</span> {first.text}
              </div>
            )}

            {/* Footer: the real format */}
            <div className="flex flex-wrap items-center px-4 py-3 gap-x-4 gap-y-2">
              {[
                ["Video", "Type"],
                [fmt(school.prep_sec), "Prep"],
                [fmt(school.answer_sec), "Response"],
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
              <span className="ml-auto text-[11px] text-[#94a3b8]">{formatCycle} format</span>
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden sm:flex w-[110px] border-l border-[#f0f4f8] px-2 py-3 flex-col bg-white shrink-0">
            <div className="text-[10px] text-[#64748b] font-semibold mb-2">Practice</div>
            {Array.from({ length: Math.min(total, 6) }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                className={`flex items-center gap-[6px] py-[5px] px-1 rounded-md ${n === 1 ? "bg-brand-light" : ""}`}
              >
                <span
                  className={`w-[11px] h-[11px] rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center ${
                    n === 1 ? "border-brand" : "border-[#d1d9e6]"
                  }`}
                >
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

      {showAuth && !user && (
        <AuthGate
          nextPath={`/${school.slug}?start=1`}
          onClose={() => setShowAuth(false)}
        />
      )}

      {started && user && (
        <div className="fixed inset-0 z-40 bg-white overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[#e2e8f0]">
            <div className="max-w-[1080px] mx-auto px-5 sm:px-8 py-2">
              <button
                onClick={() => setStarted(false)}
                className="text-[13px] text-[#64748b] hover:text-brand flex items-center gap-1 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Exit practice · back to {school.display_name} questions
              </button>
            </div>
          </div>
          <PracticeScreen school={school} questions={questions} />
        </div>
      )}
    </>
  );
}

/** A CTA button anywhere on the page that opens the same practice flow. */
export function StartPracticeButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button onClick={startPractice} className={className}>
      {children}
    </button>
  );
}
