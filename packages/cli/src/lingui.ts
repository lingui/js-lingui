#!/usr/bin/env node

import { program } from "commander"
import { version } from "../package.json"

program
  .version(version)
  .command("extract [files...]", "Extracts messages from source files")
  .command(
    "extract-template",
    "Extracts messages from source files to a .pot template"
  )
  .command("compile", "Compile message catalogs")
  .parse(process.argv)
