import html2canvas from 'html2canvas';
import { CHART_CONFIG, ActiveTab } from './constants';

// =============================================================================
// CHART EXPORT FUNCTIONS
// =============================================================================

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

/**
 * Export map container using html2canvas with CORS handling
 */
const exportViaHtml2Canvas = async (
  elementId: string,
  filename: string,
  format: 'png' | 'jpeg' = 'png'
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemento com ID '${elementId}' não encontrado`);
  }

  // Fix OKLCH colors before capture
  const modifiedElements = fixOklchColors(element);
  
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: false,
      foreignObjectRendering: false,
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight,
      onclone: (clonedDoc) => {
        // Remove any external font references that might cause CORS issues
        const styleSheets = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
        styleSheets.forEach(sheet => {
          const href = (sheet as HTMLLinkElement).href;
          if (href && (href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com'))) {
            sheet.remove();
          }
        });
        
        // Set fallback fonts for any text elements
        const textElements = clonedDoc.querySelectorAll('text, tspan');
        textElements.forEach(el => {
          (el as HTMLElement).style.fontFamily = 'Arial, sans-serif';
        });
      }
    });

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Falha ao gerar imagem');
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, `image/${format}`, 0.95);
    
  } finally {
    // Always restore original colors
    restoreOklchColors(modifiedElements);
  }
};

/**
 * Export SVG directly without canvas conversion (CORS-safe)
 */
const exportSvgDirectly = async (
  elementId: string,
  filename: string
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemento com ID '${elementId}' não encontrado`);
  }

  // Find SVG elements within the container
  const svgElements = element.querySelectorAll('svg');
  if (svgElements.length === 0) {
    throw new Error('Nenhum elemento SVG encontrado para exportar');
  }

  // Use the first SVG element for export
  const svgElement = svgElements[0] as SVGSVGElement;
  
  // Clone the SVG to avoid modifying the original
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
  
  // Set explicit dimensions
  const bbox = svgElement.getBoundingClientRect();
  clonedSvg.setAttribute('width', bbox.width.toString());
  clonedSvg.setAttribute('height', bbox.height.toString());
  clonedSvg.setAttribute('viewBox', `0 0 ${bbox.width} ${bbox.height}`);
  
  // Remove any external font references and use safe fonts
  const textElements = clonedSvg.querySelectorAll('text, tspan');
  textElements.forEach(el => {
    (el as SVGTextElement).style.fontFamily = 'Arial, sans-serif';
    (el as SVGTextElement).removeAttribute('font-family');
  });
  
  // Remove any external stylesheets or links
  const linkElements = clonedSvg.querySelectorAll('link');
  linkElements.forEach(link => link.remove());
  
  // Serialize SVG to string
  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  
  // Create blob and download
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.replace(/\.(png|jpeg)$/, '.svg');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate filename for chart export
 */
export const generateChartFilename = (
  activeTab: ActiveTab,
  format: 'png' | 'jpeg' = 'png'
): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const tabType = activeTab === 'ultra' ? 'Ultra' : 'XDR';
  return `Positividade_Mapa_${tabType}_${timestamp}.${format}`;
};

/**
 * Main export function with CORS-safe fallback strategies
 */
export const exportMapChart = async (
  activeTab: ActiveTab,
  format: 'png' | 'jpeg' = 'png'
): Promise<void> => {
  const filename = generateChartFilename(activeTab, format);
  const elementId = CHART_CONFIG.CHART_ID;
  
  try {
    // Try direct SVG export first (completely CORS-safe)
    await exportSvgDirectly(elementId, filename);
    console.log(`Mapa exportado como SVG: ${filename.replace(/\.(png|jpeg)$/, '.svg')}`);
  } catch (svgDirectError) {
    console.warn('Direct SVG export failed, trying html2canvas:', svgDirectError);
    
    try {
      // Fallback to html2canvas with CORS protection
      await exportViaHtml2Canvas(elementId, filename, format);
      console.log(`Mapa exportado com sucesso via html2canvas: ${filename}`);
    } catch (canvasError) {
      console.error('All export methods failed:', canvasError);
      throw new Error(`Falha ao exportar mapa: ${svgDirectError instanceof Error ? svgDirectError.message : 'Erro desconhecido'}`);
    }
  }
};

/**
 * Export map as PNG
 */
export const exportMapAsPNG = async (activeTab: ActiveTab): Promise<void> => {
  return exportMapChart(activeTab, 'png');
};

/**
 * Export map as JPEG
 */
export const exportMapAsJPEG = async (activeTab: ActiveTab): Promise<void> => {
  return exportMapChart(activeTab, 'jpeg');
};
