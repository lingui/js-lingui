#!/usr/bin/env node

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
  .command(
    "add-locale [locales...]",
    "Add new locale (generate empty message catalogues for this locale)"
  )
  .command("extract [files...]", "Extracts messages from source files")
  .command("compile", "Compile message catalogs")
  .parse(process.argv)
