import html2canvas from 'html2canvas';
import { CHART_CONFIG } from './constants';

// ============================================================================
// CHART EXPORT UTILITIES
// ============================================================================

/**
 * Comprehensive OKLCH color detection and conversion
 */
const fixOklchColors = (): (() => void) => {
  const originalStyles = new Map<Element, string>();
  
  // OKLCH color patterns
  const oklchPattern = /oklch\([^)]+\)/g;
  
  // All color properties that might contain OKLCH
  const colorProperties = [
    'color', 'backgroundColor', 'borderColor', 'borderTopColor', 
    'borderRightColor', 'borderBottomColor', 'borderLeftColor',
    'outlineColor', 'textDecorationColor', 'caretColor', 'fill', 'stroke'
  ];

  // Convert OKLCH to RGB using canvas
  const convertOklchToRgb = (oklchString: string): string => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '#808080';
      
      ctx.fillStyle = oklchString;
      const computedColor = ctx.fillStyle;
      
      if (computedColor && computedColor !== oklchString) {
        return computedColor;
      }
    } catch (error) {
      console.warn('Canvas color conversion failed:', error);
    }
    
    // Manual parsing fallback
    const match = oklchString.match(/oklch\(([^)]+)\)/);
    if (match) {
      const values = match[1].split(/\s+/);
      const l = parseFloat(values[0]) || 0.5;
      const c = parseFloat(values[1]) || 0.1;
      const h = parseFloat(values[2]) || 0;
      
      // Simplified OKLCH to RGB conversion
      const r = Math.round(255 * Math.max(0, Math.min(1, l + c * Math.cos(h * Math.PI / 180))));
      const g = Math.round(255 * Math.max(0, Math.min(1, l + c * Math.cos((h + 120) * Math.PI / 180))));
      const b = Math.round(255 * Math.max(0, Math.min(1, l + c * Math.cos((h + 240) * Math.PI / 180))));
      
      return `rgb(${r}, ${g}, ${b})`;
    }
    
    return '#808080'; // Neutral gray fallback
  };

  // Process all elements
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element);
    let hasOklch = false;
    const newStyles: string[] = [];
    
    // Check computed styles
    colorProperties.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && oklchPattern.test(value)) {
        hasOklch = true;
        const convertedValue = value.replace(oklchPattern, convertOklchToRgb);
        newStyles.push(`${prop}: ${convertedValue} !important`);
      }
    });
    
    // Check inline styles
    const inlineStyle = (element as HTMLElement).style;
    if (inlineStyle) {
      colorProperties.forEach(prop => {
        const value = inlineStyle.getPropertyValue(prop);
        if (value && oklchPattern.test(value)) {
          hasOklch = true;
          const convertedValue = value.replace(oklchPattern, convertOklchToRgb);
          newStyles.push(`${prop}: ${convertedValue} !important`);
        }
      });
    }
    
    // Check CSS variables
    const cssText = computedStyle.cssText;
    if (cssText && oklchPattern.test(cssText)) {
      hasOklch = true;
      const convertedCss = cssText.replace(oklchPattern, convertOklchToRgb);
      newStyles.push(convertedCss);
    }
    
    // Apply fixes if OKLCH found
    if (hasOklch) {
      const originalStyle = (element as HTMLElement).getAttribute('style') || '';
      originalStyles.set(element, originalStyle);
      
      const newStyleString = newStyles.join('; ');
      (element as HTMLElement).setAttribute('style', `${originalStyle}; ${newStyleString}`);
    }
    
    // Handle SVG elements specifically
    if (element.tagName === 'svg' || element.closest('svg')) {
      ['fill', 'stroke'].forEach(attr => {
        const value = element.getAttribute(attr);
        if (value && oklchPattern.test(value)) {
          originalStyles.set(element, element.getAttribute('style') || '');
          const convertedValue = value.replace(oklchPattern, convertOklchToRgb);
          element.setAttribute(attr, convertedValue);
        }
      });
    }
  });
  
  // Return cleanup function
  return () => {
    originalStyles.forEach((originalStyle, element) => {
      if (originalStyle) {
        (element as HTMLElement).setAttribute('style', originalStyle);
      } else {
        (element as HTMLElement).removeAttribute('style');
      }
    });
    originalStyles.clear();
  };
};

/**
 * Export chart using ApexCharts native method
 */
const exportViaApexCharts = async (chartId: string, filename: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Wait for chart to be fully rendered
      setTimeout(() => {
        const chartElement = document.getElementById(chartId);
        if (!chartElement) {
          reject(new Error(`Elemento do gráfico com ID '${chartId}' não encontrado`));
          return;
        }

        // Try to get ApexCharts instance
        const apexInstance = (window as any).ApexCharts?.getChartByID?.(chartId) || 
                           (chartElement as any).__apexcharts__;

        if (apexInstance && typeof apexInstance.dataURI === 'function') {
          apexInstance.dataURI().then((uri: string) => {
            const link = document.createElement('a');
            link.href = uri;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            resolve();
          }).catch(reject);
        } else {
          reject(new Error('Instância do ApexCharts não encontrada'));
        }
      }, 500);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Export chart using html2canvas with CORS and tainted canvas fixes
 */
const exportViaHtml2Canvas = async (chartId: string, filename: string): Promise<void> => {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    throw new Error(`Elemento do gráfico com ID '${chartId}' não encontrado`);
  }

  // Apply OKLCH color fixes
  const restoreColors = fixOklchColors();

  try {
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: false, // Prevent tainted canvas
      foreignObjectRendering: false, // Disable foreign object rendering
      imageTimeout: 0, // Disable image loading timeout
      ignoreElements: (element) => {
        // Ignore elements that might cause CORS issues
        return element.tagName === 'IMG' && element.getAttribute('src')?.startsWith('http');
      }
    });

    // Use a more robust blob creation method
    return new Promise<void>((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            resolve();
          } else {
            reject(new Error('Falha ao criar blob da imagem'));
          }
        }, 'image/png', 0.95);
      } catch (error) {
        reject(error);
      }
    });
  } finally {
    // Restore original colors
    restoreColors();
  }
};

/**
 * Export chart using SVG conversion with CORS fixes
 */
const exportViaSvgConversion = async (chartId: string, filename: string): Promise<void> => {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    throw new Error(`Elemento do gráfico com ID '${chartId}' não encontrado`);
  }

  const svgElement = chartElement.querySelector('svg');
  if (!svgElement) {
    throw new Error('Elemento SVG não encontrado no gráfico');
  }

  // Apply OKLCH fixes
  const restoreColors = fixOklchColors();

  try {
    // Clone SVG and convert OKLCH colors
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Set explicit dimensions
    const rect = svgElement.getBoundingClientRect();
    clonedSvg.setAttribute('width', rect.width.toString());
    clonedSvg.setAttribute('height', rect.height.toString());
    
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(clonedSvg);
    
    // Replace OKLCH colors in SVG string
    const oklchPattern = /oklch\([^)]+\)/g;
    svgString = svgString.replace(oklchPattern, '#808080');

    // Create canvas and draw SVG with proper CORS handling
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Não foi possível criar contexto do canvas');

    // Set canvas dimensions
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      // Handle CORS properly
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const downloadUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = downloadUrl;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(downloadUrl);
              resolve();
            } else {
              reject(new Error('Falha ao criar blob da imagem'));
            }
          }, 'image/png', 0.95);
        } catch (error) {
          reject(new Error(`Erro ao desenhar imagem: ${error}`));
        }
      };

      img.onerror = (error) => {
        reject(new Error(`Falha ao carregar SVG: ${error}`));
      };

      // Use data URL instead of blob URL to avoid CORS issues
      const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
      img.src = svgDataUrl;
    });
  } finally {
    restoreColors();
  }
};

/**
 * Alternative canvas-based export method
 */
const exportViaCanvasCapture = async (chartId: string, filename: string): Promise<void> => {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    throw new Error(`Elemento do gráfico com ID '${chartId}' não encontrado`);
  }

  // Apply OKLCH color fixes
  const restoreColors = fixOklchColors();

  try {
    // Create a new canvas for clean export
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Não foi possível criar contexto do canvas');

    const rect = chartElement.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Try to capture using html2canvas with minimal options
    const tempCanvas = await html2canvas(chartElement, {
      backgroundColor: null,
      scale: 1,
      logging: false,
      useCORS: false,
      allowTaint: true,
      foreignObjectRendering: false,
      removeContainer: true
    });

    // Draw the captured content onto our clean canvas
    ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);

    return new Promise<void>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          resolve();
        } else {
          reject(new Error('Falha ao criar blob da imagem'));
        }
      }, 'image/png', 0.95);
    });
  } finally {
    restoreColors();
  }
};

/**
 * Main chart export function with multiple fallback strategies
 */
export const exportChart = async (
  chartId: string = CHART_CONFIG.CHART_ID,
  filename?: string
): Promise<void> => {
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFilename = `grafico_tipos_amostra_${timestamp}.png`;
  const finalFilename = filename || defaultFilename;

  const strategies = [
    { name: 'ApexCharts', fn: () => exportViaApexCharts(chartId, finalFilename) },
    { name: 'SVG Conversion', fn: () => exportViaSvgConversion(chartId, finalFilename) },
    { name: 'Canvas Capture', fn: () => exportViaCanvasCapture(chartId, finalFilename) },
    { name: 'html2canvas', fn: () => exportViaHtml2Canvas(chartId, finalFilename) }
  ];

  let lastError: Error | null = null;

  for (const strategy of strategies) {
    try {
      await strategy.fn();
      return; // Success - exit
    } catch (error) {
      console.warn(`Estratégia ${strategy.name} falhou:`, error);
      lastError = error as Error;
      continue; // Try next strategy
    }
  }

  // All strategies failed
  throw new Error(`Falha ao exportar gráfico: ${lastError?.message || 'Erro desconhecido'}`);
};
