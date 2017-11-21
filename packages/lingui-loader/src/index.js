import getConfig from 'lingui-conf'
import { compile } from 'lingui-cli/dist/api/compile'

export default function (source) {
  const config = getConfig()
  const format = require(`lingui-cli/dist/api/formats/${config.format}`).default(config)

  // source files
  this.addDependency(headerPath)

  return `export default ${ JSON.stringify(source) }`
}
