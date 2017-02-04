import fs from 'fs'
import path from "path"
import { transformFileSync } from 'babel-core'

import plugin from '../src/index'


const LOCALE_DIR = './locale'

const rmdir = (dir) => {
    const list = fs.readdirSync(dir)

    for(let i = 0; i < list.length; i++) {
        const filename = path.join(dir, list[i])
        const stat = fs.statSync(filename)

        if(filename == "." || filename == "..") {
            // pass these files
        } else if(stat.isDirectory()) {
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


describe('babel-plugin-extract-messages', function() {
  afterAll(() => {
    rmdir(LOCALE_DIR)
  })

  testCase('should extract all messages', (transform) => {
    // first run should create all required folders
    expect(transform('all.js')).not.toThrow()
    // another runs should write messages
    expect(transform('all.js')).not.toThrow()

    const messages = JSON.parse(fs.readFileSync(path.join(LOCALE_DIR, '_build/all.json')))
    expect(messages).toEqual({
      "msg.hello": {
        "origin": [
          ["../test/fixtures/all.js", 2]
        ]
      },
      "msg.default": {
        "defaults": "Hello World",
        "origin": [
          ["../test/fixtures/all.js", 3],
          ["../test/fixtures/all.js", 4]
        ]
      },
      "Hi, my name is <0>{name}</0>": {
        "origin": [
          ["../test/fixtures/all.js", 5]
        ]
      }
    })
  })

  testCase('should raise exception on duplicate id and different defaults', (transform) => {
    expect(transform('duplicate-id.js')).toThrow(/Different defaults/)
  })
})
