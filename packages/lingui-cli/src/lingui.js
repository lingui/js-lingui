#!/usr/bin/env node
const program = require('commander')

program
  .version(require('../package.json').version)
  .command('extract [files...]', 'Extracts messages from source files')
  .command('compile', 'Compile message catalogues')
  .command('add-locale', 'Add new locale (generate empty message catalogues for this locale)')
  .parse(process.argv)
