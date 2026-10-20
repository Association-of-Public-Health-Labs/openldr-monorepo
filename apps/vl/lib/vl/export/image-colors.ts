/** Replaces every `oklch(...)` occurrence in a CSS value (e.g. box-shadow) using `convert`. */
export function replaceOklch(value: string, convert: (oklch: string) => string): string {
  return value.replace(/oklch\([^)]*\)/g, (match) => convert(match));
}
