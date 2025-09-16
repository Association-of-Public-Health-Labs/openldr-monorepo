import html2canvas from 'html2canvas';

// ============================================================================
// TYPES
// ============================================================================

interface ExportOptions {
    format?: 'png' | 'jpeg';
    quality?: number;
    scale?: number;
}

// ============================================================================
// OKLCH COLOR FIX UTILITIES
// ============================================================================

/**
 * Check if a color value contains OKLCH function
 */
const isOklchColor = (colorValue: string): boolean => {
    return typeof colorValue === 'string' && colorValue.includes('oklch(');
};

/**
 * Convert OKLCH color to RGB using canvas
 */
const convertOklchToRgb = (oklchColor: string): string => {
    try {
        // Create a temporary canvas to convert the color
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return '#808080'; // Fallback gray
        
        // Try to set the OKLCH color and read it back as RGB
        ctx.fillStyle = oklchColor;
        const computedColor = ctx.fillStyle;
        
        // If the color was successfully converted, return it
        if (computedColor && computedColor !== oklchColor) {
            return computedColor;
        }
        
        // Fallback: try to parse OKLCH manually
        const oklchMatch = oklchColor.match(/oklch\(\s*([^)]+)\s*\)/);
        if (oklchMatch) {
            // This is a simplified conversion - in practice, you'd need a proper OKLCH to RGB converter
            return '#808080'; // Neutral gray fallback
        }
        
        return '#808080'; // Default fallback
    } catch (error) {
        console.warn('Failed to convert OKLCH color:', oklchColor, error);
        return '#808080'; // Fallback gray
    }
};

/**
 * Get all elements that might have OKLCH colors
 */
const getElementsWithPotentialOklchColors = (container: Element): Element[] => {
    const elements: Element[] = [];
    
    // Add the container itself
    elements.push(container);
    
    // Add all descendants
    const descendants = container.querySelectorAll('*');
    descendants.forEach(el => elements.push(el));
    
    return elements;
};

/**
 * Check and fix OKLCH colors in computed styles
 */
const checkAndFixOklchColors = (element: Element): { [key: string]: string } => {
    const originalStyles: { [key: string]: string } = {};
    const computedStyle = window.getComputedStyle(element);
    
    // List of CSS properties that can contain colors
    const colorProperties = [
        'color', 'backgroundColor', 'borderColor', 'borderTopColor', 
        'borderRightColor', 'borderBottomColor', 'borderLeftColor',
        'outlineColor', 'textDecorationColor', 'caretColor',
        'columnRuleColor', 'fill', 'stroke'
    ];
    
    colorProperties.forEach(property => {
        const value = computedStyle.getPropertyValue(property);
        if (value && isOklchColor(value)) {
            // Store original value
            originalStyles[property] = (element as HTMLElement).style.getPropertyValue(property) || '';
            
            // Convert and apply RGB equivalent
            const rgbColor = convertOklchToRgb(value);
            (element as HTMLElement).style.setProperty(property, rgbColor, 'important');
        }
    });
    
    return originalStyles;
};

/**
 * Restore original styles
 */
const restoreOriginalStyles = (element: Element, originalStyles: { [key: string]: string }): void => {
    Object.entries(originalStyles).forEach(([property, value]) => {
        if (value) {
            (element as HTMLElement).style.setProperty(property, value);
        } else {
            (element as HTMLElement).style.removeProperty(property);
        }
    });
};

/**
 * Apply OKLCH color fix to all elements in container
 */
const applyOklchColorFix = (container: Element): Map<Element, { [key: string]: string }> => {
    const elementsWithChanges = new Map<Element, { [key: string]: string }>();
    
    try {
        const elements = getElementsWithPotentialOklchColors(container);
        
        elements.forEach(element => {
            const originalStyles = checkAndFixOklchColors(element);
            if (Object.keys(originalStyles).length > 0) {
                elementsWithChanges.set(element, originalStyles);
            }
        });
    } catch (error) {
        console.warn('Error applying OKLCH color fix:', error);
    }
    
    return elementsWithChanges;
};

/**
 * Restore OKLCH colors after export
 */
const restoreOklchColors = (elementsWithChanges: Map<Element, { [key: string]: string }>): void => {
    try {
        elementsWithChanges.forEach((originalStyles, element) => {
            restoreOriginalStyles(element, originalStyles);
        });
    } catch (error) {
        console.warn('Error restoring OKLCH colors:', error);
    }
};

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export chart using ApexCharts native method
 */
const exportViaApexCharts = async (chartId: string, filename: string, options: ExportOptions = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            // Check if ApexCharts is available
            if (typeof window !== 'undefined' && (window as any).ApexCharts) {
                const ApexCharts = (window as any).ApexCharts;
                
                // Wait a bit for chart to be fully rendered
                setTimeout(() => {
                    try {
                        ApexCharts.exec(chartId, 'dataURI', {
                            scale: options.scale || 2,
                            format: options.format || 'png'
                        }).then((uri: string) => {
                            // Create download link
                            const link = document.createElement('a');
                            link.href = uri;
                            link.download = `${filename}.${options.format || 'png'}`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            resolve();
                        }).catch(reject);
                    } catch (error) {
                        reject(new Error(`ApexCharts export failed: ${error}`));
                    }
                }, 500);
            } else {
                reject(new Error('ApexCharts not available'));
            }
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Export chart using html2canvas with OKLCH color fix
 */
const exportViaHtml2Canvas = async (chartId: string, filename: string, options: ExportOptions = {}): Promise<void> => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
        throw new Error(`Chart element with id '${chartId}' not found`);
    }

    // Apply OKLCH color fix
    const elementsWithChanges = applyOklchColorFix(chartElement);

    try {
        const canvas = await html2canvas(chartElement, {
            scale: options.scale || 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            removeContainer: true,
            imageTimeout: 0,
            logging: false
        });

        // Convert to blob and download
        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${filename}.${options.format || 'png'}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        }, `image/${options.format || 'png'}`, options.quality || 0.9);

    } finally {
        // Restore original colors
        restoreOklchColors(elementsWithChanges);
    }
};

/**
 * Export chart using SVG conversion method
 */
const exportViaSvgConversion = async (chartId: string, filename: string, options: ExportOptions = {}): Promise<void> => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
        throw new Error(`Chart element with id '${chartId}' not found`);
    }

    // Find SVG element within the chart
    const svgElement = chartElement.querySelector('svg');
    if (!svgElement) {
        throw new Error('No SVG element found in chart');
    }

    // Apply OKLCH color fix
    const elementsWithChanges = applyOklchColorFix(chartElement);

    try {
        // Clone the SVG to avoid modifying the original
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;
        
        // Get SVG dimensions
        const bbox = svgElement.getBoundingClientRect();
        clonedSvg.setAttribute('width', bbox.width.toString());
        clonedSvg.setAttribute('height', bbox.height.toString());

        // Convert SVG to data URL
        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;

        // Create canvas and draw SVG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        const scale = options.scale || 2;
        canvas.width = bbox.width * scale;
        canvas.height = bbox.height * scale;
        ctx.scale(scale, scale);

        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            
            // Convert to blob and download
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${filename}.${options.format || 'png'}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
            }, `image/${options.format || 'png'}`, options.quality || 0.9);
        };
        
        img.onerror = () => {
            throw new Error('Failed to load SVG image');
        };
        
        img.src = svgDataUrl;

    } finally {
        // Restore original colors
        restoreOklchColors(elementsWithChanges);
    }
};

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Export chart with multiple fallback strategies
 */
export const exportChart = async (
    chartId: string, 
    filename: string, 
    options: ExportOptions = {}
): Promise<void> => {
    const strategies = [
        { name: 'ApexCharts', fn: exportViaApexCharts },
        { name: 'html2canvas', fn: exportViaHtml2Canvas },
        { name: 'SVG conversion', fn: exportViaSvgConversion }
    ];

    let lastError: Error | null = null;

    for (const strategy of strategies) {
        try {
            console.log(`Attempting chart export using ${strategy.name}...`);
            await strategy.fn(chartId, filename, options);
            console.log(`Chart exported successfully using ${strategy.name}`);
            return;
        } catch (error) {
            console.warn(`${strategy.name} export failed:`, error);
            lastError = error instanceof Error ? error : new Error(String(error));
        }
    }

    // If all strategies failed, throw the last error
    throw new Error(`All export strategies failed. Last error: ${lastError?.message || 'Unknown error'}`);
};
