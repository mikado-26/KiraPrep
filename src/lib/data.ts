import schoolsData from "@/data/schools.json";
import questionsData from "@/data/questions.json";

export interface School {
  school_id: string;
  display_name: string;
  slug: string;
  batch_size: number;
  prep_sec: number;
  answer_sec: number;
  active: string;
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

export const schools: School[] = schoolsData as School[];
export const questions: Question[] = questionsData as Question[];

export function getActiveSchools(): School[] {
  return schools.filter((s) => s.active === "yes");
}

export function getSchoolBySlug(slug: string): School | undefined {
  return schools.find((s) => s.slug === slug);
}

export function getSchoolById(id: string): School | undefined {
  return schools.find((s) => s.school_id === id);
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
