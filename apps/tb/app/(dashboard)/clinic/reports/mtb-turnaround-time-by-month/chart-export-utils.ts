const convertOKLCHToRGB = (oklchValue: string): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#666666';

    ctx.fillStyle = oklchValue;
    const computedColor = ctx.fillStyle;

    if (computedColor && computedColor !== oklchValue) {
      return computedColor;
    }

    const match = oklchValue.match(/oklch\(([^)]+)\)/);
    if (match) {
      const values = match[1].split(/\s+/);
      if (values.length >= 3) {
        const lightness = parseFloat(values[0]);
        const grayValue = Math.round(lightness * 255);
        return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
      }
    }

    return '#666666';
  } catch (error) {
    console.warn('Error converting OKLCH color:', error);
    return '#666666';
  }
};

const fixOKLCHColors = (): (() => void) => {
  const originalStyles: Array<{ element: Element; property: string; value: string }> = [];

  const colorProperties = [
    'color', 'backgroundColor', 'borderColor', 'borderTopColor',
    'borderRightColor', 'borderBottomColor', 'borderLeftColor',
    'outlineColor', 'textDecorationColor', 'fill', 'stroke'
  ];

  const allElements = document.querySelectorAll('*');

  allElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element);

    colorProperties.forEach(property => {
      const value = computedStyle.getPropertyValue(property);
      if (value && value.includes('oklch')) {
        originalStyles.push({ element, property, value });
        const rgbValue = convertOKLCHToRGB(value);
        (element as HTMLElement).style.setProperty(property, rgbValue, 'important');
      }
    });

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

const exportViaApexCharts = async (chartId: string, format: 'png' | 'jpeg'): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const chartElement = document.getElementById(chartId);
      if (!chartElement) {
        throw new Error(`Chart element with id '${chartId}' not found`);
      }

      const apexInstance = (chartElement as any).__apexcharts__;
      if (!apexInstance) {
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

const exportViaHtml2Canvas = async (chartId: string, format: 'png' | 'jpeg'): Promise<string> => {
  const { default: html2canvas } = await import('html2canvas');

  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    throw new Error(`Chart element with id '${chartId}' not found`);
  }

  const restoreColors = fixOKLCHColors();

  try {
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: false,
      allowTaint: true,
      foreignObjectRendering: false,
      imageTimeout: 0,
      removeContainer: true,
      ignoreElements: (element) => {
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
    restoreColors();
  }
};

const exportViaSvgConversion = async (chartId: string, format: 'png' | 'jpeg'): Promise<string> => {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    throw new Error(`Chart element with id '${chartId}' not found`);
  }

  const svgElement = chartElement.querySelector('svg');
  if (!svgElement) {
    throw new Error('No SVG element found in chart');
  }

  const restoreColors = fixOKLCHColors();

  try {
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;

    const rect = svgElement.getBoundingClientRect();
    clonedSvg.setAttribute('width', rect.width.toString());
    clonedSvg.setAttribute('height', rect.height.toString());

    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(clonedSvg);

    const oklchPattern = /oklch\([^)]+\)/g;
    svgString = svgString.replace(oklchPattern, '#808080');

    return new Promise((resolve, reject) => {
      try {
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

        img.src = svgDataUrl;
      } catch (error) {
        reject(new Error(`Error processing SVG: ${error}`));
      }
    });
  } finally {
    restoreColors();
  }
};

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
      const dataUrl = await method.fn();

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return;
    } catch (error) {
      console.warn(`Export via ${method.name} failed:`, error);
      lastError = error as Error;
      continue;
    }
  }

  throw new Error(`All export methods failed. Last error: ${lastError?.message}`);
};
