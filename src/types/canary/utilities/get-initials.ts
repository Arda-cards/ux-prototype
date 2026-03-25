/**
 * Returns up to two initials (uppercased) from a display name.
 * Returns '?' for empty or whitespace-only input.
 */
export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
