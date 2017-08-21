import fs from 'fs'
import path from 'path'
import nixt from 'nixt'

import { rmdir } from './utils'

describe('lingui add-locale', function () {
  const baseDir = path.resolve(__dirname, './fixtures')
  const baseLocaleDir = path.join(baseDir, 'locale')

  const locales = () => fs.readdirSync(baseLocaleDir)

  const runCmd = commandTestCase => new Promise((resolve, reject) => {
    const base = nixt()
      .base(path.resolve(__dirname, '../src/lingui.js add-locale '))
      .cwd(baseDir)

    commandTestCase(base).end(err => !err ? resolve() : reject(err))
  })

  beforeAll(() => rmdir(baseLocaleDir))
  afterEach(() => rmdir(baseLocaleDir))

  it('should show help when arguments are missing', function () {
    return runCmd(base =>
      base
        .code(0)
        .stdout(/Usage:/)
        .run('')
    )
  })

  it('should fail on unknown locale', function () {
    return runCmd(base =>
      base
        .run('xyz')
        .code(1)
        .stdout('Unknown locale(s): xyz.')
    )
  })

  it('should add single locale', function () {
    return runCmd(base =>
      base
        .run('en')
        .code(0)
        .stdout(/^Added locale en./)
    ).then(() => {
      expect(locales()).toEqual(['en'])
    })
  })

  it('should add multiple locales', function () {
    return runCmd(base =>
      base
        .run('en fr es')
        .code(0)
        .stdout(new RegExp([
          'Added locale en.',
          'Added locale fr.',
          'Added locale es.'
        ].join('\n'), 'm'))
    ).then(() => {
      expect(locales()).toEqual(['en', 'es', 'fr'])
    })
  })

  it('should skip existing locales', function () {
    fs.mkdirSync(path.join(baseLocaleDir))
    fs.mkdirSync(path.join(baseLocaleDir, 'fr'))

    return runCmd(base =>
      base
        .run('en fr es')
        .code(0)
        .stdout(new RegExp([
          'Added locale en.',
          'Locale fr already exists.',
          'Added locale es.'
        ].join('\n'), 'm'))
    ).then(() => {
      expect(locales()).toEqual(['en', 'es', 'fr'])
    })
  })
})
