const msg = /*i18n*/ { id: "Message" }

const withDescription = /*i18n*/ { id: "Description", comment: "description" }

const withId = /*i18n*/ { id: "ID", message: "Message with id" }

const withValues = /*i18n*/ {
  id: "Values {param} {0} {name}",
  values: { param: param, 0: user.getName(), ["name"]: "foo" },
}
/**
 * With values passed as variable
 */
const values = {}
const withValues2 = /*i18n*/ { id: "Values {param} {0}", values }

const withContext = /*i18n*/ { id: "Some id", context: "Context1" }
