// Same run of stars whatever the word's length, so the mask doesn't give the length away either.
const HIDDEN = "******";

/**
 * Hides a person's name for demos while keeping it recognisable as a name: each word keeps its
 * first and last letter, "RENILTON FRANCISCO" → "R******N F******O". Words of one or two letters
 * keep the first letter only ("DA" → "D*").
 */
export function maskName(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      const letters = Array.from(word);
      if (letters.length <= 2) return letters[0] + "*".repeat(letters.length - 1);
      return letters[0] + HIDDEN + letters[letters.length - 1];
    })
    .join(" ");
}
