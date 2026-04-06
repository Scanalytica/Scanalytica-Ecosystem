/**
 * Detect volume-based patterns in a series of activity amounts.
 */
export interface PatternMatch {
  index: number
  window: number
  average: number
  max?: number
  min?: number
  stdDev?: number
}

export function detectVolumePatterns(
  volumes: number[],
  windowSize: number,
  threshold: number
): PatternMatch[] {
  const matches: PatternMatch[] = []
  if (windowSize <= 0 || volumes.length < windowSize) return matches

  for (let i = 0; i + windowSize <= volumes.length; i++) {
    const slice = volumes.slice(i, i + windowSize)
    const avg = slice.reduce((a, b) => a + b, 0) / windowSize
    if (avg >= threshold) {
      const max = Math.max(...slice)
      const min = Math.min(...slice)
      const variance =
        slice.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / windowSize
      const stdDev = Math.sqrt(variance)

      matches.push({
        index: i,
        window: windowSize,
        average: Math.round(avg * 100) / 100,
        max,
        min,
        stdDev: Math.round(stdDev * 100) / 100,
      })
    }
  }
  return matches
}

/**
 * Find the strongest pattern match (highest average).
 */
export function findStrongestPattern(matches: PatternMatch[]): PatternMatch | null {
  if (matches.length === 0) return null
  return matches.reduce((best, m) => (m.average > best.average ? m : best))
}
