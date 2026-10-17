import type { Question } from "@/lib/data";

/**
 * Groups Kira questions into themes by keywords, so each school page can
 * describe what that school tends to ask. Each question gets one theme.
 */
const THEMES: { name: string; phrase: string; re: RegExp }[] = [
  // Order matters: each question gets the FIRST theme it matches.
  { name: "Opinion & current affairs", phrase: "opinion & current affairs", re: /some (have argued|people|might argue|think|say|believe)|do you agree|do you think|social responsibility|rising tide|globali|nationality|government|economies/ },
  { name: "Culture & diversity", phrase: "culture & diversity", re: /cultur|divers|de&i|\bdei\b|equity|countr|language|accent|international|abroad|inclusi|hometown/ },
  { name: "Leadership & influence", phrase: "leadership & influence", re: /\blead|leader|manag|subordinate|influence|persuad|convinc|status quo|align a team/ },
  { name: "Teamwork & conflict", phrase: "teamwork & conflict", re: /team|conflict|colleague|cowork|co-work|stakeholder|disagree|collaborat|difficult person|peer|get along|did not along|different personalit|work(ed)? with (somebody|someone|a person|people)/ },
  { name: "Why MBA & this school", phrase: "why MBA & this school", re: /mission|why mccombs|skills .*(gain|looking)|qualities .*bring|\bmba\b|career goal|business school|study at|post-mba|contribut|right one for you|bring that to|program/ },
  { name: "Decisions & judgment", phrase: "decisions & judgment", re: /decision|risk/ },
  { name: "Failure & feedback", phrase: "failure & feedback", re: /in the wrong|humble|fail|mistake|improve|weakness|feedback|critique|regret|setback|learn(ed|t)? from|advice|least favorite/ },
  { name: "Pressure & ambiguity", phrase: "pressure & ambiguity", re: /difficult situation|difficult challenge|challenging|resilien|adversity|change your plans|didn.t have time|extra help|ambigu|zero information|incomplete information|pressure|overwhelm|pivot|unexpected|unforseen|unforeseen|comfort zone|stress|upset|anger|deadline|challenge you faced|problem/ },
  { name: "Impact & problem-solving", phrase: "impact & problem-solving", re: /value to|created value|professional value|impact|innovat|analytical|project|presentation|communicat|time horizon|planning/ },
  { name: "Values & self-awareness", phrase: "values & self-awareness", re: /success look|community|introduc|yourself|unique attribute|value that|values|thrive|environment|resume|strength|proud|meaningful|life experience|integrity|ethic|honest/ },
  { name: "Curveball & personal", phrase: "curveball & personal", re: /free time|natural world|if you (were|could)|actor|punctuation|superpower|animal|fear|passion|hobb|\bfun\b|outside (of )?work|friends|three words|book|movie|song|weekend|pronounce|food|tradition|invention|favorite|creative/ },
];

/** The one theme a question belongs to, or undefined. */
export function themeOf(text: string): string | undefined {
  const t = text.toLowerCase();
  return THEMES.find((th) => th.re.test(t))?.name;
}

/** Lower-case wording of a theme for use inside a sentence. */
export function themePhrase(name: string): string {
  return THEMES.find((th) => th.name === name)?.phrase ?? name.toLowerCase();
}

export interface SchoolTheme {
  name: string;
  count: number;
  example: string;
}

export interface ThemeSummary {
  top: SchoolTheme[];
  /** A theme this school asks about much more than the other schools, if any. */
  distinctive?: string;
}

/**
 * Top themes for one school, each with a real example question
 * (no question is used as an example twice).
 */
export function summarizeThemes(
  schoolQuestions: Question[],
  allQuestions: Question[],
  max = 4
): ThemeSummary {
  const counts = new Map<string, Question[]>();
  for (const q of schoolQuestions) {
    const th = themeOf(q.text);
    if (th) counts.set(th, [...(counts.get(th) ?? []), q]);
  }

  const used = new Set<number>();
  const top: SchoolTheme[] = [...counts.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .filter(([, qs]) => qs.length >= 2)
    .slice(0, max)
    .map(([name, qs]) => {
      const ex = qs.find((q) => !used.has(q.id)) ?? qs[0];
      used.add(ex.id);
      return { name, count: qs.length, example: ex.text.trim() };
    });

  // Distinctive: share at this school is at least 1.6x its share across all schools.
  const overall = new Map<string, number>();
  for (const q of allQuestions) {
    const th = themeOf(q.text);
    if (th) overall.set(th, (overall.get(th) ?? 0) + 1);
  }
  let distinctive: string | undefined;
  let best = 1.6;
  for (const [name, qs] of counts) {
    if (qs.length < 4) continue;
    const ratio =
      qs.length / schoolQuestions.length / ((overall.get(name) ?? 1) / allQuestions.length);
    if (ratio >= best) {
      best = ratio;
      distinctive = name;
    }
  }
  return { top, distinctive };
}
