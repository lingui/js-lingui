#!/usr/bin/env node

import { program } from "commander"
import { readFileSync } from "node:fs"

const packageJson = JSON.parse(readFileSync("../package.json", "utf8"))

program
  .version(packageJson.version)
  .command("extract [files...]", "Extracts messages from source files")
  .command(
    "extract-experimental",
    "Extracts messages from source files traversing dependency tree"
  )
  .command(
    "extract-template",
    "Extracts messages from source files to a .pot template"
  )
  .command("compile", "Compile message catalogs")
  .parse(process.argv)
