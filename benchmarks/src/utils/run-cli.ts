import { execFileSync } from "node:child_process"
import path from "path"

const LINGUI_BIN = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
  "..",
  "..",
  "node_modules",
  ".bin",
  "lingui",
)

export function runLingui(args: string[], configPath: string): void {
  try {
    execFileSync(LINGUI_BIN, args, {
      env: { ...process.env, LINGUI_CONFIG: configPath },
      stdio: ["ignore", "pipe", "pipe"],
    })
  } catch (err: any) {
    const stderr = err.stderr?.toString().trim()
    const stdout = err.stdout?.toString().trim()
    const output = stderr || stdout || err.message
    throw new Error(
      `lingui ${args.join(" ")} failed (exit code ${err.status}):\n${output}`,
    )
  }
}
