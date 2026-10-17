import Link from "next/link";
import TipsArticle, { tipMetadata, H2, P, UL, Callout } from "@/components/TipsArticle";
import { getActiveSchools, getQuestionCount } from "@/lib/data";
import { getTip } from "@/lib/tips";

const tip = getTip("what-is-kira");
export const metadata = tipMetadata(tip);

function fmt(s: number) {
  if (s < 60) return `${s} sec`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m} min ${r} sec` : `${m} min`;
}

export default function WhatIsKira() {
  const schools = getActiveSchools();

  return (
    <TipsArticle tip={tip}>
      <P>
        Kira Talent is an online assessment platform that business schools use to see
        applicants beyond their written application. Instead of another essay, you answer
        questions on camera, under a timer, with no chance to re-record. For many MBA
        programs it is the first time the admissions committee sees and hears you.
      </P>

      <H2>How the Kira assessment works</H2>
      <P>
        After you submit your application, the school emails you a private link. You
        complete the assessment on your own computer, any time before the deadline. A
        typical session looks like this:
      </P>
      <UL>
        <li>
          <strong className="text-[#0f172a]">System check.</strong> You allow camera and
          microphone access and confirm your setup works.
        </li>
        <li>
          <strong className="text-[#0f172a]">Practice question.</strong> Most schools give
          you a practice question that is not sent to admissions. Use it to check lighting,
          audio and framing.
        </li>
        <li>
          <strong className="text-[#0f172a]">Preparation timer.</strong> Each real question
          appears on screen with a short countdown to think, usually 30 to 60 seconds.
        </li>
        <li>
          <strong className="text-[#0f172a]">Recording.</strong> When the countdown ends,
          recording starts automatically. You answer within a fixed time limit, usually 60
          to 180 seconds.
        </li>
        <li>
          <strong className="text-[#0f172a]">One take.</strong> There is no pause, no
          playback and no retry. The next question appears once you move on.
        </li>
      </UL>
      <P>
        Some schools also include timed written questions in the same session. Always read
        the instructions in your school&apos;s email, because each program sets its own
        number of questions and time limits.
      </P>

      <H2>How long is the Kira interview?</H2>
      <P>
        Most sessions take 15 to 30 minutes including the system check. The recorded part
        is short: a handful of questions at one to three minutes each. Here is the format
        applicants have reported for each school we cover:
      </P>

      <div className="my-6 overflow-x-auto border border-[#e2e8f0] rounded-[10px]">
        <table className="w-full text-[14px] text-left">
          <thead className="bg-[#f8fafc] text-[#0f172a]">
            <tr>
              <th className="font-semibold px-4 py-3">School</th>
              <th className="font-semibold px-4 py-3">Video questions</th>
              <th className="font-semibold px-4 py-3">Prep time</th>
              <th className="font-semibold px-4 py-3">Answer time</th>
              <th className="font-semibold px-4 py-3">Cycle</th>
            </tr>
          </thead>
          <tbody className="text-[#475569]">
            {schools.map((s) => (
              <tr key={s.slug} className="border-t border-[#e2e8f0]">
                <td className="px-4 py-3">
                  <Link href={`/${s.slug}`} className="text-brand font-medium hover:underline">
                    {s.display_name}
                  </Link>
                </td>
                <td className="px-4 py-3">{s.batch_size}</td>
                <td className="px-4 py-3 whitespace-nowrap">{fmt(s.prep_sec)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{fmt(s.answer_sec)}</td>
                <td className="px-4 py-3">{s.format_year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>
        Formats can change between application cycles, so treat this as a guide and
        confirm with your school&apos;s instructions.
      </P>

      <H2>What kind of questions does Kira ask?</H2>
      <P>
        Kira questions are short and personal. They are designed to show how you think on
        your feet, not to test knowledge. The most common types are:
      </P>
      <UL>
        <li>
          <strong className="text-[#0f172a]">Motivation:</strong> why an MBA, why this
          school, what you want to do after.
        </li>
        <li>
          <strong className="text-[#0f172a]">Behavioral:</strong> a time you failed, led a
          team, handled conflict or got difficult feedback.
        </li>
        <li>
          <strong className="text-[#0f172a]">Personality:</strong> what you are passionate
          about, what your friends would say about you.
        </li>
        <li>
          <strong className="text-[#0f172a]">Situational:</strong> what you would do in a
          hypothetical scenario, often involving culture or ethics.
        </li>
      </UL>
      <P>
        You can browse real questions reported by applicants on each school page. We have{" "}
        {schools.reduce((n, s) => n + getQuestionCount(s.school_id), 0)} questions across{" "}
        {schools.length} programs.
      </P>

      <H2>What are schools looking for?</H2>
      <P>
        Admissions teams use Kira to check things a written essay can&apos;t show: how
        clearly you communicate, how you handle pressure, whether you come across as
        genuine, and whether your answers match the person in your application. A polished,
        memorized speech often does worse than a clear, natural answer with one concrete
        example.
      </P>

      <Callout>
        <strong>The hardest part is the format, not the questions.</strong> A 30-second
        countdown followed by a camera that won&apos;t stop feels very different from
        answering the same question in your head. Practicing under the same timer is the
        most reliable way to stop freezing.
      </Callout>

      <H2>Can you practice the Kira interview?</H2>
      <P>
        Kira&apos;s own practice question gives you a feel for the interface, but it is
        generic and you only see it once. To practice properly, answer real
        school-specific questions with the same prep and answer timers.{" "}
        <Link href="/tips/how-to-prepare" className="text-brand font-medium hover:underline">
          Our preparation guide
        </Link>{" "}
        walks through a step-by-step plan.
      </P>
    </TipsArticle>
  );
}
