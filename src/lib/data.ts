import schoolsData from "@/data/schools.json";
import questionsData from "@/data/questions.json";
import formatsData from "@/data/school_formats.json";

/** Static school info (does not change between cycles). */
export interface SchoolBase {
  school_id: string;
  display_name: string;
  slug: string;
  active: string;
}

/**
 * Kira format for one school in one application cycle.
 * Schools change the number of questions and the timers from year to year,
 * so each (school_id, year) pair gets its own row in school_formats.json.
 */
export interface SchoolFormat {
  school_id: string;
  year: number;
  batch_size: number;
  prep_sec: number;
  answer_sec: number;
  source: string;
}

/** A school merged with its most recent format. */
export interface School extends SchoolBase {
  batch_size: number;
  prep_sec: number;
  answer_sec: number;
  /** The cycle year the format above comes from. */
  format_year: number;
}

export interface Question {
  id: number;
  school_id: string;
  text: string;
  category: string;
  year: number;
  source: string;
  source_url: string;
  status: string;
}

export const formats: SchoolFormat[] = formatsData as SchoolFormat[];
export const questions: Question[] = questionsData as Question[];

/** All formats for a school, newest year first. */
export function getSchoolFormats(schoolId: string): SchoolFormat[] {
  return formats
    .filter((f) => f.school_id === schoolId)
    .sort((a, b) => b.year - a.year);
}

/**
 * Format for a school in a given year. If that exact year has no row, falls
 * back to the latest earlier year (formats carry forward until they change).
 * With no year, returns the latest known format.
 */
export function getSchoolFormat(
  schoolId: string,
  year?: number
): SchoolFormat {
  const all = getSchoolFormats(schoolId);
  if (all.length === 0) {
    throw new Error(`No Kira format in school_formats.json for "${schoolId}"`);
  }
  if (year === undefined) return all[0];
  return all.find((f) => f.year <= year) ?? all[all.length - 1];
}

function withFormat(base: SchoolBase, year?: number): School {
  const f = getSchoolFormat(base.school_id, year);
  return {
    ...base,
    batch_size: f.batch_size,
    prep_sec: f.prep_sec,
    answer_sec: f.answer_sec,
    format_year: f.year,
  };
}

const schoolBases: SchoolBase[] = schoolsData as SchoolBase[];
export const schools: School[] = schoolBases.map((s) => withFormat(s));

export function getActiveSchools(): School[] {
  return schools.filter((s) => s.active === "yes");
}

export function getSchoolBySlug(slug: string, year?: number): School | undefined {
  const base = schoolBases.find((s) => s.slug === slug);
  return base ? withFormat(base, year) : undefined;
}

export function getSchoolById(id: string, year?: number): School | undefined {
  const base = schoolBases.find((s) => s.school_id === id);
  return base ? withFormat(base, year) : undefined;
}

export function getQuestionsBySchool(schoolId: string): Question[] {
  return questions.filter(
    (q) => q.school_id === schoolId && q.status === "active"
  );
}

export function getQuestionsBySchoolSorted(schoolId: string): Question[] {
  return getQuestionsBySchool(schoolId).sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return b.id - a.id;
  });
}

export function getQuestionCount(schoolId: string): number {
  return getQuestionsBySchool(schoolId).length;
}
