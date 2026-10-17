import Link from "next/link";
import TipsArticle, { tipMetadata, H2, H3, P, UL, OL, Callout } from "@/components/TipsArticle";
import { getTip } from "@/lib/tips";

const tip = getTip("how-to-prepare");
export const metadata = tipMetadata(tip);

export default function HowToPrepare() {
  return (
    <TipsArticle tip={tip}>
      <P>
        The Kira video interview gives you one take per question, a short countdown to
        think, and a camera that starts recording on its own. Good preparation is less
        about memorizing answers and more about getting used to the format. Here is a plan
        you can follow in the week before your assessment.
      </P>

      <H2>1. Know your school&apos;s exact format</H2>
      <P>
        Every program sets its own number of questions, prep time and answer time. A
        90-second answer and a 3-minute answer need very different structures. Check your
        school&apos;s instructions and the{" "}
        <Link href="/tips/what-is-kira" className="text-brand font-medium hover:underline">
          format table in our Kira guide
        </Link>
        , then practice with exactly those timings.
      </P>

      <H2>2. Build a bank of 6–8 stories</H2>
      <P>
        Most Kira questions can be answered with a story you already know well. Before you
        practice, write down a few bullet points for each of these:
      </P>
      <UL>
        <li>A time you led a team or took initiative</li>
        <li>A failure or mistake, and what you changed afterwards</li>
        <li>A conflict or disagreement you resolved</li>
        <li>A time you worked across cultures or with very different people</li>
        <li>Something you are genuinely passionate about outside work</li>
        <li>Your short-term goal, and why an MBA and this school</li>
      </UL>
      <P>
        Keep them as bullets, not scripts. In the real assessment you will adapt a story to
        whatever question appears, and scripts tend to sound recited on camera.
      </P>

      <H2>3. Use the prep window with a simple structure</H2>
      <P>
        Thirty seconds goes fast. Decide on one structure in advance so you only have to
        pick the story, not invent the shape of the answer:
      </P>
      <OL>
        <li>
          <strong className="text-[#0f172a]">Answer first.</strong> One sentence that
          directly answers the question.
        </li>
        <li>
          <strong className="text-[#0f172a]">One example.</strong> The situation, what you
          did, and the result, in a few sentences.
        </li>
        <li>
          <strong className="text-[#0f172a]">Why it matters.</strong> What you learned or
          how it connects to who you are now.
        </li>
      </OL>
      <P>
        For 60–90 second answers, one example is enough. For 2–3 minute answers, add more
        detail on what you did and the outcome rather than a second story.
      </P>

      <H2>4. Practice under real timing</H2>
      <P>
        This is the step most applicants skip, and the one that makes the biggest
        difference. Answering in your head is not the same as answering on camera with a
        countdown.
      </P>
      <UL>
        <li>Do at least three full timed sessions before the real assessment.</li>
        <li>Don&apos;t pause or restart. Get used to recovering mid-answer.</li>
        <li>Watch your recordings back once and note one thing to fix each time.</li>
        <li>Practice questions you haven&apos;t seen, so you get used to the surprise.</li>
      </UL>
      <Callout>
        KiraPrep shows real questions from your school with the same prep timer and
        one-take recording.{" "}
        <Link href="/" className="font-semibold underline">
          Pick your school
        </Link>{" "}
        and start a session.
      </Callout>

      <H2>5. Set up your camera and room</H2>
      <H3>Camera and framing</H3>
      <UL>
        <li>Put the camera at eye level. Stack books under a laptop if needed.</li>
        <li>Frame yourself from mid-chest up, with a little space above your head.</li>
        <li>Look at the camera lens, not at your own face on screen.</li>
      </UL>
      <H3>Light and sound</H3>
      <UL>
        <li>Face a window or lamp. Avoid a bright window behind you.</li>
        <li>Choose a quiet room and close other apps that might make noise.</li>
        <li>Use wired earphones with a mic if your laptop mic picks up echo.</li>
      </UL>
      <H3>Background and dress</H3>
      <UL>
        <li>Keep the background plain and tidy.</li>
        <li>Dress as you would for an interview with the school.</li>
      </UL>

      <H2>6. On the day</H2>
      <UL>
        <li>Use a stable internet connection, wired if possible.</li>
        <li>Use the practice question to check your setup one last time.</li>
        <li>Keep a glass of water nearby and silence your phone.</li>
        <li>
          If you stumble, keep going. A calm recovery looks better than a perfect but stiff
          answer.
        </li>
      </UL>

      <H2>Common mistakes to avoid</H2>
      <UL>
        <li>Reading from notes on screen. Eye movement is easy to spot on video.</li>
        <li>Spending the whole answer on background and running out of time.</li>
        <li>Giving the same story to every question.</li>
        <li>Practicing only without a timer, then freezing on the real countdown.</li>
      </UL>
    </TipsArticle>
  );
}
