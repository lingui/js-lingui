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
        linguiConfig: makeConfig(
          {
            macro: {
              jsxPlaceholderAttribute: "_t",
            },
          },
          { skipValidation: true },
        ),
      },
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
        linguiConfig: makeConfig(
          {
            macro: {
              jsxPlaceholderDefaults: {
                a: "link",
                em: "em",
              },
            },
          },
          { skipValidation: true },
        ),
      },
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
        linguiConfig: makeConfig(
          {
            macro: {
              jsxPlaceholderAttribute: "_t",
              jsxPlaceholderDefaults: {
                a: "link",
              },
            },
          },
          { skipValidation: true },
        ),
      },
    },
    {
      name: "Deduplication: Identical elements are reused",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>Hello <em>emphasis</em>, normal, <em>more emphasis</em>.</Trans>
      `,
      macroOpts: {
        linguiConfig: makeConfig(
          {
            macro: {
              jsxPlaceholderDefaults: {
                em: "em",
              },
            },
          },
          { skipValidation: true },
        ),
      },
    },
    {
      name: "Deduplication: Same explicit placeholder with identical attributes does not throw",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>Hello <a _t="link" href="/a">link 1</a>, normal, <a _t="link" href="/a">link 1 copy</a>.</Trans>
      `,
      macroOpts: {
        linguiConfig: makeConfig(
          {
            macro: {
              jsxPlaceholderAttribute: "_t",
            },
          },
          { skipValidation: true },
        ),
      },
    },
    {
      name: "Deduplication: Identical elements with different prop order are reused",
      code: `
import { Trans } from "@lingui/react/macro";
<Trans>Hello <a _t="link" href="/a" class="foo">link 1</a>, normal, <a _t="link" class="foo" href="/a">link 1 copy</a>.</Trans>;
      `,
      macroOpts: {
        linguiConfig: makeConfig(
          {
            macro: {
              jsxPlaceholderAttribute: "_t",
            },
          },
          { skipValidation: true },
        ),
      },
    },
    {
      name: "Deduplication: Implicit names with distinct attributes throw an error",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>Hello <a href="/a">link 1</a>, normal, <a href="/b">link 2</a>.</Trans>
      `,
      shouldThrow: true,
      macroOpts: {
        linguiConfig: makeConfig(
          {
            macro: {
              jsxPlaceholderDefaults: {
                a: "a",
              },
            },
          },
          { skipValidation: true },
        ),
      },
    },
    {
      name: "Deduplication: Explicit names with different attributes throw an error",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>Hello <a _t="link" href="/a">link 1</a>, normal, <a _t="link" href="/b">link 2</a>.</Trans>
      `,
      shouldThrow: true,
      macroOpts: {
        linguiConfig: makeConfig(
          {
            macro: {
              jsxPlaceholderAttribute: "_t",
            },
          },
          { skipValidation: true },
        ),
      },
    },
    {
      name: "Deduplication: Same name on different element types throws an error",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans><em _t="same">A</em> and <strong _t="same">B</strong></Trans>
      `,
      shouldThrow: true,
      macroOpts: {
        linguiConfig: makeConfig(
          {
            macro: {
              jsxPlaceholderAttribute: "_t",
            },
          },
          { skipValidation: true },
        ),
      },
    },
    {
      name: "Throws on non-string _t attribute value",
      code: `
        import { Trans } from '@lingui/react/macro';
        const name = "link";
        <Trans><a _t={name} href="/">click</a></Trans>
      `,
      shouldThrow: true,
      macroOpts: {
        linguiConfig: makeConfig(
          {
            macro: {
              jsxPlaceholderAttribute: "_t",
            },
          },
          { skipValidation: true },
        ),
      },
    },
    {
      name: "Throws on empty _t attribute value",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans><a _t="" href="/">click</a></Trans>
      `,
      shouldThrow: true,
      macroOpts: {
        linguiConfig: makeConfig(
          {
            macro: {
              jsxPlaceholderAttribute: "_t",
            },
          },
          { skipValidation: true },
        ),
      },
    },
    {
      name: "Throws on numeric placeholder name",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans><a _t="0" href="/">click</a></Trans>
      `,
      shouldThrow: true,
      macroOpts: {
        linguiConfig: makeConfig(
          {
            macro: {
              jsxPlaceholderAttribute: "_t",
            },
          },
          { skipValidation: true },
        ),
      },
    },
    {
      name: "Throws on invalid identifier placeholder name",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans><a _t="foo-bar" href="/">click</a></Trans>
      `,
      shouldThrow: true,
      macroOpts: {
        linguiConfig: makeConfig(
          {
            macro: {
              jsxPlaceholderAttribute: "_t",
            },
          },
          { skipValidation: true },
        ),
      },
    },
    {
      name: "Deduplication: Identical spreads are reused",
      code: `
        import { Trans } from '@lingui/react/macro';
        const props = { href: "/a" };
        <Trans><a _t="link" {...props}>A</a> and <a _t="link" {...props}>B</a></Trans>
      `,
      macroOpts: {
        linguiConfig: makeConfig(
          {
            macro: {
              jsxPlaceholderAttribute: "_t",
            },
          },
          { skipValidation: true },
        ),
      },
    },
    {
      name: "Deduplication: Different spreads throw an error",
      code: `
        import { Trans } from '@lingui/react/macro';
        const p1 = { href: "/a" };
        const p2 = { href: "/b" };
        <Trans><a _t="link" {...p1}>A</a> and <a _t="link" {...p2}>B</a></Trans>
      `,
      shouldThrow: true,
      macroOpts: {
        linguiConfig: makeConfig(
          {
            macro: {
              jsxPlaceholderAttribute: "_t",
            },
          },
          { skipValidation: true },
        ),
      },
    },
    {
      name: "Deduplication: Same spread with different attribute order throws an error",
      code: `
        import { Trans } from '@lingui/react/macro';
        const props = { href: "/b" };
        <Trans><a _t="link" {...props} href="/a">A</a> and <a _t="link" href="/a" {...props}>B</a></Trans>
      `,
      shouldThrow: true,
      macroOpts: {
        linguiConfig: makeConfig(
          {
            macro: {
              jsxPlaceholderAttribute: "_t",
            },
          },
          { skipValidation: true },
        ),
      },
    },
  ],
})
