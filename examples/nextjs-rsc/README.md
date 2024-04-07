## Example project using Next 13 SWC Compiler with LinguiJS Plugin

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## SWC Compatibility
SWC Plugin support is still experimental. Semver backwards compatibility between different `next-swc` versions is not guaranteed.

Therefore, you need to select an appropriate version of the Lingui plugin to match compatible `NextJs` version.
You also need to add the `@lingui/swc-plugin` dependency with strict version without a range specifier.

```json
{
  "devDependencies": {
    "@lingui/swc-plugin": "4.0.5"
  }
}
```

For more information on compatibility, please refer to the [Compatibility section](https://github.com/lingui/swc-plugin#compatibility).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## LinguiJS Integration
LinguiJs integrated with standard nextjs i18n support. Nextjs do routing for every language,
LinguiJs activated with `router.locale`.

Open [http://localhost:3000/cs](http://localhost:3000/cs) with your browser to prerender page in different language.

## LinguiJS Related Commands

Extract messages from sourcecode:
```bash
npm run lingui:extract
# or
yarn lingui:extract
# or
pnpm lingui:extract
```

## Important Notes
- You **should not have** a babel config in the project, otherwise Next will turn off SWC compiler in favor of babel.
- The actual code is compiled with SWC + Lingui SWC plugin.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
