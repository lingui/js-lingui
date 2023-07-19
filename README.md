<div align="center">
<h1>Lingui<sub>js</sub></h1>

🌍📖 A readable, automated, and optimized (3 kb) internationalization for JavaScript

<hr />

![Main Suite][Badge-MainSuite-GithubCI]
![Release Workflow Testing][Badge-ReleaseWorkflowTesting-GithubCI]
[![Code Coverage][Badge-Coverage]][Coverage]
[![PRs Welcome][Badge-PRWelcome]][PRWelcome]
[![Join the community on Discord][Badge-Discord]][Discord]

[**Documentation**][Documentation] · [**Quickstart**](#quickstart) · [**Example**](#example) · [**Support**](#support) · [**Contribute**](#contribute) · [**License**](#license)
</div>

> Internationalization is the design and development of a product, application or document content that enables easy localization for target audiences that vary in culture, region, or language.
>
> --- [ W3C Web Internationalization FAQ](https://www.w3.org/International/questions/qa-i18n)


Lingui is an easy yet powerful internationalization framework for global projects.

- **Clean and readable** - Keep your code clean and readable, while the library uses
  battle-tested and powerful **ICU MessageFormat** under the hood.

- **Universal** - Use it everywhere. `@lingui/core` provides the essential intl
  functionality which works in any JavaScript project while `@lingui/react` offers
  components to leverage React rendering.

- **Full rich-text support** - Use React components inside localized messages
  without any limitation. Writing rich-text messages is as easy as writing JSX.

- **Powerful tooling** - Manage the whole intl workflow using Lingui [CLI][RefCLI]. It
  extracts messages from source code, validates messages coming from translators and
  checks that all messages are translated before shipping to production.

- **Unopinionated** - Integrate Lingui into your existing workflow. It supports
  message keys as well as auto-generated messages. Translations are stored either in
  JSON or standard PO files, which are supported in almost all translation tools.

- **Lightweight and optimized** - Core library is only [1.5 kB gzipped][BundleCore],
  React components are an additional [1.3 kBs gzipped][BundleReact]. That's less than Redux
  for a full-featured intl library.

- **Active community** - Join us on [Discord][Discord] to discuss the latest development.
  At the moment, Lingui is the most active intl project on GitHub.

- **Compatible with react-intl** - Low-level React API is very similar to react-intl
  and the message format is the same. It's easy to migrate an existing project.

## Quickstart

### Install

- [Create React App][TutorialSetupCRA]
- [React projects][TutorialSetupReact]
- [Vite project][SetupVite]

### Tutorials

- [React][TutorialReact]
- [Vue.js][TutorialVue]
- [React Native][TutorialReactNative]
- [Plain JavaScript][TutorialJavaScript]
- [Working with Command Line Tool][TutorialCLI]

### Plugins

- [SWC Plugin][SWCPlugin]
- [Vite Plugin][VitePlugin]

If you're a react-intl user, check out [a comparison of react-intl and Lingui](https://lingui.dev/misc/react-intl).

## Example

Short example how i18n looks with JSX:

```js
import { Trans } from "@lingui/macro"

function App() {
  return (
   <Trans id="msg.docs" /* id is optional */>
     Read the <a href="https://lingui.dev">documentation</a>
     for more info.
   </Trans>
  )
}
```

Message from this component will be extracted in following format:

```po
msgid "msg.docs"
msgstr "Read the <0>documentation</0> for more info."
```

For more example see the [Examples][Examples] directory.

## Support

If you are having issues, please let us know.

- Join us on [Discord](https://discord.gg/gFWwAYnMtA) to chat with the community.
- Ask questions on [StackOverflow](https://stackoverflow.com/questions/ask?tags=linguijs) and mark it with [Lingui](https://stackoverflow.com/questions/tagged/linguijs) tag.
- If something doesn't work as documented, documentation is missing or if you just want to suggest a new feature, [create an issue][Issues].

## Contribute

Contribution to open-source project is everything from spreading the word, writing documentation to implement features and fixing bugs.

- Do you use **Lingui** in production site? Let us know!
- Have you seen any interesting talk or article about **i18n**? [Share it](https://github.com/lingui/js-lingui/edit/main/website/docs/misc/resources.md)!
- Have you found a bug or do you want to suggest a new feature? [Create an issue][Issues]!
- Do you want to improve the docs and write some code? Read the [contributors guide][Contributing] and send a PR!

### Contributors

This project exists thanks to [all the people][Contributors] who contribute. [[Contribute](CONTRIBUTING.md)].

## License

The project is licensed under the [MIT][License] license.

[Documentation]: https://lingui.dev
[TutorialReact]: https://lingui.dev/tutorials/react
[TutorialReactNative]: https://lingui.dev/tutorials/react-native
[TutorialJavaScript]: https://lingui.dev/tutorials/javascript
[TutorialCLI]: https://lingui.dev/tutorials/cli
[TutorialSetupCRA]: https://lingui.dev/tutorials/setup-cra
[TutorialSetupReact]: https://lingui.dev/tutorials/setup-react
[TutorialVue]: https://lingui.dev/tutorials/extractor-vue
[SetupVite]: https://lingui.dev/tutorials/setup-vite
[RefCLI]: https://lingui.dev/ref/cli
[Examples]: https://github.com/lingui/js-lingui/tree/main/examples

[SWCPlugin]: https://lingui.dev/ref/swc-plugin
[VitePlugin]: https://lingui.dev/ref/vite-plugin

[Badge-MainSuite-GithubCI]: https://github.com/lingui/js-lingui/workflows/main-suite/badge.svg
[Badge-ReleaseWorkflowTesting-GithubCI]: https://github.com/lingui/js-lingui/workflows/release-workflow-test/badge.svg
[Badge-Coverage]: https://img.shields.io/codecov/c/github/lingui/js-lingui/main.svg
[Badge-PRWelcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[Badge-Discord]: https://img.shields.io/discord/974702239358783608.svg?label=Discord&logo=Discord&colorB=7289da&style=flat-square
[Contributors]: https://github.com/lingui/js-lingui/graphs/contributors

[Coverage]: https://codecov.io/gh/lingui/js-lingui
[License]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[Contributing]: https://github.com/lingui/js-lingui/blob/main/CONTRIBUTING.md
[Issues]: https://github.com/lingui/js-lingui/issues/new/choose
[PRWelcome]: http://makeapullrequest.com
[BundleReact]: https://bundlephobia.com/result?p=@lingui/react
[BundleCore]: https://bundlephobia.com/result?p=@lingui/core
[Discord]: https://discord.gg/gFWwAYnMtA
