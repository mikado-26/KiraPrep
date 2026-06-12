"use client";

import { useState } from "react";

interface EmailGateProps {
  onSubmit: (email: string) => void;
}

export default function EmailGate({ onSubmit }: EmailGateProps) {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      onSubmit(email.trim());
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white border border-[#e2e8f0] p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-[#0f172a]">Save your progress</h2>
        <p className="mt-2 text-[#64748b]">
          Enter your email to start practicing. No password needed.
        </p>
        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[#0f172a] placeholder-[#94a3b8] focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            autoFocus
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-brand py-3 font-semibold text-white transition hover:bg-[#1d4ed8]"
          >
            Start Practicing
          </button>
        </form>
      </div>
    </div>
  );
}
