import { toIsoDate } from "../dates";
import { chartDomId } from "./chart-id";
import { safeFileName } from "./excel";

/**
 * Convert OKLCH color to RGB equivalent
 */
const oklchToRgb = (oklchColor: string): string => {
  try {
    // Create a temporary canvas to convert OKLCH to RGB
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#666666';
    
    ctx.fillStyle = oklchColor;
    const computedColor = ctx.fillStyle;
    
    // If the color was successfully parsed, return it
    if (computedColor && computedColor !== '#000000') {
      return computedColor;
    }
  } catch (error) {
    console.warn('Failed to convert OKLCH color:', oklchColor);
  }
  
  // Fallback to neutral gray
  return '#666666';
};

/**
 * Fix OKLCH colors in DOM elements before export
 */
const fixOklchColors = (element: Element): Map<Element, { property: string; originalValue: string }> => {
  const modifiedElements = new Map<Element, { property: string; originalValue: string }>();
  
  // All possible color properties that might use OKLCH
  const colorProperties = [
    'color', 'backgroundColor', 'borderColor', 'borderTopColor', 
    'borderRightColor', 'borderBottomColor', 'borderLeftColor',
    'outlineColor', 'textDecorationColor', 'fill', 'stroke'
  ];
  
  // Find all elements with OKLCH colors
  const allElements = element.querySelectorAll('*');
  
  [element, ...Array.from(allElements)].forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlEl);
    
    // Check computed styles
    colorProperties.forEach((property) => {
      const value = computedStyle.getPropertyValue(property);
      if (value && value.includes('oklch')) {
        const rgbValue = oklchToRgb(value);
        modifiedElements.set(el, { property, originalValue: value });
        htmlEl.style.setProperty(property, rgbValue, 'important');
      }
    });
    
    // Check inline styles
    if (htmlEl.style) {
      colorProperties.forEach((property) => {
        const value = htmlEl.style.getPropertyValue(property);
        if (value && value.includes('oklch')) {
          const rgbValue = oklchToRgb(value);
          if (!modifiedElements.has(el)) {
            modifiedElements.set(el, { property, originalValue: value });
          }
          htmlEl.style.setProperty(property, rgbValue, 'important');
        }
      });
    }
    
    // Check SVG-specific attributes
    if (htmlEl.tagName === 'svg' || htmlEl.closest('svg')) {
      ['fill', 'stroke'].forEach((attr) => {
        const value = htmlEl.getAttribute(attr);
        if (value && value.includes('oklch')) {
          const rgbValue = oklchToRgb(value);
          if (!modifiedElements.has(el)) {
            modifiedElements.set(el, { property: attr, originalValue: value });
          }
          htmlEl.setAttribute(attr, rgbValue);
        }
      });
    }
  });
  
  return modifiedElements;
};

/**
 * Restore original OKLCH colors after export
 */
const restoreOklchColors = (modifiedElements: Map<Element, { property: string; originalValue: string }>): void => {
  modifiedElements.forEach(({ property, originalValue }, element) => {
    const htmlEl = element as HTMLElement;
    
    if (['fill', 'stroke'].includes(property)) {
      // SVG attributes
      htmlEl.setAttribute(property, originalValue);
    } else {
      // CSS properties
      htmlEl.style.setProperty(property, originalValue);
    }
  });
};

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
 * Tailwind v4 OKLCH colour fix.
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
  const modified = fixOklchColors(element);
  try {
    const canvas = await html2canvas(element, { backgroundColor: "#ffffff", scale: 2, useCORS: true, logging: false });
    download(canvas.toDataURL("image/png"), filename);
  } finally {
    restoreOklchColors(modified);
  }
}
