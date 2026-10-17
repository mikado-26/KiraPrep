import { renderOg, ogSize } from "@/lib/og";
import { getSchoolBySlug, getQuestionCount } from "@/lib/data";

export const alt = "Real MBA Kira interview questions — KiraPrep";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const school = getSchoolBySlug(slug);
  const name = school?.display_name ?? "MBA";
  const count = school ? getQuestionCount(school.school_id) : 0;
  return renderOg({
    eyebrow: `${count} real questions from applicants`,
    title: `${name} Kira Interview Questions`,
    subtitle: "Practice with the same timer and one-take camera format.",
  });
}
