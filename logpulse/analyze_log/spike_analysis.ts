export interface VolumePoint {
  timestamp: number
  volumeUsd: number
}

export interface SpikeEvent {
  timestamp: number
  volume: number
  spikeRatio: number
  windowAvg?: number
  windowSize?: number
}

/**
 * Detects spikes in trading volume compared to a rolling average window.
 */
export function detectVolumeSpikes(
  points: VolumePoint[],
  windowSize: number = 10,
  spikeThreshold: number = 2.0
): SpikeEvent[] {
  const events: SpikeEvent[] = []
  if (points.length < windowSize) return events

  const volumes = points.map(p => p.volumeUsd)
  for (let i = windowSize; i < volumes.length; i++) {
    const window = volumes.slice(i - windowSize, i)
    const avg = window.reduce((sum, v) => sum + v, 0) / window.length
    const curr = volumes[i]
    const ratio = avg > 0 ? curr / avg : Infinity

    if (ratio >= spikeThreshold) {
      events.push({
        timestamp: points[i].timestamp,
        volume: curr,
        spikeRatio: Math.round(ratio * 100) / 100,
        windowAvg: Math.round(avg * 100) / 100,
        windowSize,
      })
    }
  }
  return events
}

/**
 * Identify the largest spike event in the dataset.
 */
export function getMaxVolumeSpike(events: SpikeEvent[]): SpikeEvent | null {
  if (events.length === 0) return null
  return events.reduce((max, e) => (e.spikeRatio > max.spikeRatio ? e : max))
}

/**
 * Group spike events by day (UTC).
 */
export function groupSpikesByDay(events: SpikeEvent[]): Record<string, SpikeEvent[]> {
  return events.reduce<Record<string, SpikeEvent[]>>((acc, e) => {
    const day = new Date(e.timestamp).toISOString().split("T")[0]
    if (!acc[day]) acc[day] = []
    acc[day].push(e)
    return acc
  }, {})
}
