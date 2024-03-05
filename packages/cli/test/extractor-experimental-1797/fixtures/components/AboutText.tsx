import { Trans } from '@lingui/macro'

export function AboutText() {
  return (
    <p>
      <Trans>Hello, world</Trans>
      <br />
      <Trans id="message.next-explanation">
        Next.js is an open-source React front-end development web framework that
        enables functionality such as server-side rendering and generating
        static websites for React based web applications. It is a
        production-ready framework that allows developers to quickly create
        static and dynamic JAMstack websites and is used widely by many large
        companies.
      </Trans>
    </p>
  )
}
