#!/usr/bin/env node

const program = require("commander")

program
  .version(require("../package.json").version)
  .command(
    "add-locale [locales...]",
    "Add new locale (generate empty message catalogues for this locale)"
  )
  .command("extract [files...]", "Extracts messages from source files")
  .command("compile", "Compile message catalogs")
  .parse(process.argv)
