// Password policy — mirrors the Supabase Auth config exactly:
// min. 8 characters + at least one lowercase, one uppercase, and one digit.
// RN-free so it stays unit-testable.

export interface PasswordChecks {
  length: boolean; // >= 8 characters
  lower: boolean; // has a lowercase letter
  upper: boolean; // has an uppercase letter
  digit: boolean; // has a digit
}

export function passwordChecks(pw: string): PasswordChecks {
  return {
    length: pw.length >= 8,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    digit: /[0-9]/.test(pw),
  };
}

export function isStrongPassword(pw: string): boolean {
  const c = passwordChecks(pw);
  return c.length && c.lower && c.upper && c.digit;
}
