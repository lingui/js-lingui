import fs from "fs"
import glob from 'glob'
import path from "path"
import plugin from '../src/index'
import { transformFileSync } from 'babel-core'


function getTestName(testPath) {
  return path.basename(testPath)
}


describe('babel-plugin-lingui-transform-js', function() {
  glob.sync(path.join(__dirname, 'fixtures/*/')).forEach(testPath => {
    const testName = getTestName(testPath)
    const actualPath = path.join(testPath, 'actual.js')
    const expectedPath = path.join(testPath, 'expected.js')

    it(testName, () => {
      const expected = fs.existsSync(expectedPath) && fs.readFileSync(expectedPath, 'utf8').trim()

      const actual = () => transformFileSync(actualPath, {
        plugins: [
          'external-helpers',
          'syntax-jsx',
          'transform-remove-strict-mode',
          plugin
        ]
      }).code.trim()

      if (expected) {
        expect(actual()).toEqual(expected)
      } else {
        expect(actual).toThrowErrorMatchingSnapshot()
      }
    })
  })
})
