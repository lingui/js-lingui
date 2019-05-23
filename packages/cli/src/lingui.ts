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
  .command("init", "Install all required packages")
  .command("extract [files...]", "Extracts messages from source files")
  .command("compile", "Compile message catalogs")
  .parse(process.argv)

helpMisspelledCommand(process.argv[2], program.commands)
