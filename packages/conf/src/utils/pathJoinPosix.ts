import path from "path"

// Enforce posix path delimiters internally
export const pathJoinPosix = (...values: string[]) =>
  path
    // normalize double slashes
    .join(...values)
    // convert platform specific path.sep to posix
    .split(path.sep)
    .join("/")
