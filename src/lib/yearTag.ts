/**
 * Year tags only appear on recent questions (this year or last year).
 * Older questions show no year so they don't look stale.
 */
export function showYearTag(year: number | undefined): boolean {
  if (!year) return false;
  return year >= new Date().getFullYear() - 1;
}
