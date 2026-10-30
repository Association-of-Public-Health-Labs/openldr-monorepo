/**
 * Bar/dialog labels of lab rows. The API groups labs by code + name, so a name can appear twice
 * (two codes). A repeated name is labelled "<name> (<code>)" so bars, clicks and dialog tiles stay
 * distinct; unique names, and repeated names without a code, are unchanged.
 */
export function uniqueLabLabels<Row>(rows: Row[], nameOf: (r: Row) => string, codeOf: (r: Row) => string | null | undefined): string[] {
  const count = new Map<string, number>();
  for (const r of rows) count.set(nameOf(r), (count.get(nameOf(r)) ?? 0) + 1);
  return rows.map((r) => {
    const name = nameOf(r);
    const code = codeOf(r);
    return (count.get(name) ?? 0) > 1 && code ? `${name} (${code})` : name;
  });
}
