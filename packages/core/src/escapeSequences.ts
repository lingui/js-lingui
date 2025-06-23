// Regex for detecting escape sequences (optimized for .test() without capturing groups)
export const ESCAPE_SEQUENCE_REGEX = /\\u[a-fA-F0-9]{4}|\\x[a-fA-F0-9]{2}/

/**
 * Converts escape sequences (\uXXXX Unicode and \xXX hexadecimal) to their corresponding characters
 */
export const decodeEscapeSequences = (str: string): string => {
  return str.replace(
    // Same pattern but with capturing groups for extracting values during replacement
    /\\u([a-fA-F0-9]{4})|\\x([a-fA-F0-9]{2})/g,
    (match, unicode, hex) => {
      if (unicode) {
        const codePoint = parseInt(unicode, 16)
        return String.fromCharCode(codePoint)
      } else if (hex) {
        const codePoint = parseInt(hex, 16)
        return String.fromCharCode(codePoint)
      }
      return match
    }
  )
}
