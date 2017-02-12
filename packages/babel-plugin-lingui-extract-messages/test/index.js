import fs from 'fs'
import path from 'path'
import { transformFileSync } from 'babel-core'

import plugin from '../src/index'

const LOCALE_DIR = './locale'

const rmdir = (dir) => {
  if (!fs.existsSync(dir)) return
  const list = fs.readdirSync(dir)

  for (let i = 0; i < list.length; i++) {
    const filename = path.join(dir, list[i])
    const stat = fs.statSync(filename)

    if (filename === '.' || filename === '..') {
      // pass these files
    } else if (stat.isDirectory()) {
      // rmdir recursively
      rmdir(filename)
    } else {
      // rm fiilename
      fs.unlinkSync(filename)
    }
  }
  fs.rmdirSync(dir)
}

function testCase (testName, assertion) {
  const transform = (filename, jsx = true) => () => transformFileSync(path.join(__dirname, 'fixtures', filename), {
    plugins: [
      ...(filename.endsWith('integration.js')
          ? jsx
            ? [
              'lingui-transform-react',
              'lingui-transform-js'
            ]
            : ['lingui-transform-js']
          : []
      ),
      [plugin, {
        localeDir: LOCALE_DIR
      }],
      'external-helpers',
      ...(jsx ? ['syntax-jsx'] : []),
      'transform-remove-strict-mode'
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
    expect(transform('jsx/duplicate-id.js')).toThrow(/Different defaults/)
  })

  testCase("shouldn't write catalog for files without translatable messages", (transform) => {
    expect(transform('empty.js')).not.toThrow()
    expect(fs.existsSync(path.join(buildDir, 'empty.json'))).toBeFalsy()
  })

  testCase("shouldn't path to file inside locale dir", (transform) => {
    expect(transform('jsx/deep/all.js')).not.toThrow()
    expect(fs.existsSync(path.join(buildDir, 'jsx/deep/all.json'))).toBeTruthy()
  })

  testCase('should extract all messages from JSX files', (transform) => {
    // first run should create all required folders and write messages
    expect(transform('jsx/all.js')).not.toThrow()
    // another runs should just write messages
    expect(transform('jsx/all.js')).not.toThrow()

    const messages = JSON.parse(fs.readFileSync(path.join(buildDir, 'jsx/all.json')))
    expect(messages).toMatchSnapshot()
  })

  testCase('should extract all messages from JSX files (integration)', (transform) => {
    // first run should create all required folders and write messages
    expect(transform('jsx/integration.js')).not.toThrow()
    // another runs should just write messages
    expect(transform('jsx/integration.js')).not.toThrow()

    const messages = JSON.parse(fs.readFileSync(path.join(buildDir, 'jsx/integration.json')))
    expect(messages).toMatchSnapshot()
  })

  testCase('should extract all messages from JS files', (transform) => {
    // first run should create all required folders and write messages
    expect(transform('js/all.js', false)).not.toThrow()
    // another runs should just write messages
    expect(transform('js/all.js', false)).not.toThrow()

    const messages = JSON.parse(fs.readFileSync(path.join(buildDir, 'js/all.json')))
    expect(messages).toMatchSnapshot()
  })

  testCase('should extract all messages from JS files (integration)', (transform) => {
    // first run should create all required folders and write messages
    expect(transform('js/integration.js', false)).not.toThrow()
    // another runs should just write messages
    expect(transform('js/integration.js', false)).not.toThrow()

    const messages = JSON.parse(fs.readFileSync(path.join(buildDir, 'js/integration.json')))
    expect(messages).toMatchSnapshot()
  })
})
