"use client";

export default function FeedbackButton() {
  return (
    <a
      href="mailto:kiraprep.io@gmail.com?subject=KiraPrep Feedback"
      className="fixed bottom-5 right-5 z-50 rounded-full bg-[#f8fafc] border border-[#e2e8f0] px-4 py-2 text-sm text-[#64748b] shadow-lg transition hover:bg-[#e2e8f0] hover:text-[#334155]"
    >
      Feedback
    </a>
  );
}
