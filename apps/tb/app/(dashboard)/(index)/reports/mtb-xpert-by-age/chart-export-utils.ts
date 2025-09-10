import html2canvas from 'html2canvas';
import { CHART_CONFIG, UI_CONFIG, ActiveTab } from './constants';

// =============================================================================
// CHART EXPORT FUNCTIONS
// =============================================================================

export const generateImageFilename = (activeTab: ActiveTab): string => {
    const timestamp = new Date().toISOString().split('T')[0];
    const tabSuffix = activeTab === 'ultra' ? 'Ultra' : 'XDR';
    return `${UI_CONFIG.EXPORT_OPTIONS.IMAGE.FILENAME_PREFIX}_${tabSuffix}_${timestamp}.${UI_CONFIG.EXPORT_OPTIONS.IMAGE.FORMAT}`;
};

// OKLCH color conversion utilities
const convertOklchToRgb = (oklchValue: string): string => {
    try {
        // Create a temporary canvas to convert OKLCH to RGB
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return '#666666'; // Fallback gray
        
        ctx.fillStyle = oklchValue;
        const computedColor = ctx.fillStyle;
        
        // If the color was successfully parsed, return it
        if (computedColor && computedColor !== oklchValue) {
            return computedColor;
        }
        
        // Manual parsing fallback for OKLCH
        const oklchMatch = oklchValue.match(/oklch\(([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\)/);
        if (oklchMatch) {
            // Simple approximation - convert to a neutral gray based on lightness
            const lightness = parseFloat(oklchMatch[1]);
            const grayValue = Math.round(lightness * 2.55);
            return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        }
        
        return '#666666'; // Neutral gray fallback
    } catch (error) {
        console.warn('Failed to convert OKLCH color:', oklchValue, error);
        return '#666666';
    }
};

const fixOklchColors = (): (() => void) => {
    const elementsToRestore: Array<{ element: Element; property: string; originalValue: string }> = [];
    
    try {
        // Get all elements in the document
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            
            // List of CSS properties that can contain colors
            const colorProperties = [
                'color', 'backgroundColor', 'borderColor', 'borderTopColor', 
                'borderRightColor', 'borderBottomColor', 'borderLeftColor',
                'outlineColor', 'textDecorationColor', 'fill', 'stroke'
            ];
            
            colorProperties.forEach(property => {
                const value = computedStyle.getPropertyValue(property);
                
                if (value && value.includes('oklch')) {
                    const originalValue = (element as HTMLElement).style.getPropertyValue(property);
                    elementsToRestore.push({ element, property, originalValue });
                    
                    const rgbValue = convertOklchToRgb(value);
                    (element as HTMLElement).style.setProperty(property, rgbValue, 'important');
                }
            });
            
            // Handle SVG elements specifically
            if (element.tagName === 'path' || element.tagName === 'circle' || element.tagName === 'rect') {
                ['fill', 'stroke'].forEach(attr => {
                    const value = element.getAttribute(attr);
                    if (value && value.includes('oklch')) {
                        elementsToRestore.push({ element, property: attr, originalValue: value });
                        const rgbValue = convertOklchToRgb(value);
                        element.setAttribute(attr, rgbValue);
                    }
                });
            }
        });
        
        // Return cleanup function
        return () => {
            elementsToRestore.forEach(({ element, property, originalValue }) => {
                if (property === 'fill' || property === 'stroke') {
                    if (originalValue) {
                        element.setAttribute(property, originalValue);
                    } else {
                        element.removeAttribute(property);
                    }
                } else {
                    if (originalValue) {
                        (element as HTMLElement).style.setProperty(property, originalValue);
                    } else {
                        (element as HTMLElement).style.removeProperty(property);
                    }
                }
            });
        };
    } catch (error) {
        console.warn('Error fixing OKLCH colors:', error);
        return () => {}; // Return empty cleanup function
    }
};

export const exportViaApexCharts = async (chartId: string, filename: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            // Wait for chart to be fully rendered
            setTimeout(() => {
                if (typeof window !== 'undefined' && (window as any).ApexCharts) {
                    const chart = (window as any).ApexCharts.getChartByID(chartId);
                    
                    if (chart) {
                        chart.dataURI().then((uri: { imgURI: string }) => {
                            const link = document.createElement('a');
                            link.href = uri.imgURI;
                            link.download = filename;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            resolve();
                        }).catch((error: Error) => {
                            console.warn('ApexCharts export failed:', error);
                            reject(error);
                        });
                    } else {
                        reject(new Error('Chart instance not found'));
                    }
                } else {
                    reject(new Error('ApexCharts not available'));
                }
            }, 500);
        } catch (error) {
            reject(error);
        }
    });
};

export const exportViaHtml2Canvas = async (chartId: string, filename: string): Promise<void> => {
    const chartElement = document.getElementById(chartId);
    
    if (!chartElement) {
        throw new Error(`Chart element with id '${chartId}' not found`);
    }
    
    // Fix OKLCH colors before capture
    const restoreColors = fixOklchColors();
    
    try {
        const canvas = await html2canvas(chartElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: false, // Disable CORS to avoid tainting
            allowTaint: false,
            foreignObjectRendering: false,
            imageTimeout: 15000,
            removeContainer: true,
            proxy: undefined, // Disable proxy to avoid CORS issues
            ignoreElements: (element) => {
                // Ignore elements that might cause CORS issues
                return element.tagName === 'IFRAME' || 
                       element.tagName === 'OBJECT' || 
                       element.tagName === 'EMBED' ||
                       element.tagName === 'IMG' || // Ignore images that might cause tainting
                       element.classList.contains('ignore-export');
            }
        });
        
        // Try to export without using canvas methods that can fail with tainted canvas
        try {
            // Create a new clean canvas and copy the image data
            const cleanCanvas = document.createElement('canvas');
            const cleanCtx = cleanCanvas.getContext('2d');
            
            if (!cleanCtx) {
                throw new Error('Cannot create clean canvas context');
            }
            
            cleanCanvas.width = canvas.width;
            cleanCanvas.height = canvas.height;
            
            // Fill with white background
            cleanCtx.fillStyle = '#ffffff';
            cleanCtx.fillRect(0, 0, cleanCanvas.width, cleanCanvas.height);
            
            // Try to get image data and redraw on clean canvas
            const imageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
            if (imageData) {
                cleanCtx.putImageData(imageData, 0, 0);
                
                // Now try to export the clean canvas
                const link = document.createElement('a');
                link.download = filename;
                link.href = cleanCanvas.toDataURL('image/png');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                throw new Error('Cannot get image data from canvas');
            }
        } catch (canvasError) {
            console.warn('Canvas export failed, falling back to direct download:', canvasError);
            // Last resort: try to use the original canvas directly with a different approach
            throw new Error('Canvas is tainted and cannot be exported. Please try the SVG export method.');
        }
    } finally {
        // Restore original colors
        restoreColors();
    }
};

export const exportViaSvgConversion = async (chartId: string, filename: string): Promise<void> => {
    const chartElement = document.getElementById(chartId);
    
    if (!chartElement) {
        throw new Error(`Chart element with id '${chartId}' not found`);
    }
    
    const svgElement = chartElement.querySelector('svg');
    
    if (!svgElement) {
        throw new Error('SVG element not found in chart');
    }
    
    // Fix OKLCH colors in SVG
    const restoreColors = fixOklchColors();
    
    try {
        // Clone the SVG to avoid modifying the original
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;
        
        // Set explicit dimensions if not present
        const rect = svgElement.getBoundingClientRect();
        if (!clonedSvg.getAttribute('width')) {
            clonedSvg.setAttribute('width', rect.width.toString());
        }
        if (!clonedSvg.getAttribute('height')) {
            clonedSvg.setAttribute('height', rect.height.toString());
        }
        
        // Add white background to SVG
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('width', '100%');
        bgRect.setAttribute('height', '100%');
        bgRect.setAttribute('fill', '#ffffff');
        clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);
        
        // Convert SVG to data URL directly (avoiding canvas)
        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
        const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;
        
        // Create a new image and canvas for conversion
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            throw new Error('Canvas context not available');
        }
        
        return new Promise((resolve, reject) => {
            img.onload = () => {
                try {
                    // Set canvas size
                    canvas.width = img.naturalWidth || rect.width * 2;
                    canvas.height = img.naturalHeight || rect.height * 2;
                    
                    // Fill with white background
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw the image
                    ctx.drawImage(img, 0, 0);
                    
                    // Export using toDataURL (should work since we're not using external resources)
                    const link = document.createElement('a');
                    link.download = filename;
                    link.href = canvas.toDataURL('image/png');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    resolve();
                } catch (error) {
                    console.warn('SVG to canvas conversion failed:', error);
                    // Fallback: download SVG directly
                    try {
                        const link = document.createElement('a');
                        link.download = filename.replace('.png', '.svg');
                        link.href = svgDataUrl;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        resolve();
                    } catch (svgError) {
                        reject(new Error('Both PNG and SVG export failed'));
                    }
                }
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load SVG image'));
            };
            
            // Load the SVG as data URL (no CORS issues)
            img.src = svgDataUrl;
        });
    } finally {
        restoreColors();
    }
};

export const exportChart = async (activeTab: ActiveTab): Promise<void> => {
    const chartId = CHART_CONFIG.CHART_ID;
    const filename = generateImageFilename(activeTab);
    
    // Try multiple export strategies
    const strategies = [
        () => exportViaApexCharts(chartId, filename),
        () => exportViaHtml2Canvas(chartId, filename),
        () => exportViaSvgConversion(chartId, filename),
    ];
    
    let lastError: Error | null = null;
    
    for (const strategy of strategies) {
        try {
            await strategy();
            return; // Success, exit early
        } catch (error) {
            console.warn('Export strategy failed:', error);
            lastError = error as Error;
            continue; // Try next strategy
        }
    }
    
    // If all strategies failed, throw the last error
    throw lastError || new Error('All export strategies failed');
};
