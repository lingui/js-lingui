import { macroTester } from "./macroTester"
import { makeConfig } from "@lingui/conf"

macroTester({
  cases: [
    {
      name: "Placeholder attribute is stripped from AST",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>
          <a _t="link" href="/about">About</a>
        </Trans>
      `,
      macroOpts: {
        linguiConfig: makeConfig({
          macro: {
            jsxPlaceholderAttribute: "_t",
          }
        })
      }
    },
    {
      name: "Respects jsxPlaceholderDefaults",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>
          Here's a <a>link</a> and <em>emphasis</em>.
        </Trans>
      `,
      macroOpts: {
        linguiConfig: makeConfig({
          macro: {
            jsxPlaceholderDefaults: {
              a: "link",
              em: "em"
            }
          }
        })
      }
    },
    {
      name: "Mixing explicit _t together with jsxPlaceholderDefaults",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>
          Hello <a href="/a">link 1</a>, normal, <a _t="link2" href="/b">link 2</a>.
        </Trans>
      `,
      macroOpts: {
        linguiConfig: makeConfig({
          macro: {
            jsxPlaceholderAttribute: "_t",
            jsxPlaceholderDefaults: {
              a: "link",
            }
          }
        })
      }
    },
    {
      name: "Deduplication: Identical elements are reused",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>Hello <em>emphasis</em>, normal, <em>more emphasis</em>.</Trans>
      `,
      macroOpts: {
        linguiConfig: makeConfig({
          macro: {
            jsxPlaceholderDefaults: {
              em: "em",
            }
          }
        })
      }
    },
    {
      name: "Deduplication: Same explicit placeholder with identical attributes does not throw",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>Hello <a _t="link" href="/a">link 1</a>, normal, <a _t="link" href="/a">link 1 copy</a>.</Trans>
      `,
      macroOpts: {
        linguiConfig: makeConfig({
          macro: {
            jsxPlaceholderAttribute: "_t",
          }
        })
      }
    },
    {
      name: "Deduplication: Identical elements with different prop order are reused",
      code: `
import { Trans } from "@lingui/react/macro";
<Trans>Hello <a _t="link" href="/a" class="foo">link 1</a>, normal, <a _t="link" class="foo" href="/a">link 1 copy</a>.</Trans>;
      `,
      macroOpts: {
        linguiConfig: makeConfig({
          macro: {
            jsxPlaceholderAttribute: "_t",
          }
        })
      }
    },
    {
      name: "Deduplication: Implicit names with distinct attributes throw an error",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>Hello <a href="/a">link 1</a>, normal, <a href="/b">link 2</a>.</Trans>
      `,
      shouldThrow: true,
      macroOpts: {
        linguiConfig: makeConfig({
          macro: {
            jsxPlaceholderDefaults: {
              a: "a",
            }
          }
        })
      }
    },
    {
      name: "Deduplication: Explicit names with different attributes throw an error",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>Hello <a _t="link" href="/a">link 1</a>, normal, <a _t="link" href="/b">link 2</a>.</Trans>
      `,
      shouldThrow: true,
      macroOpts: {
        linguiConfig: makeConfig({
          macro: {
            jsxPlaceholderAttribute: "_t",
          }
        })
      }
    },
  ]
})
