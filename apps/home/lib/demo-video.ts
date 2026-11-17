/** The demo video's two versions, served from public/demo. */
export const DEMO_VERSIONS = {
  hd: { src: "/demo/openldr-demo.mp4", label: "HD 1080p", size: "28 MB" },
  light: { src: "/demo/openldr-demo-720p.mp4", label: "Versão leve 720p", size: "15 MB" },
} as const;

export type DemoQuality = keyof typeof DEMO_VERSIONS;

/** What the browser says about the connection (Network Information API; not every browser has it). */
export type ConnectionHint = { effectiveType?: string; saveData?: boolean } | undefined;

/** Start with the light version on a slow connection or with data saving on; otherwise HD. */
export function initialQuality(connection: ConnectionHint): DemoQuality {
  if (!connection) return "hd";
  if (connection.saveData) return "light";
  return ["slow-2g", "2g", "3g"].includes(connection.effectiveType ?? "") ? "light" : "hd";
}

/**
 * Remembers that a visitor has seen (closed) the demo dialog, so it opens by itself only on the first visit.
 * Bump the version when the video is replaced, to show the new one once to everyone.
 */
export const DEMO_DIALOG_SEEN_KEY = "openldr:demo-dialog:v1";

/** Open the dialog by itself when the link asks for it (#demo) or the visitor has not closed it before. */
export function shouldAutoOpen(seen: string | null, hash: string): boolean {
  if (hash === "#demo") return true;
  return seen === null;
}
