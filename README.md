<div align="center">
<h1>Lingui<sub>js</sub></h1>

🌍📖 A readable, automated, and optimized (5 kb) internationalization for JavaScript

<hr />

[![CircleCI][Badge-CI]][CI] 
[![AppVeyor][Badge-AppVeyor]][AppVeyor]
[![Code Coverage][Badge-Coverage]][Coverage]
[![PRs Welcome][Badge-PRWelcome]][PRWelcome]
[![Backers on Open Collective][Badge-ocbackers]][ocbackers-local]
[![Sponsors on Open Collective][Badge-ocsponsors]][ocsponsors-local]

[**Documentation**][Documentation] · [**Quickstart**](#quickstart) · [**Support**](#support) · [**Contribute**](#contribute) · [**Licence**](#licence)
</div>

> Internationalization is the design and development of a product, application or document content that enables easy localization for target audiences that vary in culture, region, or language.
>
> --- [ W3C Web Internationalization FAQ](https://www.w3.org/International/questions/qa-i18n)


Lingui is an easy yet powerfull internationalization framework for global projects.

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
  message keys as well as auto generated messages. Translations are stored either in
  JSON or standard PO file, which is supported in almost all translation tools.
  
- **Lightweight and optimized** - Core library is only [1.9 kB gzipped][BundleCore],
  React components are additional [3.1 kBs gzipped][BundleReact]. That's less than Redux
  for a full-featured intl library.
  
- **Active community** - Join us on [Gitter.im][Gitter] to discuss the latest development.
  At the moment, Lingui is the most active intl project on GitHub.
  
- **Compatible with react-intl** - Low-level React API is very similar to react-intl
  and the message format is the same. It's easy to migrate existing project.

## How does it look like?

### Example with React
   
<div align="center">
   
   ![Example with React](https://lingui.js.org/_static/pitch_messages.png)
   
</div>

### Example with React using message IDs

<div align="center">

   ![Example with React using message IDs](https://lingui.js.org/_static/pitch_keys.png)
   
</div>

## Quickstart

Checkout these tutorials for installation instructions and brief introduction:

- [React][TutorialReact]
- [React Native][TutorialReactNative]
- [Plain JavaScript][TutorialJavaScript]
- [Working with Command Line Tool][TutorialCLI]

If you're a react-intl user, checkout
[comparison of react-intl and Lingui](https://lingui.js.org/misc/react-intl.html).

## Support

If you are having issues, please let us know.

- Join us at [gitter.im][Gitter] to get almost instant
  feedback.
- Ask question on [StackOverflow](https://stackoverflow.com/questions/ask?tags=jsLingui)
  and mark it with [Lingui](https://stackoverflow.com/questions/tagged/jslingui) tag.
- If something doesn't work as documented, documentation is missing or if you just want
  to suggest a new feature, [create an issue][Issues].

## Contribute

Contribution to open-source project is everything from spreading a word, writing
documentation to implementing features and fixing bugs.

- Do you use **Lingui** in production site? Let us know!
- Have you seen interesting talk or article about **i18n**?
  [Share it](https://github.com/lingui/js-lingui/edit/master/docs/misc/talks-about-i18n.rst)!
- Have you found a bug or do you want to suggest a new feature? [Create an issue][Issues]!
- Do you want to improve the docs and write some code?
  Read the [contributors guide][Contributing] and send a PR!

### Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].

[![Contributors][Img-Contributors]][Contributors]

### Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/js-lingui#backer)]

[![Backers][Img-Backers]][Backers]

### Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/js-lingui#sponsor)]

<a href="https://opencollective.com/js-lingui/sponsor/0/website" target="_blank"><img src="https://opencollective.com/js-lingui/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/js-lingui/sponsor/1/website" target="_blank"><img src="https://opencollective.com/js-lingui/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/js-lingui/sponsor/2/website" target="_blank"><img src="https://opencollective.com/js-lingui/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/js-lingui/sponsor/3/website" target="_blank"><img src="https://opencollective.com/js-lingui/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/js-lingui/sponsor/4/website" target="_blank"><img src="https://opencollective.com/js-lingui/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/js-lingui/sponsor/5/website" target="_blank"><img src="https://opencollective.com/js-lingui/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/js-lingui/sponsor/6/website" target="_blank"><img src="https://opencollective.com/js-lingui/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/js-lingui/sponsor/7/website" target="_blank"><img src="https://opencollective.com/js-lingui/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/js-lingui/sponsor/8/website" target="_blank"><img src="https://opencollective.com/js-lingui/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/js-lingui/sponsor/9/website" target="_blank"><img src="https://opencollective.com/js-lingui/sponsor/9/avatar.svg"></a>

## License

The project is licensed under the [MIT][License] license.

[ReactIntl]: https://github.com/yahoo/react-intl
[Documentation]: https://lingui.js.org/
[TutorialReact]: https://lingui.js.org/tutorials/react.html
[TutorialReactNative]: https://lingui.js.org/tutorials/react-native.html
[TutorialJavaScript]: https://lingui.js.org/tutorials/javascript.html
[TutorialCLI]: https://lingui.js.org/tutorials/cli.html
[RefCLI]: https://lingui.js.org/ref/cli.html

[Badge-CI]: https://img.shields.io/circleci/project/github/lingui/js-lingui/master.svg
[Badge-AppVeyor]: https://ci.appveyor.com/api/projects/status/0wjdm3qofrjo2c4n/branch/master?svg=true
[Badge-Coverage]: https://img.shields.io/codecov/c/github/lingui/js-lingui/master.svg
[Badge-PRWelcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[Badge-ocbackers]: https://opencollective.com/js-lingui/backers/badge.svg
[Badge-ocsponsors]: https://opencollective.com/js-lingui/sponsors/badge.svg
[Img-Contributors]: https://opencollective.com/js-lingui/contributors.svg?width=890&button=false
[Contributors]: https://github.com/lingui/js-lingui/graphs/contributors
[Img-Backers]: https://opencollective.com/js-lingui/backers.svg?width=890
[Backers]: https://opencollective.com/js-lingui#backers

[CI]: https://circleci.com/gh/lingui/js-lingui/tree/master
[AppVeyor]: https://ci.appveyor.com/project/tricoder42/js-lingui/branch/master
[Coverage]: https://codecov.io/gh/lingui/js-lingui
[License]: https://github.com/lingui/js-lingui/blob/master/LICENSE
[Contributing]: https://github.com/lingui/js-lingui/blob/master/CONTRIBUTING.md
[Issues]: https://github.com/lingui/js-lingui/issues/new/choose
[PRWelcome]: http://makeapullrequest.com
[Indiegogo]: https://igg.me/at/js-lingui/x/4367619
[ocbackers-local]: #backers
[ocsponsors-local]: #sponsors
[BundleReact]: https://bundlephobia.com/result?p=@lingui/react
[BundleCore]: https://bundlephobia.com/result?p=@lingui/core
[Gitter]: https://gitter.im/lingui/js-lingui
