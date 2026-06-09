const PRESET_COLORS = [
  '#E879A9',
  '#F5B84C',
  '#9B8AFB',
  '#5B9FD4',
  '#6BC9A7',
  '#E0956B',
  '#EF6B6B',
  '#4ECDC4',
] as const

export const DIAGRAM_ZONE_COLORS: readonly string[] = PRESET_COLORS

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function getDefaultZoneColor(index: number): string {
  return DIAGRAM_ZONE_COLORS[index % DIAGRAM_ZONE_COLORS.length]
}
