import { exec } from "child_process"

/**
 * Execute a shell command and return stdout or throw on error.
 * @param command Shell command to run (e.g., "ls -la")
 * @param timeoutMs Optional timeout in milliseconds
 * @param cwd Optional working directory
 */
export function execCommand(
  command: string,
  timeoutMs: number = 30_000,
  cwd?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = exec(command, { timeout: timeoutMs, cwd }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Command failed: ${stderr || error.message}`))
      }
      resolve(stdout.trim())
    })

    proc.on("error", err => {
      reject(new Error(`Process error: ${err.message}`))
    })
  })
}

/**
 * Run multiple commands sequentially and collect their outputs.
 */
export async function execCommands(
  commands: string[],
  timeoutMs: number = 30_000,
  cwd?: string
): Promise<string[]> {
  const results: string[] = []
  for (const cmd of commands) {
    const output = await execCommand(cmd, timeoutMs, cwd)
    results.push(output)
  }
  return results
}

/**
 * Try running a command safely; return null if it fails.
 */
export async function tryExec(command: string, timeoutMs: number = 30_000): Promise<string | null> {
  try {
    return await execCommand(command, timeoutMs)
  } catch {
    return null
  }
}
