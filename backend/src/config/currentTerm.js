// Single source of truth for the "current" academic term.
// The whole app (teacher dashboard, schedule, default filters) keys off this
// so we show ONE active term at a time instead of every term in parallel.
// To roll over to a new term, change these two values.
export const CURRENT_TERM = {
  semester: 2,
  academic_year: 2568,
};

// True if the given class/term is the active term (writable). Older terms are
// read-only: no check-in, no new sessions, no enrollment, no class creation.
export const isCurrentTerm = (semester, academic_year) =>
  Number(semester) === CURRENT_TERM.semester &&
  Number(academic_year) === CURRENT_TERM.academic_year;
