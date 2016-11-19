
import { assert } from 'chai'
import fs from "fs"
import glob from 'glob'
import path from "path"
import plugin from '../src'
import { transformFileSync } from 'babel-core'


function getTestName(testPath) {
  return path.basename(testPath)
}


describe('babel-plugin-transform-react-t9n', function() {
  glob.sync(path.join(__dirname, 'fixtures/*/')).forEach(testPath => {
    const testName = getTestName(testPath)
    const actualPath = path.join(testPath, 'actual.js')
    const expectedPath = path.join(testPath, 'expected.js')

    it(testName, () => {
      const expected = fs.readFileSync(expectedPath, 'utf8')
      const actual = transformFileSync(actualPath, {
        plugins: [
          'external-helpers',
          'syntax-jsx',
          plugin
        ]
      }).code

      assert.strictEqual(actual.trim(), expected.trim())
    })
  })
})
