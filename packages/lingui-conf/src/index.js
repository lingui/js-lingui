const path = require('path')
const chalk = require('chalk')
const pkgConf = require('pkg-conf')
const { validate } = require('jest-validate')
const { replacePathSepForRegex } = require('jest-regex-util')

const NODE_MODULES = replacePathSepForRegex(path.sep + 'node_modules' + path.sep)

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
  sourceLocale: '',
  fallbackLocale: '',
  srcPathDirs: ['<rootDir>'],
  srcPathIgnorePatterns: [NODE_MODULES],
  format: 'lingui',
  rootDir: '.'
}

const deprecatedConfig = {
  fallbackLanguage: (config) =>
    ` Option ${chalk.bold(
      'fallbackLanguage'
    )} was replaced by ${chalk.bold(
      'fallbackLocale'
    )}
    
    lingui-cli now treats your current configuration as:
    {
      ${chalk.bold('"fallbackLocale"')}: ${chalk.bold(`"${config.fallbackLanguage}"`)}
    }
    
    Please update your configuration.
    `
}

const configValidation = {
  exampleConfig: defaults,
  deprecatedConfig,
  comment: `See https://l.lingui.io/ref-lingui-conf for a list of valid options`
}

function getConfig () {
  const raw = pkgConf.sync('lingui', {
    defaults,
    skipOnFalse: true
  })

  validate(raw, configValidation)
  // Use deprecated fallbackLanguage, if defined
  raw.fallbackLocale = raw.fallbackLocale || raw.fallbackLanguage || ''

  const rootDir = path.dirname(pkgConf.filepath(raw))
  return replaceRootDir(raw, rootDir)
}

export default getConfig
export { replaceRootDir }
