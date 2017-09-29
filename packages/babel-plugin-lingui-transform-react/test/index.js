import fs from 'fs'
import glob from 'glob'
import path from 'path'
import { transformFileSync, transform } from 'babel-core'

import plugin from '../src/index'

function getTestName (testPath) {
  return path.basename(testPath)
}

describe('babel-plugin-lingui-transform-react', function () {
  const babelOptions = {
    babelrc: false,
    plugins: [
      'external-helpers',
      'syntax-jsx',
      'transform-remove-strict-mode',
      plugin
    ]
  }

  const transformCode = (code) => () => transform(
    // implicitly import all lingui-react components, otherwise components
    // are ignored and not validated
    `import { 
      Trans, Plural, Select, SelectOrdinal, DateFormat, NumberFormat 
    } from 'lingui-react';
    ${code}`,
    babelOptions
  )

  glob.sync(path.join(__dirname, 'fixtures/*/')).forEach(testPath => {
    const testName = getTestName(testPath)
    const actualPath = path.relative(process.cwd(), path.join(testPath, 'actual.js'))
    const expectedPath = path.join(testPath, 'expected.js')

    it(testName, () => {
      let originalEnv
      if (testName.startsWith('env-production-')) {
        originalEnv = process.env.NODE_ENV
        process.env.NODE_ENV = 'production'
      }

      const expected = fs.readFileSync(expectedPath, 'utf8')
      const actual = transformFileSync(actualPath, babelOptions).code.trim()

      expect(actual).toEqual(expected.trim())

      if (originalEnv) process.env.NODE_ENV = originalEnv
    })
  })

  describe('validation', function () {
    describe('Plural/Select/SelectOrdinal', function () {
      it('children are not allowed', function () {
        expect(transformCode('<Plural>Not allowed</Plural>')).toThrowErrorMatchingSnapshot()
        expect(transformCode('<Select>Not allowed</Select>')).toThrowErrorMatchingSnapshot()
        expect(transformCode('<SelectOrdinal>Not allowed</SelectOrdinal>')).toThrowErrorMatchingSnapshot()
      })

      it('value is missing', function () {
        const code = `<Plural one="Book" other="Books" />`
        expect(transformCode(code)).toThrowErrorMatchingSnapshot()
      })

      it('offset must be number or string, not variable', function () {
        const variable = `<Plural value={value} offset={offset} one="Book" other="Books" />`
        expect(transformCode(variable)).toThrowErrorMatchingSnapshot()
      })

      it('plural forms are missing', function () {
        const plural = `<Plural value={value} />`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const select = `<Select value={value} />`
        expect(transformCode(select)).toThrowErrorMatchingSnapshot()

        const ordinal = `<SelectOrdinal value={value} />`
        expect(transformCode(ordinal)).toThrowErrorMatchingSnapshot()
      })

      it('plural forms missing fallback', function () {
        const plural = `<Plural value={value} one="Book" />`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const select = `<Select value={value} one="Book" />`
        expect(transformCode(select)).toThrowErrorMatchingSnapshot()

        const ordinal = `<SelectOrdinal value={value} one="Book" />`
        expect(transformCode(ordinal)).toThrowErrorMatchingSnapshot()
      })

      it('plural rules must be valid', function () {
        const plural = `<Plural value={value} three="Invalid" one="Book" other="Books" />`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const ordinal = `<SelectOrdinal value={value} three="Invalid" one="st" other="rd" />`
        expect(transformCode(ordinal)).toThrowErrorMatchingSnapshot()
      })
    })

    describe('Date/Number', function () {
      it('value of number must be a variable', function () {
        expect(transformCode('<Trans><NumberFormat /></Trans>')).toThrowErrorMatchingSnapshot()
      })

      it('format must be string, variable or object with custom format', function () {
        expect(transformCode('<Trans><NumberFormat value={value} format="custom" /></Trans>')).not.toThrow()
        expect(transformCode('<Trans><NumberFormat value={value} format={"custom"} /></Trans>')).not.toThrow()
        expect(transformCode('<Trans><NumberFormat value={value} format={custom} /></Trans>')).not.toThrow()
        expect(transformCode('<Trans><NumberFormat value={value} format={{ digits: 4 }} /></Trans>')).not.toThrow()
        expect(transformCode('<Trans><NumberFormat value={value} format={42} /></Trans>')).toThrowErrorMatchingSnapshot()
      })

      it('value of date must be a variable', function () {
        expect(transformCode('<Trans><DateFormat /></Trans>')).toThrowErrorMatchingSnapshot()
      })
    })
  })
})
