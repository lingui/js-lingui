import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const cliEntry = fileURLToPath(import.meta.resolve("@lingui/cli"))
// @lingui/cli exports "." -> "./dist/index.js", the binary is at "./dist/lingui.js"
const cliBin = cliEntry.replace(/index\.js$/, "lingui.js")

export function runLingui(args: string[], configPath: string): void {
  try {
    execFileSync(process.execPath, [cliBin, ...args], {
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
