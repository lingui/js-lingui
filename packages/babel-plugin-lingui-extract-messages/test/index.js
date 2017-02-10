import fs from 'fs'
import path from "path"
import {transformFileSync} from 'babel-core'

import plugin from '../src/index'


const LOCALE_DIR = './locale'

const rmdir = (dir) => {
  if (!fs.existsSync(dir)) return
  const list = fs.readdirSync(dir)

  for (let i = 0; i < list.length; i++) {
    const filename = path.join(dir, list[i])
    const stat = fs.statSync(filename)

    if (filename == "." || filename == "..") {
      // pass these files
    } else if (stat.isDirectory()) {
      // rmdir recursively
      rmdir(filename);
    } else {
      // rm fiilename
      fs.unlinkSync(filename)
    }
  }
  fs.rmdirSync(dir)
}


function testCase(testName, assertion) {
  const transform = (filename) => () => transformFileSync(path.join(__dirname, 'fixtures', filename), {
    plugins: [
      'external-helpers',
      'syntax-jsx',
      'transform-remove-strict-mode',
      [plugin, {
        localeDir: LOCALE_DIR
      }]
    ]
  })

  it(testName, () => assertion(transform))
}


describe('babel-plugin-lingui-extract-messages', function () {
  // CWD is root directory of repository, so origin of all messages is going to
  // relative to root
  const buildDir = path.join(
    LOCALE_DIR,
    '_build', 'packages', 'babel-plugin-lingui-extract-messages',
    'test', 'fixtures'
  )

  beforeAll(() => {
    rmdir(LOCALE_DIR)
  })

  afterAll(() => {
    rmdir(LOCALE_DIR)
  })

  testCase('should raise exception on duplicate id and different defaults', (transform) => {
    expect(transform('duplicate-id.js')).toThrow(/Different defaults/)
  })

  testCase("shouldn't write catalog for files without translatable messages", (transform) => {
    expect(transform('empty.js')).not.toThrow()
    expect(fs.existsSync(path.join(buildDir, 'empty.json'))).toBeFalsy()
  })

  testCase("shouldn't path to file inside locale dir", (transform) => {
    expect(transform('deep/all.js')).not.toThrow()
    expect(fs.existsSync(path.join(buildDir, 'deep/all.json'))).toBeTruthy()
  })

  testCase('should extract all messages', (transform) => {
    // first run should create all required folders and write messages
    expect(transform('all.js')).not.toThrow()
    // another runs should just write messages
    expect(transform('all.js')).not.toThrow()

    const messages = JSON.parse(fs.readFileSync(path.join(buildDir, 'all.json')))
    expect(messages).toMatchSnapshot()
  })
})
