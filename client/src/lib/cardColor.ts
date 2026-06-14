const PRESET_COLORS = [
  '#E879A9', // pink
  '#F5B84C', // amber
  '#9B8AFB', // lavender
  '#5B9FD4', // sky
  '#6BC9A7', // mint
  '#E0956B', // peach
] as const

interface Rgb {
  r: number
  g: number
  b: number
}

export interface CardColorTheme {
  base: string
  offsetBg: string
  pillBg: string
  pillBorder: string
  pillText: string
  footerText: string
  progress: string
}

function hashId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function hexToRgb(hex: string): Rgb {
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

function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function mixWithWhite(rgb: Rgb, whiteRatio: number): Rgb {
  const colorRatio = 1 - whiteRatio
  return {
    r: Math.round(rgb.r * colorRatio + 255 * whiteRatio),
    g: Math.round(rgb.g * colorRatio + 255 * whiteRatio),
    b: Math.round(rgb.b * colorRatio + 255 * whiteRatio),
  }
}

function darken(rgb: Rgb, amount: number): Rgb {
  return {
    r: Math.round(rgb.r * (1 - amount)),
    g: Math.round(rgb.g * (1 - amount)),
    b: Math.round(rgb.b * (1 - amount)),
  }
}

export function resolveModuleBaseColor(id: string, userColor?: string): string {
  if (userColor) return userColor
  return PRESET_COLORS[hashId(id) % PRESET_COLORS.length]
}

export function getCardColorTheme(baseColor: string): CardColorTheme {
  const rgb = hexToRgb(baseColor)

  return {
    base: baseColor,
    offsetBg: rgbToHex(mixWithWhite(rgb, 0.72)),
    pillBg: '#ffffff',
    pillBorder: rgbToHex(mixWithWhite(rgb, 0.55)),
    pillText: rgbToHex(darken(rgb, 0.25)),
    footerText: rgbToHex(darken(rgb, 0.35)),
    progress: rgbToHex(darken(rgb, 0.15)),
  }
}

export interface AccentForeground {
  primary: string
  secondary: string
  muted: string
  badgeBg: string
  badgeBorder: string
}

export function getAccentForeground(baseColor: string): AccentForeground {
  const { r, g, b } = hexToRgb(baseColor)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const isLight = luminance > 0.58

  if (isLight) {
    return {
      primary: '#12151a',
      secondary: 'rgba(18, 21, 26, 0.78)',
      muted: 'rgba(18, 21, 26, 0.55)',
      badgeBg: 'rgba(255, 255, 255, 0.5)',
      badgeBorder: 'rgba(255, 255, 255, 0.65)',
    }
  }

  return {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.88)',
    muted: 'rgba(255, 255, 255, 0.65)',
    badgeBg: 'rgba(255, 255, 255, 0.2)',
    badgeBorder: 'rgba(255, 255, 255, 0.35)',
  }
}
