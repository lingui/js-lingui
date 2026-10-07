import type { GetStaticProps } from "next"
import { msg } from "@lingui/core/macro"
import { Plural, Trans } from "@lingui/react/macro"
import { useLingui } from "@lingui/react"

import { Layout } from "../components/Layout"
import { PluralExample } from "../components/PluralExample"
import { loadCatalog } from "../i18n"

export const getStaticProps: GetStaticProps = async (ctx) => {
  const translation = await loadCatalog(ctx.locale!)
  return {
    props: {
      translation,
    },
  }
}

// Messages defined outside of a component are only described with `msg` here
// and translated later, inside a component, with `i18n._()`.
const colors = [msg`Cyan`, msg`Magenta`, msg`Yellow`, msg`Black`]

export default function Examples() {
  const { i18n } = useLingui()

  return (
    <Layout>
      <h1>
        <Trans>Examples</Trans>
      </h1>

      <h2>
        <Trans>Plurals</Trans>
      </h2>

      <PluralExample
        render={({ value }) => (
          <p>
            <Plural
              value={value}
              one="There's one book"
              other="There are # books"
            />
          </p>
        )}
      />

      <h2>
        <Trans>Translation outside of React components</Trans>
      </h2>

      <ul>
        {colors.map((color) => (
          <li key={color.id}>{i18n._(color)}</li>
        ))}
      </ul>
    </Layout>
  )
}
