type GettextPluralsInfo = {
  nplurals: number
  pluralsFunc: (n: number) => number
}

export function parsePluralFormsHeader(
  pluralFormsHeader: string,
): GettextPluralsInfo | undefined {
  const [npluralsExpr, expr] = pluralFormsHeader.split(";")

  try {
    if (!expr) {
      throw new Error("malformed expr")
    }

    const nplurals = new Function(npluralsExpr + "; return nplurals;")()

    return {
      nplurals,
      pluralsFunc: createPluralFunc(
        expr.replace(/\s/g, "").replace("plural=", ""),
      ),
    }
  } catch (e) {
    console.warn(
      `Plural-Forms header has incorrect value: ${pluralFormsHeader}`,
    )
    return undefined
  }
}

export function createPluralFunc(expr: string) {
  const func = new Function(
    "n",
    "return " + expr,
  ) as GettextPluralsInfo["pluralsFunc"]

  return (val: number) => {
    return Number(func(val))
  }
}
