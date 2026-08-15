export function weightMapToLines(map: Record<string, number>): string {
  return Object.entries(map)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

export function stringMapToLines(map: Record<string, string>): string {
  return Object.entries(map)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}
