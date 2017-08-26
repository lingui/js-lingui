import fs from 'fs'
import path from 'path'

export function getLanguages (localeDir) {
  return fs.readdirSync(localeDir).filter(dirname =>
    /^([a-z-]+)$/i.test(dirname) &&
    fs.lstatSync(path.join(localeDir, dirname)).isDirectory() &&
    fs.existsSync(path.join(localeDir, dirname, 'messages.json'))
  )
}
