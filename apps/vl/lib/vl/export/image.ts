import { toIsoDate } from "../dates";
import { chartDomId } from "./chart-id";
import { safeFileName } from "./excel";
import { replaceOklch } from "./image-colors";

const SENTINEL = "#010203";
const FALLBACK = "#666666";

/**
 * Converts any CSS colour (incl. OKLCH, which canvas fillStyle no longer normalises in current Chrome)
 * to rgb()/rgba() by painting one pixel and reading it back.
 */
const oklchToRgb = (color: string): string => {
  try {
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    if (!ctx) return FALLBACK;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = SENTINEL;
    ctx.fillStyle = color;
    if (ctx.fillStyle === SENTINEL) return FALLBACK; // unparsable value left the sentinel in place
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
  } catch {
    console.warn("Failed to convert OKLCH color:", color);
  }
  return FALLBACK;
};

const COLOR_PROPERTIES = [
  "color",
  "backgroundColor",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outlineColor",
  "textDecorationColor",
  "fill",
  "stroke",
];

/**
 * Rewrites OKLCH colours (Tailwind v4) to RGB on a CLONED element only, so html2canvas can parse them.
 * The live DOM is never touched, so there is nothing to restore.
 */
function fixOklchColorsOnClone(root: Element): void {
  const view = root.ownerDocument.defaultView;
  if (!view) return;
  [root, ...Array.from(root.querySelectorAll("*"))].forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computed = view.getComputedStyle(htmlEl);
    COLOR_PROPERTIES.forEach((property) => {
      const value = computed.getPropertyValue(property.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));
      if (value && value.includes("oklch")) htmlEl.style.setProperty(property.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`), oklchToRgb(value), "important");
    });
    ["box-shadow", "text-shadow"].forEach((property) => {
      const value = computed.getPropertyValue(property);
      if (value && value.includes("oklch")) htmlEl.style.setProperty(property, replaceOklch(value, oklchToRgb), "important");
    });
    ["fill", "stroke"].forEach((attr) => {
      const value = htmlEl.getAttribute?.(attr);
      if (value && value.includes("oklch")) htmlEl.setAttribute(attr, oklchToRgb(value));
    });
  });
}

function download(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * PNG export of a card. ApexCharts cards use the chart's own renderer (id `<cardId>-chart`);
 * maps and tables fall back to html2canvas on the card wrapper (id `<cardId>`), with the
 * Tailwind v4 OKLCH colour fix applied to the clone.
 */
export async function exportCardImage(cardId: string, title: string): Promise<void> {
  const filename = `${safeFileName(title)}_${toIsoDate(new Date())}.png`;
  const ApexCharts = (await import("apexcharts")).default as any;
  const chart = ApexCharts.getChartByID?.(chartDomId(cardId));
  if (chart) {
    const { imgURI } = await chart.dataURI({ scale: 3 });
    download(imgURI, filename);
    return;
  }
  const element = document.getElementById(cardId);
  if (!element) throw new Error(`Elemento '${cardId}' não encontrado`);
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    logging: false,
    onclone: (clonedDoc) => {
      const cloned = clonedDoc.getElementById(cardId);
      if (cloned) fixOklchColorsOnClone(cloned);
    },
  });
  download(canvas.toDataURL("image/png"), filename);
}
