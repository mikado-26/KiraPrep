import { renderOg, ogSize } from "@/lib/og";
import { getActiveSchools } from "@/lib/data";

export const alt = "KiraPrep — Practice real MBA Kira interview questions";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  const n = getActiveSchools().length;
  return renderOg({
    eyebrow: `${n} MBA programs · Free to start`,
    title: "Practice real Kira interview questions",
    subtitle: "Same countdown timer, camera format, and pressure as the real thing.",
  });
}
