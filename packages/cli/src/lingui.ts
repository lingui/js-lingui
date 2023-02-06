#!/usr/bin/env node

import { helpMisspelledCommand } from "./api/utils"

const program = require("commander")

let version
try {
  version = require("./package.json").version
} catch (e) {
  version = "dev"
}

program
  .version(version)
  .command("add-locale", "Deprecated, run it for instructions")
  .command("extract [files...]", "Extracts messages from source files")
  .command(
    "extract-template",
    "Extracts messages from source files to a .pot template"
  )
  .command("compile", "Compile message catalogs")
  .parse(process.argv)

helpMisspelledCommand(process.argv[2], program.commands)
