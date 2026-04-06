import type { SightCoreMessage } from "./WebSocketClient"

export interface AggregatedSignal {
  topic: string
  count: number
  lastPayload: any
  lastTimestamp: number
  firstTimestamp?: number
}

export class SignalAggregator {
  private counts: Record<string, AggregatedSignal> = {}

  processMessage(msg: SightCoreMessage): AggregatedSignal {
    const { topic, payload, timestamp } = msg
    const entry: AggregatedSignal = this.counts[topic] || {
      topic,
      count: 0,
      lastPayload: null,
      lastTimestamp: 0,
      firstTimestamp: timestamp,
    }
    entry.count += 1
    entry.lastPayload = payload
    entry.lastTimestamp = timestamp
    this.counts[topic] = entry
    return entry
  }

  getAggregated(topic: string): AggregatedSignal | undefined {
    return this.counts[topic]
  }

  getAllAggregated(): AggregatedSignal[] {
    return Object.values(this.counts)
  }

  getTopics(): string[] {
    return Object.keys(this.counts)
  }

  getTopTopics(limit: number = 5): AggregatedSignal[] {
    return Object.values(this.counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  resetTopic(topic: string): void {
    delete this.counts[topic]
  }

  reset(): void {
    this.counts = {}
  }
}
