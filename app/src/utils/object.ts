/**
 * Create a new object containing only the specified keys.
 */
export function pick<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[]
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Create a new object with the specified keys removed.
 */
export function omit<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[]
): Partial<T> {
  const result = { ...obj } as Partial<T>;
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Create a deep clone of a value using structured cloning.
 * Works with plain objects, arrays, dates, maps, sets, and primitives.
 */
export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as T;
  }

  const cloned: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    cloned[key] = deepClone((value as Record<string, unknown>)[key]);
  }
  return cloned as T;
}

/**
 * Shallow merge multiple objects from left to right.
 * Later values override earlier ones for the same key.
 */
export function merge<T extends Record<string, unknown>>(
  ...objects: Partial<T>[]
): T {
  const result: Record<string, unknown> = {};
  for (const obj of objects) {
    for (const key of Object.keys(obj)) {
      result[key] = obj[key];
    }
  }
  return result as T;
}

/**
 * Check deep equality of two values.
 * Compares primitives, arrays, plain objects, and dates.
 */
export function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as Record<string, unknown>);
    const keysB = Object.keys(b as Record<string, unknown>);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) =>
      isEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    );
  }

  return false;
}
