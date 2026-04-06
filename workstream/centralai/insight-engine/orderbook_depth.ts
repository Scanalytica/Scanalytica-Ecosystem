/**
 * Analyze on-chain orderbook depth for a given market.
 */
export interface Order {
  price: number
  size: number
}

export interface DepthMetrics {
  averageBidDepth: number
  averageAskDepth: number
  spread: number
  totalBidVolume?: number
  totalAskVolume?: number
  midPrice?: number
}

export class TokenDepthAnalyzer {
  constructor(private rpcEndpoint: string, private marketId: string) {}

  async fetchOrderbook(depth = 50): Promise<{ bids: Order[]; asks: Order[] }> {
    const url = `${this.rpcEndpoint}/orderbook/${this.marketId}?depth=${depth}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Orderbook fetch failed: ${res.status}`)
    return (await res.json()) as { bids: Order[]; asks: Order[] }
  }

  private averageSize(orders: Order[]): number {
    if (orders.length === 0) return 0
    return orders.reduce((sum, o) => sum + o.size, 0) / orders.length
  }

  private totalVolume(orders: Order[]): number {
    return orders.reduce((sum, o) => sum + o.size, 0)
  }

  async analyze(depth = 50): Promise<DepthMetrics> {
    const { bids, asks } = await this.fetchOrderbook(depth)
    const avgBid = this.averageSize(bids)
    const avgAsk = this.averageSize(asks)
    const bestBid = bids[0]?.price ?? 0
    const bestAsk = asks[0]?.price ?? 0
    const spread = bestAsk && bestBid ? bestAsk - bestBid : 0
    const midPrice = bestAsk && bestBid ? (bestAsk + bestBid) / 2 : undefined

    return {
      averageBidDepth: avgBid,
      averageAskDepth: avgAsk,
      spread,
      totalBidVolume: this.totalVolume(bids),
      totalAskVolume: this.totalVolume(asks),
      midPrice,
    }
  }
}
