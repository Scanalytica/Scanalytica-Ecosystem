export interface PricePoint {
  timestamp: number
  priceUsd: number
  volumeUsd?: number
}

export interface TrendResult {
  startTime: number
  endTime: number
  trend: "upward" | "downward" | "neutral"
  changePct: number
  avgPrice?: number
  maxPrice?: number
  minPrice?: number
}

/**
 * Analyze a series of price points to determine overall trend segments.
 */
export function analyzePriceTrends(
  points: PricePoint[],
  minSegmentLength: number = 5
): TrendResult[] {
  const results: TrendResult[] = []
  if (points.length < minSegmentLength) return results

  let segStart = 0
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].priceUsd
    const curr = points[i].priceUsd
    const direction = curr > prev ? 1 : curr < prev ? -1 : 0

    if (
      i - segStart >= minSegmentLength &&
      (i === points.length - 1 ||
        (direction === 1 && points[i + 1].priceUsd < curr) ||
        (direction === -1 && points[i + 1].priceUsd > curr))
    ) {
      const segment = points.slice(segStart, i + 1)
      const start = segment[0]
      const end = segment[segment.length - 1]
      const changePct = ((end.priceUsd - start.priceUsd) / start.priceUsd) * 100
      const avgPrice = segment.reduce((sum, p) => sum + p.priceUsd, 0) / segment.length
      const maxPrice = Math.max(...segment.map(p => p.priceUsd))
      const minPrice = Math.min(...segment.map(p => p.priceUsd))

      results.push({
        startTime: start.timestamp,
        endTime: end.timestamp,
        trend: changePct > 0 ? "upward" : changePct < 0 ? "downward" : "neutral",
        changePct: Math.round(changePct * 100) / 100,
        avgPrice: Math.round(avgPrice * 100) / 100,
        maxPrice,
        minPrice,
      })

      segStart = i
    }
  }
  return results
}

/**
 * Compute overall trend direction for full dataset.
 */
export function computeOverallTrend(points: PricePoint[]): TrendResult | null {
  if (points.length < 2) return null
  const start = points[0]
  const end = points[points.length - 1]
  const changePct = ((end.priceUsd - start.priceUsd) / start.priceUsd) * 100
  return {
    startTime: start.timestamp,
    endTime: end.timestamp,
    trend: changePct > 0 ? "upward" : changePct < 0 ? "downward" : "neutral",
    changePct: Math.round(changePct * 100) / 100,
  }
}
