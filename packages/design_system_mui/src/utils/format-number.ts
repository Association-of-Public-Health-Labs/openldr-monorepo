/**
 * Thousands grouping for counts in the dashboards: 138499 → "138 499".
 *
 * The separator is a narrow no-break space (U+202F), the typographic thousands separator (SI/ISO 80000):
 * it reads as a group gap, never wraps a number over two lines, and cannot be mistaken for the decimal
 * point (Portuguese uses a comma, the dashboards' percentages a dot). Four-digit numbers are grouped too
 * (2 255), unlike the pt-PT default, so that numbers line up in tables and tiles.
 */
export const THOUSANDS_SEPARATOR = " ";

const GROUP = /\B(?=(\d{3})+(?!\d))/g;

/** "138 499"; decimals kept as given (up to 2), so "1 234.5". Not a finite number → "". */
export function formatNumber(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) return value == null ? "" : String(value);
  const text = Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
  return groupThousands(text);
}

/**
 * Groups every run of 4+ digits that is a whole-number part in already formatted text:
 * "138499" → "138 499", "12345 amostras" → "12 345 amostras". Decimals ("0.12345") and numbers already
 * grouped are left alone, so it can follow any formatter ("95.3%", "1.5K" stay as they are).
 */
export function groupThousands(text: string): string {
  return text.replace(/(^|[^\d., ])(\d{4,})/g, (_, before: string, digits: string) => before + digits.replace(GROUP, THOUSANDS_SEPARATOR));
}
