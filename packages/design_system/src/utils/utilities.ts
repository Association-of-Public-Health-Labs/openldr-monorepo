
export function merge<T extends object>(target: T, source: Partial<T>): T {
  // Handle null/undefined cases
  if (!source) return target;
  if (!target) return source as T;

  // Create a new object to avoid mutating the originals
  const result = { ...target };

  // Iterate through source properties
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key as keyof typeof source];
    const targetValue = target[key as keyof typeof target];

    // Handle arrays
    if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
      (result as any)[key] = [...targetValue, ...sourceValue];
      return;
    }

    // Handle nested objects
    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(sourceValue) &&
      !Array.isArray(targetValue)
    ) {
      (result as any)[key] = merge(targetValue, sourceValue);
      return;
    }

    // Handle primitive values and other cases
    if (sourceValue !== undefined) {
      (result as any)[key] = sourceValue;
    }
  });

  return result;
}
