const path = require('path')
const pkgConf = require('pkg-conf')


function replaceRootDir(conf, rootDir) {
  const replace = s => s.replace('<rootDir>', rootDir)

  ;['srcPathDirs', 'srcPathIgnorePatterns', 'localeDir']
    .forEach(key => {
      const value = conf[key]

      if (!value) {
      } else if (typeof value === "string") {
        conf[key] = replace(value)
      } else if (value.length) {
        conf[key] = value.map(replace)
      }
    })

  conf.rootDir = rootDir
  return conf
}


const defaults = {
  localeDir: "locale",
  srcPathDirs: ["<rootDir>"],
  srcPathIgnorePatterns: ["/node_modules/"]
}

function getConfig() {
  const conf = pkgConf.sync("lingui", {
    defaults,
    skipOnFalse: true
  })

  const rootDir = path.dirname(pkgConf.filepath(conf))

  return replaceRootDir(conf, rootDir)
}

export default getConfig
export { replaceRootDir }
