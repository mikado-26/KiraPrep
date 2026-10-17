/**
 * Application-cycle settings. Change CURRENT_CYCLE_START once a year (around
 * August, when new Kira invitations start) and every title, heading, intro and
 * FAQ on the site rolls forward.
 *
 * A question or format tagged with `year: Y` belongs to the Y–(Y+1) cycle:
 * applicants apply in Y and start the program in Y+1.
 */
export const CURRENT_CYCLE_START = 2026;

/** Date the question bank was last reviewed. Shown on school pages and used in the sitemap. */
export const CONTENT_UPDATED = "2026-10-17";

/** "2026–27" */
export function cycleLabel(startYear: number): string {
  return `${startYear}–${String(startYear + 1).slice(-2)}`;
}

/** Intake (start) year for a cycle: 2026–27 cycle → 2027 intake. */
export function intakeYear(startYear: number): number {
  return startYear + 1;
}

export const CURRENT_CYCLE_LABEL = cycleLabel(CURRENT_CYCLE_START);
export const CURRENT_INTAKE = intakeYear(CURRENT_CYCLE_START);

export function contentUpdatedLabel(): string {
  return new Date(CONTENT_UPDATED).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
