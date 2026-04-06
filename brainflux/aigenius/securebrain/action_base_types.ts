import { z } from "zod"

/**
 * Base types for any Flow action.
 */
export type ActionSchema = z.ZodObject<z.ZodRawShape>

export interface ActionResponse<T> {
  notice: string
  data?: T
  success?: boolean
  errorCode?: string
}

export interface BaseAction<
  S extends ActionSchema,
  R,
  Ctx = unknown
> {
  id: string
  summary: string
  description?: string
  input: S
  createdAt?: Date
  execute(args: { payload: z.infer<S>; context: Ctx }): Promise<ActionResponse<R>>
}

/* ------------------------- Utility helpers ------------------------- */

export function createResponse<T>(
  notice: string,
  data?: T,
  success = true,
  errorCode?: string
): ActionResponse<T> {
  return { notice, data, success, errorCode }
}

export function validateSchema<S extends ActionSchema>(
  schema: S,
  payload: unknown
): z.infer<S> {
  const result = schema.safeParse(payload)
  if (!result.success) {
    throw new Error(`Invalid input: ${result.error.issues.map(i => i.message).join(", ")}`)
  }
  return result.data
}
