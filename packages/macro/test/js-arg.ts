import { TestCase } from "./index"

const cases: TestCase[] = [
  {
    name: "Arg macro should be exluded from values",
    input: `
        import { t, arg } from '@lingui/macro';
        const a = t\`Hello $\{arg('name')\}\`;
    `,
    expected: `
        import { i18n } from "@lingui/core";
        const a = 
          /*i18n*/
          i18n._("Hello {name}")
    `,
  },
]

export default cases;
