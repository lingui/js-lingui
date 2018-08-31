import { fuzzValidateCommand } from "./utils"

describe("fuzzValidateCommand", function() {
  function runFuzzValidateCommand(commandNames, userCommands) {
    return fuzzValidateCommand(
      commandNames.map(commandName => ({ name: () => commandName })),
      userCommands
    )
  }

  it("should return empty string if user command is valid", function() {
    expect(runFuzzValidateCommand(["compile"], ["compile"])).toEqual("")
  })

  it("should return empty string if user passes no command", function() {
    expect(runFuzzValidateCommand(["compile"], [])).toEqual("")
  })

  it("should return command is invalid if no commands are configured", function() {
    expect(runFuzzValidateCommand([], ["compile"])).toMatchSnapshot()
  })

  it("should return command is invalid", function() {
    expect(
      runFuzzValidateCommand(["compile"], ["compilesss"])
    ).toMatchSnapshot()
  })

  it("should return suggestion for the first command if user passes multiple commands", function() {
    expect(
      runFuzzValidateCommand(["add-strings", "add-locales"], ["add", "com"])
    ).toMatchSnapshot()
  })
})
