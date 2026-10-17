import schoolsData from "@/data/schools.json";
import questionsData from "@/data/questions.json";
import formatsData from "@/data/school_formats.json";

/** Static school info (does not change between intakes). */
export interface SchoolBase {
  school_id: string;
  display_name: string;
  slug: string;
  active: string;
}

/**
 * Kira format for one school for one intake.
 * Schools change the number of questions and the timers from intake to
 * intake, so each (school_id, intake_year) pair gets its own row in
 * school_formats.json. A null field means "not confirmed for this intake":
 * it carries forward from the most recent earlier intake that has it.
 */
export interface SchoolFormat {
  school_id: string;
  intake_year: number;
  batch_size: number | null;
  prep_sec: number | null;
  answer_sec: number | null;
  written_count?: number | null;
  written_sec?: number | null;
  verified?: boolean;
  source: string;
}

/** A format with every field resolved (no nulls). */
export interface ResolvedFormat {
  batch_size: number;
  prep_sec: number;
  answer_sec: number;
  /** The intake this format applies to. */
  intake_year: number;
}

/** A school merged with its most recent format. */
export interface School extends SchoolBase {
  batch_size: number;
  prep_sec: number;
  answer_sec: number;
  /** The intake the format above comes from. */
  format_intake: number;
}

export interface Question {
  id: number;
  school_id: string;
  text: string;
  category: string;
  /** Year the question was reported (internal, not shown to users). */
  year: number;
  /** Month 1-12 the question was reported; missing if unknown. */
  month?: number | null;
  /** Manual intake, e.g. for January-intake schools. Wins over the derived one. */
  intake_override?: number | null;
  source: string;
  source_url: string;
  status: string;
}

/** Month from which a report counts toward the following year's intake. */
export const INTAKE_CUTOFF_MONTH = 8;

/**
 * Intake a question belongs to. Reported Aug-Dec counts toward next year's
 * intake, Jan-Jul toward the same year's. Unknown month gives undefined
 * rather than a guess. Same rule as the Google Sheet and Supabase.
 */
export function getIntake(q: Question): number | undefined {
  if (q.intake_override) return q.intake_override;
  if (!q.year || !q.month) return undefined;
  return q.month >= INTAKE_CUTOFF_MONTH ? q.year + 1 : q.year;
}

export const formats: SchoolFormat[] = formatsData as SchoolFormat[];
export const questions: Question[] = questionsData as Question[];

/** All formats for a school, newest intake first. */
export function getSchoolFormats(schoolId: string): SchoolFormat[] {
  return formats
    .filter((f) => f.school_id === schoolId)
    .sort((a, b) => b.intake_year - a.intake_year);
}

/**
 * Format for a school for a given intake. Each field comes from the newest
 * intake at or before the requested one that has a value for it, so formats
 * carry forward until they change. With no intake (or one older than any
 * known format), the oldest known values are used as a last resort; with no
 * intake at all, the latest format is returned.
 */
export function getSchoolFormat(
  schoolId: string,
  intake?: number
): ResolvedFormat {
  const all = getSchoolFormats(schoolId);
  if (all.length === 0) {
    throw new Error(`No Kira format in school_formats.json for "${schoolId}"`);
  }
  const eligible =
    intake === undefined ? all : all.filter((f) => f.intake_year <= intake);
  // Newest eligible first, then the rest (oldest data as last resort).
  const order = [...eligible, ...all.filter((f) => !eligible.includes(f)).reverse()];

  const pick = (key: "batch_size" | "prep_sec" | "answer_sec"): number => {
    const hit = order.find((f) => f[key] != null);
    if (!hit) {
      throw new Error(`No ${key} in school_formats.json for "${schoolId}"`);
    }
    return hit[key] as number;
  };

  return {
    batch_size: pick("batch_size"),
    prep_sec: pick("prep_sec"),
    answer_sec: pick("answer_sec"),
    intake_year: (eligible[0] ?? order[0]).intake_year,
  };
}

function withFormat(base: SchoolBase, intake?: number): School {
  const f = getSchoolFormat(base.school_id, intake);
  return {
    ...base,
    batch_size: f.batch_size,
    prep_sec: f.prep_sec,
    answer_sec: f.answer_sec,
    format_intake: f.intake_year,
  };
}

const schoolBases: SchoolBase[] = schoolsData as SchoolBase[];
export const schools: School[] = schoolBases.map((s) => withFormat(s));

export function getActiveSchools(): School[] {
  return schools.filter((s) => s.active === "yes");
}

export function getSchoolBySlug(slug: string, intake?: number): School | undefined {
  const base = schoolBases.find((s) => s.slug === slug);
  return base ? withFormat(base, intake) : undefined;
}

export function getSchoolById(id: string, intake?: number): School | undefined {
  const base = schoolBases.find((s) => s.school_id === id);
  return base ? withFormat(base, intake) : undefined;
}

export function getQuestionsBySchool(schoolId: string): Question[] {
  return questions.filter(
    (q) => q.school_id === schoolId && q.status === "active"
  );
}

/** Newest intake first; questions with no known intake last. */
export function getQuestionsBySchoolSorted(schoolId: string): Question[] {
  return getQuestionsBySchool(schoolId).sort((a, b) => {
    const ia = getIntake(a) ?? -Infinity;
    const ib = getIntake(b) ?? -Infinity;
    if (ib !== ia) return ib - ia;
    return b.id - a.id;
  });
}

export function getQuestionCount(schoolId: string): number {
  return getQuestionsBySchool(schoolId).length;
}

/** One practice batch: the questions of one intake, with that intake's format. */
export interface PracticeBatch {
  /** Intake year, or null when the reported month is unknown. */
  intake: number | null;
  batch_size: number;
  prep_sec: number;
  answer_sec: number;
  questions: { id: number; text: string }[];
}

/**
 * Practice batches for a school, newest intake first, unknown intake last.
 * Each batch uses its own intake's format. A batch never asks for more
 * questions than that intake has, so a set never repeats a question.
 */
export function getPracticeBatches(schoolId: string): PracticeBatch[] {
  const groups = new Map<number | null, Question[]>();
  for (const q of getQuestionsBySchoolSorted(schoolId)) {
    const key = getIntake(q) ?? null;
    const list = groups.get(key) ?? [];
    list.push(q);
    groups.set(key, list);
  }

  // Map keeps insertion order, which follows the sorted questions.
  return [...groups.entries()].map(([intake, qs]) => {
    const f = getSchoolFormat(schoolId, intake ?? undefined);
    return {
      intake,
      batch_size: Math.min(f.batch_size, qs.length),
      prep_sec: f.prep_sec,
      answer_sec: f.answer_sec,
      questions: qs.map((q) => ({ id: q.id, text: q.text })),
    };
  });
}
