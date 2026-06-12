"use client";

import { createClient } from "@/lib/supabase";

export default function AuthGate() {
  async function handleGoogleSignIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`,
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white border border-[#e2e8f0] p-8 shadow-xl">
        {/* Icon */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#eff6ff] border border-[#dbeafe]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </div>

        <h2 className="text-center text-[22px] font-bold text-[#0f172a]">
          Sign in to practice
        </h2>
        <p className="mt-2 text-center text-[14px] text-[#64748b] leading-[1.6]">
          Track your progress, save your history, and pick up where you left off.
        </p>

        {/* Benefits */}
        <ul className="mt-5 space-y-[10px]">
          {[
            "Save your practice history across all schools",
            "Track how many questions you've completed",
            "Resume practice on any device",
          ].map((benefit) => (
            <li key={benefit} className="flex items-start gap-[10px] text-[13px] text-[#475569]">
              <svg className="mt-[2px] shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {benefit}
            </li>
          ))}
        </ul>

        {/* Google sign-in button */}
        <button
          onClick={handleGoogleSignIn}
          className="mt-6 w-full flex items-center justify-center gap-3 rounded-lg border border-[#e2e8f0] bg-white py-[13px] text-[15px] font-medium text-[#0f172a] shadow-sm hover:bg-[#f8fafc] transition cursor-pointer"
        >
          {/* Google logo */}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <p className="mt-4 text-center text-[12px] text-[#94a3b8]">
          No password needed. Sign in takes 5 seconds.
        </p>
      </div>
    </div>
  );
}
