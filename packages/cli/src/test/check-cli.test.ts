import { createProgram } from "../lingui-check.js"
import { getRegisteredChecks } from "../api/check/index.js"
import { mockConsole } from "@lingui/test-utils"

describe("CLI: check", () => {
  it("Should require a check subcommand in CLI mode", async () => {
    const program = createProgram()
    program.exitOverride()
    program.configureOutput({
      writeOut: () => {},
      writeErr: () => {},
    })

    await mockConsole(async () => {
      await expect(
        program.parseAsync(["node", "lingui-check"]),
      ).rejects.toMatchObject({
        code: "commander.help",
        exitCode: 1,
      })
    })
  })

  it("Should register check subcommands from the registry", () => {
    const program = createProgram()
    const commandNames = program.commands.map((command) => command.name())

    expect(commandNames).toEqual(
      getRegisteredChecks().map((check) => check.name),
    )

    const syncCommand = program.commands.find(
      (command) => command.name() === "sync",
    )
    const missingCommand = program.commands.find(
      (command) => command.name() === "missing",
    )

    expect(syncCommand?.options.map((option) => option.long)).toContain(
      "--clean",
    )
    expect(syncCommand?.options.map((option) => option.long)).toContain(
      "--overwrite",
    )
    expect(syncCommand?.options.map((option) => option.long)).not.toContain(
      "--mode",
    )
    expect(missingCommand?.options.map((option) => option.long)).toContain(
      "--mode",
    )
    expect(missingCommand?.options.map((option) => option.long)).not.toContain(
      "--clean",
    )
  })

  it("Should reject invalid missing mode values", async () => {
    const program = createProgram()
    program.exitOverride()

    await expect(
      program.parseAsync(["node", "lingui-check", "missing", "--mode", "raw"]),
    ).rejects.toThrow("Option `--mode` must be either `resolved` or `catalog`.")
  })
})
