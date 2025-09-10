// Chart export utilities with OKLCH color fix and multiple fallback strategies

// OKLCH color conversion utilities
const convertOKLCHToRGB = (oklchValue: string): string => {
  try {
    // Create a temporary canvas to convert OKLCH to RGB
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#666666';
    
    ctx.fillStyle = oklchValue;
    const computedColor = ctx.fillStyle;
    
    // If the browser converted it, return the result
    if (computedColor && computedColor !== oklchValue) {
      return computedColor;
    }
    
    // Manual parsing fallback for OKLCH values
    const match = oklchValue.match(/oklch\(([^)]+)\)/);
    if (match) {
      const values = match[1].split(/\s+/);
      if (values.length >= 3) {
        // Simple approximation: convert to grayscale based on lightness
        const lightness = parseFloat(values[0]);
        const grayValue = Math.round(lightness * 255);
        return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
      }
    }
    
    return '#666666'; // Neutral gray fallback
  } catch (error) {
    console.warn('Error converting OKLCH color:', error);
    return '#666666';
  }
};

// Comprehensive OKLCH detection and replacement
const fixOKLCHColors = (): (() => void) => {
  const originalStyles: Array<{ element: Element; property: string; value: string }> = [];
  
  // All color properties that might contain OKLCH
  const colorProperties = [
    'color', 'backgroundColor', 'borderColor', 'borderTopColor', 
    'borderRightColor', 'borderBottomColor', 'borderLeftColor',
    'outlineColor', 'textDecorationColor', 'fill', 'stroke'
  ];
  
  // Find all elements in the document
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element);
    
    // Check each color property
    colorProperties.forEach(property => {
      const value = computedStyle.getPropertyValue(property);
      if (value && value.includes('oklch')) {
        // Store original value
        originalStyles.push({ element, property, value });
        
        // Convert and apply RGB equivalent
        const rgbValue = convertOKLCHToRGB(value);
        (element as HTMLElement).style.setProperty(property, rgbValue, 'important');
      }
    });
    
    // Check inline styles
    if (element instanceof HTMLElement && element.style) {
      colorProperties.forEach(property => {
        const camelCaseProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        const value = (element.style as any)[camelCaseProperty];
        if (value && value.includes('oklch')) {
          originalStyles.push({ element, property: camelCaseProperty, value });
          const rgbValue = convertOKLCHToRGB(value);
          (element.style as any)[camelCaseProperty] = rgbValue;
        }
      });
    }
    
    // Handle SVG elements
    if (element instanceof SVGElement) {
      ['fill', 'stroke'].forEach(attr => {
        const value = element.getAttribute(attr);
        if (value && value.includes('oklch')) {
          originalStyles.push({ element, property: attr, value });
          const rgbValue = convertOKLCHToRGB(value);
          element.setAttribute(attr, rgbValue);
        }
      });
    }
  });
  
  // Return cleanup function
  return () => {
    originalStyles.forEach(({ element, property, value }) => {
      if (element instanceof HTMLElement) {
        if (property.includes('-')) {
          element.style.setProperty(property, value);
        } else {
          (element.style as any)[property] = value;
        }
      } else if (element instanceof SVGElement) {
        element.setAttribute(property, value);
      }
    });
  };
};

// ApexCharts export method
const exportViaApexCharts = async (chartId: string, format: 'png' | 'jpeg'): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Try to get ApexCharts instance
      const chartElement = document.getElementById(chartId);
      if (!chartElement) {
        throw new Error(`Chart element with id '${chartId}' not found`);
      }
      
      // Check for ApexCharts instance
      const apexInstance = (chartElement as any).__apexcharts__;
      if (!apexInstance) {
        // Try global ApexCharts
        if (typeof window !== 'undefined' && (window as any).ApexCharts) {
          const ApexCharts = (window as any).ApexCharts;
          ApexCharts.exec(chartId, 'dataURI', { format }).then((uri: any) => {
            if (uri && uri.imgURI) {
              resolve(uri.imgURI);
            } else {
              reject(new Error('ApexCharts export returned invalid data'));
            }
          }).catch(reject);
        } else {
          throw new Error('ApexCharts instance not found');
        }
      } else {
        // Use instance method
        apexInstance.dataURI({ format }).then((uri: any) => {
          if (uri && uri.imgURI) {
            resolve(uri.imgURI);
          } else {
            reject(new Error('ApexCharts export returned invalid data'));
          }
        }).catch(reject);
      }
    } catch (error) {
      reject(error);
    }
  });
};

// html2canvas export method with OKLCH fix
const exportViaHtml2Canvas = async (chartId: string, format: 'png' | 'jpeg'): Promise<string> => {
  const { default: html2canvas } = await import('html2canvas');
  
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    throw new Error(`Chart element with id '${chartId}' not found`);
  }
  
  // Apply OKLCH color fix
  const restoreColors = fixOKLCHColors();
  
  try {
    // Wait a bit for color changes to take effect
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: false, // Disable CORS to prevent tainting
      allowTaint: true, // Allow tainted canvas for local content
      foreignObjectRendering: false,
      imageTimeout: 0,
      removeContainer: true,
      ignoreElements: (element) => {
        // Ignore external images and potentially problematic elements
        const tagName = element.tagName.toLowerCase();
        if (tagName === 'img') {
          const src = element.getAttribute('src');
          return src && (src.startsWith('http') || src.startsWith('//'));
        }
        if (tagName === 'iframe' || tagName === 'object' || tagName === 'embed') {
          return true;
        }
        return false;
      }
    });
    
    // Use blob creation instead of toDataURL to avoid tainted canvas issues
    return new Promise<string>((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read blob as data URL'));
            reader.readAsDataURL(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, `image/${format}`, format === 'jpeg' ? 0.9 : undefined);
      } catch (error) {
        reject(error);
      }
    });
  } finally {
    // Restore original colors
    restoreColors();
  }
};

// SVG conversion method
const exportViaSvgConversion = async (chartId: string, format: 'png' | 'jpeg'): Promise<string> => {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    throw new Error(`Chart element with id '${chartId}' not found`);
  }
  
  const svgElement = chartElement.querySelector('svg');
  if (!svgElement) {
    throw new Error('No SVG element found in chart');
  }
  
  // Apply OKLCH fix to SVG
  const restoreColors = fixOKLCHColors();
  
  try {
    // Clone and process SVG
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Set explicit dimensions
    const rect = svgElement.getBoundingClientRect();
    clonedSvg.setAttribute('width', rect.width.toString());
    clonedSvg.setAttribute('height', rect.height.toString());
    
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(clonedSvg);
    
    // Replace any remaining OKLCH colors in SVG string
    const oklchPattern = /oklch\([^)]+\)/g;
    svgString = svgString.replace(oklchPattern, '#808080');
    
    return new Promise((resolve, reject) => {
      try {
        // Use data URL directly to avoid CORS issues
        const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
        
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }
            
            canvas.width = rect.width * 2;
            canvas.height = rect.height * 2;
            ctx.scale(2, 2);
            
            if (format === 'jpeg') {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, rect.width, rect.height);
            }
            
            ctx.drawImage(img, 0, 0);
            
            // Use blob creation instead of toDataURL to avoid tainted canvas issues
            canvas.toBlob((blob) => {
              if (blob) {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error('Failed to read blob as data URL'));
                reader.readAsDataURL(blob);
              } else {
                reject(new Error('Failed to create blob from canvas'));
              }
            }, `image/${format}`, format === 'jpeg' ? 0.9 : undefined);
          } catch (error) {
            reject(new Error(`Error drawing image: ${error}`));
          }
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load SVG image'));
        };
        
        // Don't set crossOrigin to avoid CORS issues with data URLs
        img.src = svgDataUrl;
      } catch (error) {
        reject(new Error(`Error processing SVG: ${error}`));
      }
    });
  } finally {
    restoreColors();
  }
};

// Main export function with multiple fallbacks
export const exportChart = async (
  chartId: string,
  filename: string,
  format: 'png' | 'jpeg' = 'png'
): Promise<void> => {
  const methods = [
    { name: 'ApexCharts', fn: () => exportViaApexCharts(chartId, format) },
    { name: 'html2canvas', fn: () => exportViaHtml2Canvas(chartId, format) },
    { name: 'SVG conversion', fn: () => exportViaSvgConversion(chartId, format) }
  ];
  
  let lastError: Error | null = null;
  
  for (const method of methods) {
    try {
      console.log(`Attempting chart export via ${method.name}...`);
      const dataUrl = await method.fn();
      
      // Download the image
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Chart exported successfully via ${method.name}`);
      return;
    } catch (error) {
      console.warn(`Export via ${method.name} failed:`, error);
      lastError = error as Error;
      continue;
    }
  }
  
  throw new Error(`All export methods failed. Last error: ${lastError?.message}`);
};

// Convenience functions
export const exportChartAsPNG = (chartId: string, filename: string): Promise<void> => {
  return exportChart(chartId, filename, 'png');
};

export const exportChartAsJPEG = (chartId: string, filename: string): Promise<void> => {
  return exportChart(chartId, filename, 'jpeg');
};
