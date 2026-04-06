import fetch from "node-fetch"

/*------------------------------------------------------
 * Types
 *----------------------------------------------------*/

interface Candle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export type CandlestickPattern =
  | "Hammer"
  | "ShootingStar"
  | "BullishEngulfing"
  | "BearishEngulfing"
  | "Doji"

export interface PatternSignal {
  timestamp: number
  pattern: CandlestickPattern
  confidence: number
}

/*------------------------------------------------------
 * Detector
 *----------------------------------------------------*/

export class CandlestickPatternDetector {
  constructor(private readonly apiUrl: string) {}

  /* Fetch recent OHLC candles */
  async fetchCandles(symbol: string, limit = 100): Promise<Candle[]> {
    const res = await fetch(`${this.apiUrl}/markets/${symbol}/candles?limit=${limit}`, {
      timeout: 10_000,
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch candles ${res.status}: ${res.statusText}`)
    }
    const data = (await res.json()) as Candle[]
    return data.map(c => ({
      ...c,
      volume: c.volume ?? 0,
    }))
  }

  /* Normalize price range */
  private normalizeValue(val: number, max: number): number {
    if (max <= 0) return 0
    return Math.max(0, Math.min(val / max, 1))
  }

  /* ------------------------- Pattern helpers ---------------------- */

  private isHammer(c: Candle): number {
    const body = Math.abs(c.close - c.open)
    const lowerWick = Math.min(c.open, c.close) - c.low
    const ratio = body > 0 ? lowerWick / body : 0
    const score = ratio > 2 && body / (c.high - c.low) < 0.3 ? Math.min(ratio / 3, 1) : 0
    return this.normalizeValue(score, 1)
  }

  private isShootingStar(c: Candle): number {
    const body = Math.abs(c.close - c.open)
    const upperWick = c.high - Math.max(c.open, c.close)
    const ratio = body > 0 ? upperWick / body : 0
    const score = ratio > 2 && body / (c.high - c.low) < 0.3 ? Math.min(ratio / 3, 1) : 0
    return this.normalizeValue(score, 1)
  }

  private isBullishEngulfing(prev: Candle, curr: Candle): number {
    const cond =
      curr.close > curr.open &&
      prev.close < prev.open &&
      curr.close > prev.open &&
      curr.open < prev.close
    if (!cond) return 0
    const bodyPrev = Math.abs(prev.close - prev.open)
    const bodyCurr = Math.abs(curr.close - curr.open)
    const score = bodyPrev > 0 ? Math.min(bodyCurr / bodyPrev, 1) : 0.8
    return this.normalizeValue(score, 1)
  }

  private isBearishEngulfing(prev: Candle, curr: Candle): number {
    const cond =
      curr.close < curr.open &&
      prev.close > prev.open &&
      curr.open > prev.close &&
      curr.close < prev.open
    if (!cond) return 0
    const bodyPrev = Math.abs(prev.close - prev.open)
    const bodyCurr = Math.abs(curr.close - curr.open)
    const score = bodyPrev > 0 ? Math.min(bodyCurr / bodyPrev, 1) : 0.8
    return this.normalizeValue(score, 1)
  }

  private isDoji(c: Candle): number {
    const range = c.high - c.low
    const body = Math.abs(c.close - c.open)
    const ratio = range > 0 ? body / range : 1
    const score = ratio < 0.1 ? 1 - ratio * 10 : 0
    return this.normalizeValue(score, 1)
  }

  /* ------------------------- Detection runner ---------------------- */

  async detectPatterns(symbol: string, limit = 100): Promise<PatternSignal[]> {
    const candles = await this.fetchCandles(symbol, limit)
    const signals: PatternSignal[] = []

    for (let i = 1; i < candles.length; i++) {
      const prev = candles[i - 1]
      const curr = candles[i]

      const patterns: Array<[CandlestickPattern, number]> = [
        ["Hammer", this.isHammer(curr)],
        ["ShootingStar", this.isShootingStar(curr)],
        ["BullishEngulfing", this.isBullishEngulfing(prev, curr)],
        ["BearishEngulfing", this.isBearishEngulfing(prev, curr)],
        ["Doji", this.isDoji(curr)],
      ]

      for (const [pattern, confidence] of patterns) {
        if (confidence > 0) {
          signals.push({ timestamp: curr.timestamp, pattern, confidence })
        }
      }
    }

    return signals
  }

  /* Optional: filter signals above threshold */
  filterByConfidence(signals: PatternSignal[], threshold = 0.6): PatternSignal[] {
    return signals.filter(s => s.confidence >= threshold)
  }
}
