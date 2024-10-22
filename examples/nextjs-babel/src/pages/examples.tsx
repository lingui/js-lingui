import { plural, msg } from "@lingui/core/macro"
import { Trans, Plural } from "@lingui/react/macro"

import { Layout } from "../components/Layout"
import { PluralExample } from "../components/PluralExample"
import { GetStaticProps } from "next"
import { loadCatalog } from "../i18n"
import { useLingui } from "@lingui/react"

export const getStaticProps: GetStaticProps = async (ctx) => {
  const translation = await loadCatalog(ctx.locale!)
  return {
    props: {
      translation,
    },
  }
}

const colors = [msg`Cyan`, msg`Magenta`, msg`Yellow`, msg`Black`]

export default function Home() {
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

      <PluralExample
        render={({ value }) => (
          <p>
            {plural(value, {
              one: "There's one book",
              other: "There are # books",
            })}
          </p>
        )}
      />

      <h2>
        <Trans>Translation outside of React components</Trans>
      </h2>

      <ul>
        {colors.map((color, i) => (
          <li key={i}>{i18n._(color)}</li>
        ))}
      </ul>
    </Layout>
  )
}
