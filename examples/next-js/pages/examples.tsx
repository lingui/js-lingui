import { Trans, Plural, plural } from "@lingui/macro"

import { Layout } from "lingui-example/components/Layout"
import { PluralExample } from "lingui-example/components/PluralExample"

export default function Home() {
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
    </Layout>
  )
}
