import html2canvas from 'html2canvas';

/**
 * OKLCH color mappings for compatibility
 */
const OKLCH_COLOR_MAP: Record<string, string> = {
  'oklch(0.7 0.15 200)': '#4A90E2',
  'oklch(0.6 0.2 350)': '#E24A90',
  'oklch(0.65 0.18 120)': '#4AE290',
  'oklch(0.55 0.22 60)': '#E2904A',
  'oklch(0.5 0.25 300)': '#904AE2',
  'oklch(0.75 0.12 180)': '#4AE2E2'
};

/**
 * Convert OKLCH color to RGB equivalent
 */
const convertOklchToRgb = (oklchColor: string): string => {
  // Check if it's already in our mapping
  if (OKLCH_COLOR_MAP[oklchColor]) {
    return OKLCH_COLOR_MAP[oklchColor];
  }

  // Try to convert using canvas (more reliable)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = oklchColor;
      const computedColor = ctx.fillStyle;
      if (computedColor && computedColor !== oklchColor) {
        return computedColor;
      }
    }
  } catch (error) {
    console.warn('Canvas color conversion failed:', error);
  }

  // Fallback to neutral color
  return '#6B7280';
};

/**
 * Fix OKLCH colors in DOM elements before export
 */
const fixOklchColors = (element: Element): Map<Element, { property: string; originalValue: string }[]> => {
  const originalStyles = new Map<Element, { property: string; originalValue: string }[]>();
  
  // Color properties to check
  const colorProperties = [
    'color', 'backgroundColor', 'borderColor', 'borderTopColor', 
    'borderRightColor', 'borderBottomColor', 'borderLeftColor',
    'outlineColor', 'textDecorationColor', 'fill', 'stroke'
  ];

  // Get all elements including the root
  const allElements = [element, ...element.querySelectorAll('*')];

  allElements.forEach(el => {
    const htmlEl = el as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlEl);
    const elementChanges: { property: string; originalValue: string }[] = [];

    colorProperties.forEach(property => {
      const value = computedStyle.getPropertyValue(property);
      
      if (value && value.includes('oklch')) {
        const rgbValue = convertOklchToRgb(value);
        elementChanges.push({ property, originalValue: value });
        htmlEl.style.setProperty(property, rgbValue, 'important');
      }
    });

    // Handle CSS variables that might contain OKLCH
    for (let i = 0; i < computedStyle.length; i++) {
      const property = computedStyle[i];
      if (property.startsWith('--')) {
        const value = computedStyle.getPropertyValue(property);
        if (value && value.includes('oklch')) {
          const rgbValue = convertOklchToRgb(value);
          elementChanges.push({ property, originalValue: value });
          htmlEl.style.setProperty(property, rgbValue, 'important');
        }
      }
    }

    // Handle SVG-specific attributes
    if (htmlEl.tagName === 'svg' || htmlEl.closest('svg')) {
      ['fill', 'stroke'].forEach(attr => {
        const value = htmlEl.getAttribute(attr);
        if (value && value.includes('oklch')) {
          const rgbValue = convertOklchToRgb(value);
          elementChanges.push({ property: `attr-${attr}`, originalValue: value });
          htmlEl.setAttribute(attr, rgbValue);
        }
      });
    }

    if (elementChanges.length > 0) {
      originalStyles.set(htmlEl, elementChanges);
    }
  });

  return originalStyles;
};

/**
 * Restore original OKLCH colors after export
 */
const restoreOklchColors = (originalStyles: Map<Element, { property: string; originalValue: string }[]>): void => {
  originalStyles.forEach((changes, element) => {
    const htmlEl = element as HTMLElement;
    changes.forEach(({ property, originalValue }) => {
      if (property.startsWith('attr-')) {
        const attrName = property.replace('attr-', '');
        htmlEl.setAttribute(attrName, originalValue);
      } else {
        htmlEl.style.setProperty(property, originalValue);
      }
    });
  });
};

/**
 * Export chart using html2canvas with OKLCH color fix
 */
export const exportViaHtml2Canvas = async (
  chartId: string,
  filename: string,
  format: 'png' | 'jpeg' = 'png'
): Promise<void> => {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    throw new Error(`Chart element with id '${chartId}' not found`);
  }

  // Fix OKLCH colors
  const originalStyles = fixOklchColors(chartElement);

  try {
    // Wait a bit for styles to apply
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    });

    // Create download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL(`image/${format}`, 0.9);
    link.click();

  } finally {
    // Always restore original colors
    restoreOklchColors(originalStyles);
  }
};

/**
 * Export chart via SVG conversion (fallback method)
 */
export const exportViaSvgConversion = async (
  chartId: string,
  filename: string,
  format: 'png' | 'jpeg' = 'png'
): Promise<void> => {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    throw new Error(`Chart element with id '${chartId}' not found`);
  }

  // Try to find SVG element
  const svgElement = chartElement.querySelector('svg');
  if (!svgElement) {
    throw new Error('No SVG element found in chart');
  }

  // Clone and fix OKLCH colors in SVG
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  const originalStyles = fixOklchColors(clonedSvg);

  try {
    // Convert SVG to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Create download link
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL(`image/${format}`, 0.9);
      link.click();

      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;

  } finally {
    restoreOklchColors(originalStyles);
  }
};

/**
 * Main chart export function with multiple strategies
 */
export const exportChart = async (
  chartId: string,
  reportName: string,
  format: 'png' | 'jpeg' = 'png'
): Promise<void> => {
  try {
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${reportName.replace(/\s+/g, '_')}_${timestamp}.${format}`;

    // Try html2canvas first (most reliable)
    try {
      await exportViaHtml2Canvas(chartId, filename, format);
      return;
    } catch (error) {
      console.warn('html2canvas export failed, trying SVG conversion:', error);
    }

    // Fallback to SVG conversion
    try {
      await exportViaSvgConversion(chartId, filename, format);
      return;
    } catch (error) {
      console.warn('SVG conversion failed:', error);
    }

    // If all methods fail
    throw new Error('Todos os métodos de exportação falharam');

  } catch (error) {
    console.error('Erro ao exportar gráfico:', error);
    throw new Error('Falha ao exportar imagem do gráfico');
  }
};
