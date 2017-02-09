const annotateVariable = (variable: any, index: number) => {
  if (typeof variable === 'object' && Object.keys(variable).length === 1) {
    return variable
  } else {
    return { [index]: variable.toString() }
  }
}

const variableName = (variable: any, index = 0) => {
  if (typeof variable === 'object' && Object.keys(variable).length === 1) {
    return Object.keys(variable)[0]
  } else {
    return index
  }
}

export { annotateVariable, variableName }
