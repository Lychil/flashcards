function formatCompactValue(value: number, suffix: string): string {
  const text = Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '')
  return `${text}${suffix}`
}

/** 1270 → «1.2к», 842 → «842» */
export function formatCompactCount(count: number): string {
  const abs = Math.abs(count)
  if (abs < 1000) return count.toLocaleString('ru-RU')

  if (abs < 1_000_000) {
    return formatCompactValue(Math.floor(abs / 100) / 10, 'к')
  }

  return formatCompactValue(Math.floor(abs / 100_000) / 10, 'м')
}
