import { mockConsole } from "@lingui/jest-mocks"
import { helpMisspelledCommand } from "./utils"

function getConsoleMockCalls({ mock }) {
  if (!mock.calls.length) return
  return mock.calls.map(call => call[0]).join("\n")
}

describe("helpMisspelledCommand - show help for misspelled commands", function() {
  function mockCommands(command, commandNames) {
    return helpMisspelledCommand(
      command,
      commandNames.map(commandName => ({ name: () => commandName }))
    )
  }

  it("shouldn't output anything if command is valid", function() {
    mockConsole(console => {
      mockCommands("compile", ["compile"])
      expect(getConsoleMockCalls(console.log)).toBeUndefined()
    })
  })

  it("shouldn't output anything if user passes no command", function() {
    mockConsole(console => {
      mockCommands("", ["compile"])
      expect(getConsoleMockCalls(console.log)).toMatchSnapshot()
    })
  })

  it("should return command is invalid if no commands are configured", function() {
    mockConsole(console => {
      mockCommands("compile", [])
      expect(getConsoleMockCalls(console.log)).toMatchSnapshot()
    })
  })

  it("should return suggestions for mispelled", function() {
    mockConsole(console => {
      mockCommands("compilesss", ["compile"])
      expect(getConsoleMockCalls(console.log)).toMatchSnapshot()
    })
  })
})
