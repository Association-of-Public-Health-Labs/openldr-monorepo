/** CSS colour functions html2canvas cannot parse (Tailwind v4 and current Chrome emit them). */
const MODERN_COLOR = /\b(?:oklch|oklab|lch|lab|color)\([^)]*\)/g;

export const hasModernColor = (value: string): boolean => new RegExp(MODERN_COLOR.source).test(value);

/** Replaces every modern colour occurrence in a CSS value (e.g. box-shadow) using `convert`. */
export function replaceModernColors(value: string, convert: (color: string) => string): string {
  return value.replace(MODERN_COLOR, (match) => convert(match));
}
