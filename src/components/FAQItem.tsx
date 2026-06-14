"use client";

import { useState } from "react";

interface Props {
  label: string;
  heading: string;
  sub: string;
  kicker?: string;
  collapsible?: boolean;
}

export default function FAQItem({ label, heading, sub, kicker, collapsible }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-6 flex flex-col gap-2">
      <span className="text-[19px] font-semibold text-brand">{label}</span>
      <h3 className="font-[family-name:var(--font-dm-serif)] text-[24px] text-[#0f172a] leading-[1.2]">
        {heading}
      </h3>

      {collapsible ? (
        <>
          <p className={`text-[15px] text-[#334155] leading-[1.7] ${open ? "" : "line-clamp-2"}`}>
            {sub}{kicker ? " " + kicker : ""}
          </p>
          <button
            onClick={() => setOpen(!open)}
            className="text-[13px] font-semibold text-brand text-left w-fit mt-1 cursor-pointer"
          >
            {open ? "Read less ↑" : "Read more ↓"}
          </button>
        </>
      ) : (
        <>
          <p className="text-[15px] text-[#334155] leading-[1.7]">{sub}</p>
          {kicker && <p className="text-[15px] text-[#334155] leading-[1.7]">{kicker}</p>}
        </>
      )}
    </div>
  );
}
