import mockFs from 'mock-fs'

describe('extract', function () {
  let extract, babel, typescript

  beforeAll(() => {
    jest.doMock('./extractors/babel', () => ({
      match: jest.fn(filename => filename.endsWith('.js')),
      extract: jest.fn()
    }))

    jest.doMock('./extractors/typescript', () => ({
      match: jest.fn(filename => filename.endsWith('.ts')),
      extract: jest.fn()
    }))

    // load before mocking FS
    extract = require('./extract').extract
    babel = require('./extractors/babel')
    typescript = require('./extractors/typescript')

    mockFs({
      src: {
        'index.html': '',

        components: {
          'Babel.js': '',
          'Typescript.ts': '',
          forbidden: {
            'apple.js': ''
          }
        },

        forbidden: {
          'file.js': ''
        }
      }
    })
  })

  afterAll(() => {
    mockFs.restore()
  })

  it('should traverse directory and call extractors', function () {
    extract(['src'], {
      localeDir: 'locale',
      ignore: ['forbidden']
    })

    expect(typescript.match).toHaveBeenCalledWith('src/components/Typescript.ts')
    expect(babel.match).toHaveBeenCalledWith('src/components/Babel.js')
    expect(babel.match).toHaveBeenCalledWith('src/index.html')

    // This file is ignored
    expect(babel.extract).not.toHaveBeenCalledWith('src/index.html')

    expect(babel.extract)
      .toHaveBeenCalledWith('src/components/Babel.js', 'locale')
    expect(babel.extract)
      .not.toHaveBeenCalledWith('src/components/Typescript.ts', 'locale')

    expect(typescript.extract)
      .not.toHaveBeenCalledWith('src/components/Babel.js', 'locale')
    expect(typescript.extract)
      .toHaveBeenCalledWith('src/components/Typescript.ts', 'locale')
  })
})

describe('collect', function () {
  beforeAll(() => {
    mockFs({
      src: {
        components: {
          'Ignore.js': 'Messages are collected only from JS files.',
          'Broken.json': 'Invalid JSONs are ignored too.',
          'Babel.json': JSON.stringify({
            'Babel Documentation': {
              defaults: 'Babel Documentation',
              origin: [
                ['src/components/Babel.js', 5]
              ]
            },
            'Label': {
              defaults: 'Label',
              origin: [
                ['src/components/Babel.js', 7]
              ]
            }
          }),
          'Typescript.json': JSON.stringify({
            'Typescript Documentation': {
              defaults: 'Typescript Documentation',
              origin: [
                ['src/components/Typescript.ts', 5]
              ]
            },
            'Label': {
              defaults: 'Label',
              origin: [
                ['src/components/Typescript.ts', 7]
              ]
            }
          })
        }
      }
    })
  })

  afterAll(() => {
    mockFs.restore()
  })

  it.only('should traverse directory and call extractors', function () {
    const { collect } = require('./extract')
    const catalog = collect('src')
    expect(catalog).toMatchSnapshot()
  })
})
