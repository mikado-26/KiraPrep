export default function KiraPreview() {
  return (
    <div className="bg-white border border-[#d1d9e6] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      {/* Progress bar */}
      <div className="h-[3px] bg-[#e2e8f0] relative">
        <div className="absolute left-0 top-0 h-full w-1/4 bg-brand" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-[14px] py-[9px] border-b border-[#f0f4f8]">
        <div className="text-[13px] font-bold text-brand flex items-center gap-[5px]">
          <span className="w-[7px] h-[7px] rounded-full bg-brand inline-block" />
          00:43 remaining
        </div>
        <div className="text-[11px] text-[#94a3b8] flex items-center gap-1">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Help
        </div>
      </div>

      {/* Body */}
      <div className="flex">
        {/* Main area */}
        <div className="flex-1 min-w-0">
          {/* Camera area */}
          <div className="bg-[#141e2d] h-[155px] flex items-center justify-center relative">
            <div className="w-[38px] h-[38px] rounded-md bg-white/[0.06] border border-white/[0.12] flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div className="absolute top-[9px] left-[12px] bg-brand/90 text-white text-[9px] font-bold py-[3px] px-[9px] rounded-[10px] flex items-center gap-1">
              <span className="w-[5px] h-[5px] rounded-full bg-white inline-block" />
              Recording
            </div>
          </div>

          {/* Question */}
          <div className="px-[14px] py-[10px] text-[11.5px] text-[#334155] leading-[1.6] border-b border-[#f0f4f8] text-center">
            Q1. What is something you are incredibly passionate about? Can you
            share the story of how you discovered this passion and why it means
            so much to you?
          </div>

          {/* Footer */}
          <div className="flex items-center px-[14px] py-2 gap-[14px]">
            <div className="text-[9px] text-[#94a3b8] leading-[1.4]">
              <strong className="block text-[11px] text-[#334155] font-semibold">
                Video
              </strong>
              TYPE
            </div>
            <div className="w-px h-5 bg-[#e2e8f0]" />
            <div className="text-[9px] text-[#94a3b8] leading-[1.4]">
              <strong className="block text-[11px] text-[#334155] font-semibold">
                30s
              </strong>
              PREP
            </div>
            <div className="w-px h-5 bg-[#e2e8f0]" />
            <div className="text-[9px] text-[#94a3b8] leading-[1.4]">
              <strong className="block text-[11px] text-[#334155] font-semibold">
                1m 30s
              </strong>
              RESPONSE
            </div>
            <button className="ml-auto bg-brand text-white text-[10px] font-bold py-[6px] px-4 rounded-md border-none">
              Submit
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-[90px] border-l border-[#f0f4f8] px-2 py-[10px] flex flex-col bg-white shrink-0">
          <div className="text-[9px] text-[#64748b] font-semibold mb-2 whitespace-nowrap">
            Practice
          </div>
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`flex items-center gap-[5px] py-[5px] px-1 rounded-md whitespace-nowrap ${
                n === 1 ? "bg-brand-light" : ""
              }`}
            >
              <span
                className={`w-[11px] h-[11px] rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center ${
                  n === 1 ? "border-brand" : "border-[#d1d9e6]"
                }`}
              >
                {n === 1 && (
                  <span className="w-1 h-1 rounded-full bg-brand inline-block" />
                )}
              </span>
              <span
                className={`text-[9px] whitespace-nowrap ${
                  n === 1 ? "text-brand font-semibold" : "text-[#64748b]"
                }`}
              >
                Question {n}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
