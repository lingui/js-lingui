function createPackageRegExp(packageName: string) {
  return new RegExp("^" + packageName + "(?:\\/.+)?")
}

export function buildIncludeDepsFilter(includeDeps: string[]) {
  const include = includeDeps.map(createPackageRegExp)

  return (id: string) => include.some((regExp) => regExp.test(id))
}
