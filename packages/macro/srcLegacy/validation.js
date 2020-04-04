const pluralRules = ["zero", "one", "two", "few", "many", "other"]

export function validatePluralRules(type, rules, onError) {
  // 'other' choice is required
  if (!rules.length) {
    onError(`Missing ${type} choices. At least one plural should be provided.`)
  }

  // validate plural rules
  if (type === "plural" || type === "selectordinal") {
    rules.forEach((rule) => {
      if (!pluralRules.includes(rule) && !/=\d+/.test(rule)) {
        onError(
          `Invalid plural rule '${rule}'. Must be ${pluralRules.join(
            ", "
          )} or exact number depending on your source language ('one' and 'other' for English).`
        )
      }
    })
  }
}
