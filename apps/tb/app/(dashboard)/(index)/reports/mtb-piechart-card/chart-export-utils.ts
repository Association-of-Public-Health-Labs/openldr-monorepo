import html2canvas from 'html2canvas';
import { CHART_CONFIG } from './constants';

// ============================================================================
// CHART.JS EXPORT UTILITIES
// ============================================================================

/**
 * Export chart as PNG using Chart.js native method
 */
export const exportChartAsPNG = (chart: any, filename: string): void => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = chart.toBase64Image('image/png', 1);
    link.click();
};

/**
 * Export chart as JPEG using Chart.js native method
 */
export const exportChartAsJPEG = (chart: any, filename: string): void => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = chart.toBase64Image('image/jpeg', 0.9);
    link.click();
};

/**
 * Convert OKLCH colors to RGB for html2canvas compatibility
 */
const convertOklchToRgb = (oklchColor: string): string => {
    // Handle OKLCH color function parsing
    const oklchMatch = oklchColor.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (oklchMatch) {
        const [, l, c, h] = oklchMatch.map(Number);
        // Simple approximation - convert to HSL then RGB
        // This is a basic conversion, more sophisticated libraries could be used
        const hue = h;
        const saturation = Math.min(c * 100, 100);
        const lightness = Math.min(l * 100, 100);
        
        // Convert HSL to RGB (simplified)
        const hslToRgb = (h: number, s: number, l: number) => {
            h /= 360;
            s /= 100;
            l /= 100;
            
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        };
        
        const [r, g, b] = hslToRgb(hue, saturation, lightness);
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Fallback patterns for common OKLCH values
    const oklchPatterns = {
        'oklch(0.7 0.15 142)': '#22c55e', // green
        'oklch(0.6 0.2 258)': '#3b82f6',  // blue
        'oklch(0.75 0.15 85)': '#f59e0b', // yellow
        'oklch(0.6 0.22 25)': '#ef4444',  // red
        'oklch(0.5 0.02 247)': '#6b7280', // gray
    };
    
    return oklchPatterns[oklchColor as keyof typeof oklchPatterns] || '#808080'; // neutral gray fallback
};

/**
 * Fix OKLCH colors in DOM elements before capture
 */
const fixOklchColors = (element: HTMLElement): Map<HTMLElement, { property: string; value: string }[]> => {
    const originalStyles = new Map<HTMLElement, { property: string; value: string }[]>();
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_ELEMENT,
        null
    );

    const elements: HTMLElement[] = [element];
    let node;
    while (node = walker.nextNode()) {
        elements.push(node as HTMLElement);
    }

    elements.forEach(el => {
        const computedStyle = window.getComputedStyle(el);
        const originalProps: { property: string; value: string }[] = [];
        
        // Get ALL CSS properties, not just a subset
        const allProperties = Array.from(computedStyle);
        
        allProperties.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value && value.includes('oklch')) {
                const originalValue = el.style.getPropertyValue(prop);
                originalProps.push({ property: prop, value: originalValue });
                el.style.setProperty(prop, convertOklchToRgb(value), 'important');
            }
        });
        
        // Also check inline styles directly
        const inlineStyle = el.getAttribute('style');
        if (inlineStyle && inlineStyle.includes('oklch')) {
            const oklchRegex = /oklch\([^)]+\)/g;
            const newInlineStyle = inlineStyle.replace(oklchRegex, (match) => convertOklchToRgb(match));
            originalProps.push({ property: 'style', value: inlineStyle });
            el.setAttribute('style', newInlineStyle);
        }
        
        // Check CSS variables in :root and current element
        if (el === document.documentElement || el.style.cssText.includes('--')) {
            const cssText = el.style.cssText;
            if (cssText.includes('oklch')) {
                const oklchRegex = /oklch\([^)]+\)/g;
                const newCssText = cssText.replace(oklchRegex, (match) => convertOklchToRgb(match));
                if (newCssText !== cssText) {
                    originalProps.push({ property: 'cssText', value: cssText });
                    el.style.cssText = newCssText;
                }
            }
        }
        
        // Check SVG-specific attributes
        if (el.tagName.toLowerCase().includes('svg') || el.closest('svg')) {
            const svgColorAttrs = ['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color'];
            svgColorAttrs.forEach(attr => {
                const value = el.getAttribute(attr);
                if (value && value.includes('oklch')) {
                    originalProps.push({ property: `attr-${attr}`, value });
                    el.setAttribute(attr, convertOklchToRgb(value));
                }
            });
        }
        
        if (originalProps.length > 0) {
            originalStyles.set(el, originalProps);
        }
    });

    return originalStyles;
};

/**
 * Restore original styles after capture
 */
const restoreOriginalStyles = (originalStyles: Map<HTMLElement, { property: string; value: string }[]>) => {
    originalStyles.forEach((originalProps, element) => {
        originalProps.forEach(({ property, value }) => {
            if (property === 'style') {
                element.setAttribute('style', value);
            } else if (property === 'cssText') {
                element.style.cssText = value;
            } else if (property.startsWith('attr-')) {
                const attrName = property.replace('attr-', '');
                element.setAttribute(attrName, value);
            } else if (value) {
                element.style.setProperty(property, value);
            } else {
                element.style.removeProperty(property);
            }
        });
    });
};

/**
 * Export chart using html2canvas with OKLCH color fix as fallback
 */
const exportViaHtml2Canvas = async (
    chartElement: HTMLElement,
    filename: string,
    format: 'png' | 'jpeg' = 'png'
): Promise<void> => {
    const originalStyles = fixOklchColors(chartElement);

    try {
        const canvas = await html2canvas(chartElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
        });

        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL(`image/${format}`, 0.9);
        link.click();
    } finally {
        restoreOriginalStyles(originalStyles);
    }
};

/**
 * Main Chart.js export function with fallback to html2canvas
 */
export const exportChart = async (
    reportName: string,
    activeTab: string,
    format: 'png' | 'jpeg' = 'png'
): Promise<void> => {
    try {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${reportName.replace(/\s+/g, '_')}_${activeTab}_${timestamp}.${format}`;

        // First try to find Chart.js instance
        let chartInstance = null;
        
        // Look for Chart.js canvas element
        const canvasElements = document.querySelectorAll('canvas');
        for (const canvas of canvasElements) {
            // Check if this canvas has a Chart.js instance
            if ((canvas as any).chart) {
                chartInstance = (canvas as any).chart;
                break;
            }
        }

        // If Chart.js instance found, use native export
        if (chartInstance) {
            if (format === 'png') {
                exportChartAsPNG(chartInstance, filename);
            } else {
                exportChartAsJPEG(chartInstance, filename);
            }
            console.log(`Chart exported via Chart.js native method: ${filename}`);
            return;
        }

        // Fallback to html2canvas if Chart.js instance not found
        const chartElement = document.getElementById(CHART_CONFIG.CHART_ID);
        if (!chartElement) {
            // Try to find any chart container
            const chartContainer = document.querySelector('[data-testid="chart-container"]') || 
                                 document.querySelector('.recharts-wrapper') ||
                                 document.querySelector('canvas')?.parentElement;
            
            if (!chartContainer) {
                throw new Error('No chart element found for export');
            }
            
            await exportViaHtml2Canvas(chartContainer as HTMLElement, filename, format);
        } else {
            await exportViaHtml2Canvas(chartElement, filename, format);
        }
        
        console.log(`Chart exported via html2canvas fallback: ${filename}`);
    } catch (error) {
        console.error('Error exporting chart:', error);
        throw error;
    }
};
