import html2canvas from 'html2canvas';

// ============================================================================
// TYPES
// ============================================================================

interface ExportOptions {
  filename?: string;
  format?: 'png' | 'jpeg';
  quality?: number;
}

// ============================================================================
// OKLCH COLOR CONVERSION UTILITIES
// ============================================================================

/**
 * Convert OKLCH color to RGB using canvas
 */
function convertOklchToRgb(oklchColor: string): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#666666';
    
    ctx.fillStyle = oklchColor;
    const computedColor = ctx.fillStyle;
    
    if (computedColor && computedColor !== oklchColor) {
      return computedColor;
    }
  } catch (error) {
    console.warn('Canvas OKLCH conversion failed:', error);
  }
  
  // Manual parsing fallback
  const match = oklchColor.match(/oklch\(([\d.]+%?)\s+([\d.]+)\s+([\d.]+)\)/);
  if (match) {
    const l = parseFloat(match[1]) / (match[1].includes('%') ? 100 : 1);
    const c = parseFloat(match[2]);
    const h = parseFloat(match[3]);
    
    // Simplified conversion to RGB (approximation)
    const r = Math.round(l * 255);
    const g = Math.round(l * 255 * (1 - c * 0.5));
    const b = Math.round(l * 255 * (1 - c * 0.3));
    
    return `rgb(${Math.max(0, Math.min(255, r))}, ${Math.max(0, Math.min(255, g))}, ${Math.max(0, Math.min(255, b))})`;
  }
  
  return '#666666'; // Neutral gray fallback
}

/**
 * Check if a color is OKLCH format
 */
function isOklchColor(color: string): boolean {
  return color && color.includes('oklch(');
}

/**
 * Get all color properties to check
 */
function getColorProperties(): string[] {
  return [
    'color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor',
    'borderBottomColor', 'borderLeftColor', 'outlineColor', 'textDecorationColor',
    'columnRuleColor', 'fill', 'stroke'
  ];
}

/**
 * Fix OKLCH colors in an element and its children
 */
function fixOklchColors(element: Element): Map<Element, Map<string, string>> {
  const originalStyles = new Map<Element, Map<string, string>>();
  const elements = [element, ...Array.from(element.querySelectorAll('*'))];
  
  elements.forEach(el => {
    const htmlEl = el as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlEl);
    const elementOriginalStyles = new Map<string, string>();
    
    // Check computed styles
    getColorProperties().forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && isOklchColor(value)) {
        elementOriginalStyles.set(prop, htmlEl.style.getPropertyValue(prop) || '');
        htmlEl.style.setProperty(prop, convertOklchToRgb(value), 'important');
      }
    });
    
    // Check inline styles
    if (htmlEl.style) {
      getColorProperties().forEach(prop => {
        const value = htmlEl.style.getPropertyValue(prop);
        if (value && isOklchColor(value)) {
          if (!elementOriginalStyles.has(prop)) {
            elementOriginalStyles.set(prop, value);
          }
          htmlEl.style.setProperty(prop, convertOklchToRgb(value), 'important');
        }
      });
    }
    
    // Handle CSS variables
    if (htmlEl.style.cssText) {
      const cssVariableRegex = /--([\w-]+):\s*oklch\([^)]+\)/g;
      let match;
      while ((match = cssVariableRegex.exec(htmlEl.style.cssText)) !== null) {
        const varName = `--${match[1]}`;
        const originalValue = htmlEl.style.getPropertyValue(varName);
        if (originalValue && isOklchColor(originalValue)) {
          elementOriginalStyles.set(varName, originalValue);
          htmlEl.style.setProperty(varName, convertOklchToRgb(originalValue), 'important');
        }
      }
    }
    
    // Handle SVG elements
    if (el.tagName === 'svg' || el.closest('svg')) {
      ['fill', 'stroke'].forEach(attr => {
        const value = el.getAttribute(attr);
        if (value && isOklchColor(value)) {
          elementOriginalStyles.set(`attr-${attr}`, value);
          el.setAttribute(attr, convertOklchToRgb(value));
        }
      });
    }
    
    if (elementOriginalStyles.size > 0) {
      originalStyles.set(el, elementOriginalStyles);
    }
  });
  
  return originalStyles;
}

/**
 * Restore original OKLCH colors
 */
function restoreOklchColors(originalStyles: Map<Element, Map<string, string>>): void {
  originalStyles.forEach((styleMap, element) => {
    const htmlEl = element as HTMLElement;
    
    styleMap.forEach((originalValue, property) => {
      if (property.startsWith('attr-')) {
        const attr = property.replace('attr-', '');
        if (originalValue) {
          element.setAttribute(attr, originalValue);
        } else {
          element.removeAttribute(attr);
        }
      } else {
        if (originalValue) {
          htmlEl.style.setProperty(property, originalValue);
        } else {
          htmlEl.style.removeProperty(property);
        }
      }
    });
  });
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export via ApexCharts native method (if available)
 */
async function exportViaApexCharts(
  chartId: string,
  options: ExportOptions
): Promise<string> {
  // Check if ApexCharts is available
  if (typeof window !== 'undefined' && (window as any).ApexCharts) {
    const ApexCharts = (window as any).ApexCharts;
    
    try {
      // Try to get chart instance
      const chartElement = document.getElementById(chartId);
      if (chartElement && (chartElement as any).__apexcharts__) {
        const chart = (chartElement as any).__apexcharts__;
        
        // Use ApexCharts native export
        const dataURI = await chart.dataURI({
          type: options.format || 'png',
          quality: options.quality || 1
        });
        
        return dataURI;
      }
    } catch (error) {
      console.warn('ApexCharts export failed:', error);
    }
  }
  
  throw new Error('ApexCharts export not available');
}

/**
 * Export via html2canvas with OKLCH fix
 */
async function exportViaHtml2Canvas(
  chartId: string,
  options: ExportOptions
): Promise<string> {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    throw new Error(`Chart element with id '${chartId}' not found`);
  }

  // Fix OKLCH colors before capture
  const originalStyles = fixOklchColors(chartElement);
  
  try {
    const canvas = await html2canvas(chartElement, {
      allowTaint: false,
      useCORS: true,
      scale: 2,
      backgroundColor: '#ffffff',
      removeContainer: true,
      imageTimeout: 0,
      logging: false,
    });

    const format = options.format || 'png';
    const quality = options.quality || 0.9;
    
    return canvas.toDataURL(`image/${format}`, quality);
  } finally {
    // Always restore original colors
    restoreOklchColors(originalStyles);
  }
}

/**
 * Export via SVG conversion
 */
async function exportViaSvgConversion(
  chartId: string,
  options: ExportOptions
): Promise<string> {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    throw new Error(`Chart element with id '${chartId}' not found`);
  }

  const svgElement = chartElement.querySelector('svg');
  if (!svgElement) {
    throw new Error('No SVG element found in chart');
  }

  // Clone SVG and fix OKLCH colors
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  const originalStyles = fixOklchColors(clonedSvg);

  try {
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx.scale(2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);
        
        const format = options.format || 'png';
        const quality = options.quality || 0.9;
        resolve(canvas.toDataURL(`image/${format}`, quality));
      };
      
      img.onerror = () => reject(new Error('Failed to load SVG image'));
      img.src = svgDataUrl;
    });
  } finally {
    restoreOklchColors(originalStyles);
  }
}

/**
 * Download data URL as file
 */
function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Export chart with multiple fallback strategies
 */
export async function exportChart(
  chartId: string,
  filename?: string,
  format: 'png' | 'jpeg' = 'png'
): Promise<void> {
  const options: ExportOptions = {
    filename: filename || `chart_${Date.now()}`,
    format,
    quality: format === 'jpeg' ? 0.9 : 1
  };

  const finalFilename = `${options.filename}.${format}`;
  
  // Strategy 1: Try ApexCharts native export
  try {
    const dataUrl = await exportViaApexCharts(chartId, options);
    downloadDataUrl(dataUrl, finalFilename);
    console.log('Chart exported successfully via ApexCharts');
    return;
  } catch (error) {
    console.warn('ApexCharts export failed, trying html2canvas:', error);
  }

  // Strategy 2: Try html2canvas
  try {
    const dataUrl = await exportViaHtml2Canvas(chartId, options);
    downloadDataUrl(dataUrl, finalFilename);
    console.log('Chart exported successfully via html2canvas');
    return;
  } catch (error) {
    console.warn('html2canvas export failed, trying SVG conversion:', error);
  }

  // Strategy 3: Try SVG conversion
  try {
    const dataUrl = await exportViaSvgConversion(chartId, options);
    downloadDataUrl(dataUrl, finalFilename);
    console.log('Chart exported successfully via SVG conversion');
    return;
  } catch (error) {
    console.error('All export methods failed:', error);
    throw new Error('Falha ao exportar gráfico. Tente novamente.');
  }
}
