export interface LaunchConfig {
  contractName: string
  parameters: Record<string, any>
  deployEndpoint: string
  apiKey?: string
  timeoutMs?: number
}

export interface LaunchResult {
  success: boolean
  address?: string
  transactionHash?: string
  error?: string
  statusCode?: number
}

export class LaunchNode {
  constructor(private config: LaunchConfig) {}

  async deploy(): Promise<LaunchResult> {
    const { deployEndpoint, apiKey, contractName, parameters, timeoutMs } = this.config
    try {
      const controller = timeoutMs ? new AbortController() : undefined
      const timeoutId =
        timeoutMs && controller
          ? setTimeout(() => controller.abort(), timeoutMs)
          : undefined

      const res = await fetch(deployEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ contractName, parameters }),
        signal: controller?.signal,
      })

      if (timeoutId) clearTimeout(timeoutId)

      if (!res.ok) {
        const text = await res.text()
        return { success: false, error: `HTTP ${res.status}: ${text}`, statusCode: res.status }
      }

      const json = await res.json()
      return {
        success: true,
        address: json.contractAddress,
        transactionHash: json.txHash,
        statusCode: res.status,
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        return { success: false, error: "Request timed out" }
      }
      return { success: false, error: err.message }
    }
  }

  async dryRun(): Promise<LaunchResult> {
    const { contractName, parameters } = this.config
    try {
      return {
        success: true,
        address: `simulated_${contractName}_address`,
        transactionHash: "simulated_tx_hash",
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }
}
