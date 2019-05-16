export default [
  {
    name: "Arg macro should be exluded from values",
    input: `
        import { t, arg } from '@lingui/macro';
        const a = t\`Hello $\{arg('name')\}\`;
    `,
    expected: `
        const a = 
          /*i18n*/
          {
            id: "Hello {name}"
          };
    `
  }
]
