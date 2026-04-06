import type { BaseAction, ActionResponse } from "./baseAction"
import { z } from "zod"

interface AgentContext {
  apiEndpoint: string
  apiKey: string
  timeout?: number
  metadata?: Record<string, unknown>
}

/**
 * Central Agent: routes calls to registered actions.
 */
export class Agent {
  private actions = new Map<string, BaseAction<any, any, AgentContext>>()

  register<S, R>(action: BaseAction<S, R, AgentContext>): void {
    if (this.actions.has(action.id)) {
      throw new Error(`Action with id "${action.id}" is already registered`)
    }
    this.actions.set(action.id, action)
  }

  unregister(actionId: string): boolean {
    return this.actions.delete(actionId)
  }

  listActions(): string[] {
    return Array.from(this.actions.keys())
  }

  async invoke<R>(
    actionId: string,
    payload: unknown,
    ctx: AgentContext
  ): Promise<ActionResponse<R>> {
    const action = this.actions.get(actionId)
    if (!action) {
      throw new Error(`Unknown action "${actionId}"`)
    }

    const parsedPayload = action.input.safeParse(payload)
    if (!parsedPayload.success) {
      throw new Error(
        `Invalid payload for action "${actionId}": ${parsedPayload.error.issues
          .map(i => i.message)
          .join(", ")}`
      )
    }

    return action.execute({ payload: parsedPayload.data, context: ctx })
  }
}
