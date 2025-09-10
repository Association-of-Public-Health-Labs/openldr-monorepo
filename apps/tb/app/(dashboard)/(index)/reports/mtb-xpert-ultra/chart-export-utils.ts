import html2canvas from 'html2canvas';

// OKLCH Color Conversion Utilities
function oklchToRgb(oklch: string): string {
  try {
    // Create a temporary canvas element for color conversion
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#6b7280'; // Fallback gray
    
    ctx.fillStyle = oklch;
    return ctx.fillStyle as string;
  } catch {
    // Manual parsing fallback for OKLCH
    const match = oklch.match(/oklch\(([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\)/);
    if (match) {
      // Simple conversion - this is a basic approximation
      const l = parseFloat(match[1]) / 100;
      const gray = Math.round(l * 255);
      return `rgb(${gray}, ${gray}, ${gray})`;
    }
    return '#6b7280'; // Neutral gray fallback
  }
}

function isOklchColor(color: string): boolean {
  return color.includes('oklch(');
}

function fixOklchColors(): Map<Element, { property: string; originalValue: string }[]> {
  const modifiedElements = new Map<Element, { property: string; originalValue: string }[]>();
  
  const colorProperties = [
    'color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor',
    'borderBottomColor', 'borderLeftColor', 'fill', 'stroke', 'outlineColor',
    'textDecorationColor', 'caretColor', 'columnRuleColor'
  ];

  // Fix all elements in the document
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element);
    const modifications: { property: string; originalValue: string }[] = [];
    
    colorProperties.forEach(property => {
      const value = computedStyle.getPropertyValue(property);
      if (value && isOklchColor(value)) {
        const rgbValue = oklchToRgb(value);
        modifications.push({ property, originalValue: value });
        (element as HTMLElement).style.setProperty(property, rgbValue, 'important');
      }
    });

    // Check CSS variables
    for (let i = 0; i < computedStyle.length; i++) {
      const property = computedStyle[i];
      if (property.startsWith('--')) {
        const value = computedStyle.getPropertyValue(property);
        if (value && isOklchColor(value)) {
          modifications.push({ property, originalValue: value });
          (element as HTMLElement).style.setProperty(property, oklchToRgb(value), 'important');
        }
      }
    }

    // Handle SVG-specific attributes
    if (element.tagName === 'svg' || element.closest('svg')) {
      ['fill', 'stroke'].forEach(attr => {
        const value = element.getAttribute(attr);
        if (value && isOklchColor(value)) {
          modifications.push({ property: attr, originalValue: value });
          element.setAttribute(attr, oklchToRgb(value));
        }
      });
    }

    if (modifications.length > 0) {
      modifiedElements.set(element, modifications);
    }
  });

  return modifiedElements;
}

function restoreOriginalColors(modifiedElements: Map<Element, { property: string; originalValue: string }[]>): void {
  modifiedElements.forEach((modifications, element) => {
    modifications.forEach(({ property, originalValue }) => {
      if (property === 'fill' || property === 'stroke') {
        element.setAttribute(property, originalValue);
      } else {
        (element as HTMLElement).style.setProperty(property, originalValue);
      }
    });
  });
}

// Export Functions
export async function exportViaApexCharts(chartId: string, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Try to get ApexCharts instance
      const chartElement = document.getElementById(chartId);
      if (!chartElement) {
        throw new Error(`Chart element with id '${chartId}' not found`);
      }

      // Check for ApexCharts instance
      const apexChartsInstance = (chartElement as any).__apexcharts__;
      if (!apexChartsInstance) {
        throw new Error('ApexCharts instance not found');
      }

      // Use ApexCharts built-in export
      apexChartsInstance.dataURI().then((uri: { imgURI: string }) => {
        const link = document.createElement('a');
        link.href = uri.imgURI;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve();
      }).catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

export async function exportViaHtml2Canvas(chartId: string, filename: string): Promise<void> {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    throw new Error(`Chart element with id '${chartId}' not found`);
  }

  // Fix OKLCH colors before capture
  const modifiedElements = fixOklchColors();

  try {
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      ignoreElements: (element) => {
        return element.classList?.contains('html2canvas-ignore') || false;
      }
    });

    // Convert to blob and download
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
      }
    }, 'image/png');
  } finally {
    // Restore original colors
    restoreOriginalColors(modifiedElements);
  }
}

export async function exportViaSvgConversion(chartId: string, filename: string): Promise<void> {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    throw new Error(`Chart element with id '${chartId}' not found`);
  }

  const svgElement = chartElement.querySelector('svg');
  if (!svgElement) {
    throw new Error('SVG element not found in chart');
  }

  // Clone and fix OKLCH colors in SVG
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  
  // Convert OKLCH colors in SVG
  const allSvgElements = clonedSvg.querySelectorAll('*');
  allSvgElements.forEach(element => {
    ['fill', 'stroke'].forEach(attr => {
      const value = element.getAttribute(attr);
      if (value && isOklchColor(value)) {
        element.setAttribute(attr, oklchToRgb(value));
      }
    });
  });

  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    
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
      }
    }, 'image/png');
  };
  
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  img.src = url;
}

export async function exportChart(chartId: string, reportName: string, activeTab: string): Promise<void> {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${reportName.toLowerCase().replace(/\s+/g, '-')}-${activeTab}-${timestamp}.png`;

  try {
    // Strategy 1: Try ApexCharts native export
    await exportViaApexCharts(chartId, filename);
  } catch (error) {
    console.warn('ApexCharts export failed, trying html2canvas:', error);
    
    try {
      // Strategy 2: Try html2canvas
      await exportViaHtml2Canvas(chartId, filename);
    } catch (error2) {
      console.warn('html2canvas export failed, trying SVG conversion:', error2);
      
      try {
        // Strategy 3: Try SVG conversion
        await exportViaSvgConversion(chartId, filename);
      } catch (error3) {
        console.error('All export methods failed:', error3);
        throw new Error('Falha na exportação da imagem do gráfico');
      }
    }
  }
}
