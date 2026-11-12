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
