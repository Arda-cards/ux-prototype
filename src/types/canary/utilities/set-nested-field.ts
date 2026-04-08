/**
 * Set a value at a dot-separated path in an object, creating intermediate
 * objects as needed. Returns a new object — does not mutate the input.
 *
 * Each level on the changed path is shallow-copied; sibling subtrees retain
 * referential identity (important for React.memo and dependency arrays).
 */
export function setNestedField<T>(obj: T, path: string, value: unknown): T {
  const segments = path.split('.');
  const head = segments[0] as string;

  if (segments.length === 1) {
    return { ...obj, [head]: value };
  }

  const rest = segments.slice(1);
  const child = (obj as Record<string, unknown>)[head] ?? {};
  return {
    ...obj,
    [head]: setNestedField(child, rest.join('.'), value),
  } as T;
}
