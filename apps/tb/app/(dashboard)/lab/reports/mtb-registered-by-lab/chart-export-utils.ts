import html2canvas from 'html2canvas';

// ============================================================================
// CHART EXPORT UTILITIES
// ============================================================================

/**
 * OKLCH color conversion utilities
 */
const convertOklchToRgb = (oklchValue: string): string => {
  try {
    // Create a temporary canvas to convert OKLCH to RGB
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#666666';
    
    ctx.fillStyle = oklchValue;
    const computedColor = ctx.fillStyle;
    
    // If the color was successfully parsed, return it
    if (computedColor && computedColor !== oklchValue) {
      return computedColor;
    }
  } catch (error) {
    console.warn('Failed to convert OKLCH color:', oklchValue);
  }
  
  // Fallback to neutral gray
  return '#666666';
};

/**
 * Fix OKLCH colors in DOM elements before export
 */
const fixOklchColors = (element: HTMLElement): Map<Element, { property: string; originalValue: string }[]> => {
  const changedElements = new Map<Element, { property: string; originalValue: string }[]>();
  
  // All possible color properties
  const colorProperties = [
    'color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 
    'borderBottomColor', 'borderLeftColor', 'outlineColor', 'textDecorationColor',
    'fill', 'stroke'
  ];
  
  // Find all elements including the root
  const allElements = [element, ...element.querySelectorAll('*')];
  
  allElements.forEach(el => {
    const htmlEl = el as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlEl);
    const changes: { property: string; originalValue: string }[] = [];
    
    colorProperties.forEach(property => {
      const value = computedStyle.getPropertyValue(property);
      if (value && value.includes('oklch')) {
        const convertedColor = convertOklchToRgb(value);
        changes.push({ property, originalValue: value });
        htmlEl.style.setProperty(property, convertedColor, 'important');
      }
    });
    
    // Handle CSS variables that might contain OKLCH
    const cssVariables = Array.from(computedStyle).filter(prop => prop.startsWith('--'));
    cssVariables.forEach(variable => {
      const value = computedStyle.getPropertyValue(variable);
      if (value && value.includes('oklch')) {
        const convertedColor = convertOklchToRgb(value);
        changes.push({ property: variable, originalValue: value });
        htmlEl.style.setProperty(variable, convertedColor, 'important');
      }
    });
    
    if (changes.length > 0) {
      changedElements.set(htmlEl, changes);
    }
  });
  
  return changedElements;
};

/**
 * Restore original colors after export
 */
const restoreOriginalColors = (changedElements: Map<Element, { property: string; originalValue: string }[]>): void => {
  changedElements.forEach((changes, element) => {
    const htmlEl = element as HTMLElement;
    changes.forEach(({ property, originalValue }) => {
      htmlEl.style.setProperty(property, originalValue);
    });
  });
};

/**
 * Export chart using ApexCharts native method
 */
export const exportViaApexCharts = async (chartId: string, filename: string): Promise<boolean> => {
  try {
    // Check if ApexCharts is available
    if (typeof window !== 'undefined' && (window as any).ApexCharts) {
      const ApexCharts = (window as any).ApexCharts;
      
      // Try to get chart instance
      const chartElement = document.getElementById(chartId);
      if (chartElement && (chartElement as any).__apexcharts__) {
        const chart = (chartElement as any).__apexcharts__;
        
        // Use ApexCharts native export
        await chart.dataURI({ type: 'png' }).then((uri: { imgURI: string }) => {
          const link = document.createElement('a');
          link.href = uri.imgURI;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
        
        return true;
      }
    }
    return false;
  } catch (error) {
    console.warn('ApexCharts export failed:', error);
    return false;
  }
};

/**
 * Export chart using html2canvas with OKLCH fix and taint prevention
 */
export const exportViaHtml2Canvas = async (chartId: string, filename: string): Promise<boolean> => {
  try {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      throw new Error(`Chart element with id '${chartId}' not found`);
    }

    // Fix OKLCH colors before capture
    const changedElements = fixOklchColors(chartElement);
    
    // Small delay to ensure styles are applied
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: false, // Prevent tainted canvas
        foreignObjectRendering: false, // Disable foreign object rendering
        imageTimeout: 0, // Disable image loading timeout
        removeContainer: true // Clean up after rendering
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } finally {
      // Always restore original colors
      restoreOriginalColors(changedElements);
    }
  } catch (error) {
    console.warn('html2canvas export failed:', error);
    return false;
  }
};

/**
 * Export chart using direct DOM-to-canvas conversion (taint-safe)
 */
export const exportViaDirectCanvas = async (chartId: string, filename: string): Promise<boolean> => {
  try {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) return false;
    
    // Create a new canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    // Get element dimensions
    const rect = chartElement.getBoundingClientRect();
    canvas.width = rect.width * 2; // High DPI
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Try to render SVG directly if available
    const svgElement = chartElement.querySelector('svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      
      // Use FileReader instead of URL.createObjectURL to avoid taint
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            try {
              ctx.drawImage(img, 0, 0, rect.width, rect.height);
              
              // Create download link
              const link = document.createElement('a');
              link.download = filename;
              link.href = canvas.toDataURL('image/png');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              resolve(true);
            } catch (error) {
              console.warn('Direct canvas export failed:', error);
              resolve(false);
            }
          };
          img.onerror = () => resolve(false);
          img.src = e.target?.result as string;
        };
        reader.onerror = () => resolve(false);
        reader.readAsDataURL(svgBlob);
      });
    }
    
    return false;
  } catch (error) {
    console.warn('Direct canvas export failed:', error);
    return false;
  }
};

/**
 * Export chart using SVG conversion with taint prevention
 */
export const exportViaSvgConversion = async (chartId: string, filename: string): Promise<boolean> => {
  try {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) return false;
    
    const svgElement = chartElement.querySelector('svg');
    if (!svgElement) return false;
    
    // Clone SVG and fix OKLCH colors
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    const changedElements = fixOklchColors(clonedSvg as any);
    
    // Get SVG dimensions
    const rect = svgElement.getBoundingClientRect();
    
    // Create canvas with proper dimensions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    canvas.width = rect.width * 2; // High DPI
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Convert SVG to data URL directly (avoid blob URLs that cause taint)
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          
          // Create download link
          const link = document.createElement('a');
          link.download = filename;
          link.href = canvas.toDataURL('image/png');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          resolve(true);
        } catch (error) {
          console.warn('SVG canvas export failed:', error);
          resolve(false);
        }
      };
      img.onerror = () => resolve(false);
      img.src = svgDataUrl;
    });
  } catch (error) {
    console.warn('SVG conversion export failed:', error);
    return false;
  }
};

/**
 * Main export function with multiple fallback strategies
 */
export const exportChart = async (chartId: string, reportName: string): Promise<void> => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `${reportName.replace(/\s+/g, '_')}_${timestamp}.png`;
  
  try {
    // Strategy 1: Try ApexCharts native export
    const apexSuccess = await exportViaApexCharts(chartId, filename);
    if (apexSuccess) return;
    
    // Strategy 2: Try html2canvas with OKLCH fix
    const html2canvasSuccess = await exportViaHtml2Canvas(chartId, filename);
    if (html2canvasSuccess) return;
    
    // Strategy 3: Try direct canvas export
    const directCanvasSuccess = await exportViaDirectCanvas(chartId, filename);
    if (directCanvasSuccess) return;
    
    // Strategy 4: Try SVG conversion
    const svgSuccess = await exportViaSvgConversion(chartId, filename);
    if (svgSuccess) return;
    
    throw new Error('Todas as estratégias de exportação falharam');
  } catch (error) {
    console.error('Erro ao exportar gráfico:', error);
    throw new Error('Falha na exportação da imagem do gráfico');
  }
};
