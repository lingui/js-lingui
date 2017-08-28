const path = require('path')
const pkgConf = require('pkg-conf')
const { validate } = require('jest-validate')

function replaceRootDir (conf, rootDir) {
  const replace = s => s.replace('<rootDir>', rootDir)

  ;['srcPathDirs', 'srcPathIgnorePatterns', 'localeDir']
    .forEach(key => {
      const value = conf[key]

      if (!value) {
      } else if (typeof value === 'string') {
        conf[key] = replace(value)
      } else if (value.length) {
        conf[key] = value.map(replace)
      }
    })

  conf.rootDir = rootDir
  return conf
}

const defaults = {
  localeDir: './locale',
  fallbackLanguage: '',
  srcPathDirs: ['<rootDir>'],
  srcPathIgnorePatterns: ['/node_modules/'],
  format: 'lingui',
  rootDir: '.'
}

const configValidation = {
  exampleConfig: defaults,
  comment: `See https://l.lingui.io/ref-lingui-conf for a list of valid options`
}

function getConfig () {
  const raw = pkgConf.sync('lingui', {
    defaults,
    skipOnFalse: true
  })

  validate(raw, configValidation)

  const rootDir = path.dirname(pkgConf.filepath(raw))
  return replaceRootDir(raw, rootDir)
}

export default getConfig
export { replaceRootDir }
