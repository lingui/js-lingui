import {command} from "../lingui-compile"
import {makeConfig} from "@lingui/conf"
import path from "path"
import {getConsoleMockCalls, mockConsole} from "@lingui/jest-mocks"
import mockFs from "mock-fs"
import fs from 'fs'

function readFsToJson(directory: string, filter?: (filename: string) => boolean) {
  const out = {}

  fs
    .readdirSync(directory)
    .map((filename) => {
      const filepath = path.join(directory, filename)

      if (fs.lstatSync(filepath).isDirectory()) {
        out[filename] = readFsToJson(filepath)
        return out
      }

      if (!filter || filter(filename)) {
        out[filename] = fs.readFileSync(filepath).toString()
      }
    })

  return out
}

describe('CLI Command: Compile', () => {
  xit('Should return error if no messages', () => {
    const config = makeConfig({
      locales: ['en', 'pl'],
      rootDir: path.join(__dirname, 'fixtures/compile'),
      catalogs: [{
        path: '<rootDir>/{locale}',
        include: ['<rootDir>']
      }]
    })

    const result = command(config, {})
    expect(result).toBeFalsy()
  })

  describe('Merge Catalogs', () => {
    // todo
  })

  describe('Locales Validation', () => {
    // todo: should be moved to @lingui/conf
    it('Should throw error for invalid locale', () => {
      const config = makeConfig({
        locales: ['abra'],
        rootDir: '/test',
        catalogs: [{
          path: '<rootDir>/{locale}',
          include: ['<rootDir>'],
          exclude: []
        }]
      })

      mockFs()

      mockConsole((console) => {
        const result = command(config, {})
        mockFs.restore()
        const log = getConsoleMockCalls(console.error)
        expect(log).toMatchSnapshot()

        expect(result).toBeTruthy()
      })
    })

    it('Should not throw error for pseudolocale', () => {
      const config = makeConfig({
        locales: ['abracadabra'],
        rootDir: '/test',
        pseudoLocale: 'abracadabra',
        catalogs: [{
          path: '<rootDir>/{locale}',
          include: ['<rootDir>'],
          exclude: []
        }]
      })

      mockFs()

      mockConsole((console) => {
        const result = command(config, {})
        mockFs.restore()
        expect(console.error).not.toBeCalled()
        expect(result).toBeTruthy()
      })
    })
  })

  describe('allowEmpty = false', () => {
    const config = makeConfig({
      locales: ['en', 'pl'],
      sourceLocale: 'en',
      rootDir: '/test',
      catalogs: [{
        path: '<rootDir>/{locale}',
        include: ['<rootDir>'],
        exclude: []
      }]
    })

    it('Should show error and stop compilation of catalog ' +
      'if message doesnt have a translation (no template)', () => {
      mockFs({
        '/test': {
          'en.po': `
msgid "Hello World"
msgstr "Hello World"
        `,
          'pl.po': `
msgid "Hello World"
msgstr "Cześć świat"

msgid "Test String"
msgstr ""
        `
        }
      })

      mockConsole((console) => {
        const result = command(config, {
          allowEmpty: false
        })
        const actualFiles = readFsToJson('/test')

        expect(actualFiles['pl.js']).toBeFalsy()
        expect(actualFiles['en.js']).toBeTruthy()
        mockFs.restore()

        const log = getConsoleMockCalls(console.error)
        expect(log).toMatchSnapshot()
        expect(result).toBeFalsy()
      })
    })

    it('Should show error and stop compilation of catalog ' +
      ' if message doesnt have a translation (with template)', () => {
      mockFs({
        '/test': {
          'messages.pot': `
msgid "Hello World"
msgstr ""
        `,
          'pl.po': ``
        }
      })

      mockConsole((console) => {
        const result = command(config, {
          allowEmpty: false
        })

        const actualFiles = readFsToJson('/test')

        expect({
          pl: actualFiles['pl.js'],
          en: actualFiles['en.js']
        }).toMatchSnapshot()

        mockFs.restore()

        const log = getConsoleMockCalls(console.error)
        expect(log).toMatchSnapshot()
        expect(result).toBeFalsy()
      })
    })


    it('Should show missing messages verbosely when verbose = true', () => {
      mockFs({
        '/test': {
          'pl.po': `
msgid "Hello World"
msgstr ""

msgid "Test String"
msgstr ""
        `
        }
      })

      mockConsole((console) => {
        const result = command(config, {
          allowEmpty: false,
          verbose: true
        })

        mockFs.restore()

        const log = getConsoleMockCalls(console.error)
        expect(log).toMatchSnapshot()
        expect(result).toBeFalsy()
      })
    })

  })
})
