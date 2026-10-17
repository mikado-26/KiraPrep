/**
 * Users see the intake a question was reported for, never the report date.
 * Tags only appear on current intakes (this calendar year or later), so
 * older questions show no tag and don't look stale. This keeps the old
 * behaviour: a question reported last October (this year's intake) still
 * shows a tag, one reported two years ago doesn't.
 */
export function showIntakeTag(intake: number | null | undefined): intake is number {
  if (!intake) return false;
  return intake >= new Date().getFullYear();
}

export function intakeLabel(intake: number): string {
  return `${intake} Intake`;
}
