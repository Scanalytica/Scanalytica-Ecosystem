import type { TaskFormInput } from "./taskFormSchemas"
import { TaskFormSchema } from "./taskFormSchemas"

/**
 * Processes a Typeform webhook payload to schedule a new task.
 */
export async function handleTypeformSubmission(
  raw: unknown
): Promise<{ success: boolean; message: string; data?: TaskFormInput }> {
  const parsed = TaskFormSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      message: `Validation error: ${parsed.error.issues.map(i => i.message).join("; ")}`,
    }
  }

  const { taskName, taskType, parameters, scheduleCron } = parsed.data

  // Example ID generator
  const taskId = `${taskType}_${Date.now()}`

  // Placeholder for scheduling logic (cron, queue, etc.)
  // In real-world usage this would enqueue or register the task.
  const scheduled = {
    id: taskId,
    name: taskName,
    type: taskType,
    parameters,
    scheduleCron,
  }

  return {
    success: true,
    message: `Task "${taskName}" scheduled with ID ${taskId}`,
    data: scheduled,
  }
}
