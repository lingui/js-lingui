<div align="center">
<h1><sub>js</sub>Lingui</h1>

🌍📖 A readable, automated, and optimized (5 kb) internationalization for JavaScript

<hr />

[![CircleCI][Badge-CI]][CI] 
[![AppVeyor][Badge-AppVeyor]][AppVeyor]
[![Code Coverage][Badge-Coverage]][Coverage]
[![PRs Welcome][Badge-PRWelcome]][PRWelcome]
[![Backers on Open Collective][Badge-ocbackers]][ocbackers-local]
[![Sponsors on Open Collective][Badge-ocsponsors]][ocsponsors-local]
[![Watch on GitHub][Badge-Watch]][Watch]
[![Star on GitHub][Badge-Stars]][Star]
[![Tweet][Badge-Twitter]][Twitter]
</div>

> Internationalization is the design and development of a product, application or document content that enables easy localization for target audiences that vary in culture, region, or language.
>
> --- [ W3C Web Internationalization FAQ](https://www.w3.org/International/questions/qa-i18n)

jsLingui simplifies internationalization in JavaScript. It covers all i18n features 
while keeping library size small by using compiled message catalogs. Messages are
automatically extracted from source and compiled at build step which makes production
code small and fast.

Optional but recommended are Babel plugins for auto-generating messages in
ICU MessageFormat from tagged template literals (plain JavaScript) or React components.

## Features

- Lightweight - about [5kb gzipped](https://github.com/lingui/js-lingui/blob/master/scripts/build/results.json)
  (1.9 kB core, 3.1 kB React components)
- Full support of **ICU MessageFormat** with extension to support HTML
- Unopinionated - supports manual and auto-generated message IDs out-of-the-box
- Batteries included - **CLI** for working with message catalogs
  (extracting, validating, compiling, …)
- Easy to migrate from react-intl

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
[comparison of react-intl and jsLingui](https://lingui.github.io/js-lingui/misc/react-intl.html).

## Support

If you are having issues, please let us know.

- Join us at [gitter.im](https://gitter.im/lingui/js-lingui) to get almost instant
  feedback.
- Ask question on [StackOverflow](https://stackoverflow.com/questions/ask?tags=jsLingui)
  and mark it with [jsLingui](https://stackoverflow.com/questions/tagged/jslingui) tag.
- If something doesn't work as documented, documentation is missing or if you just want
  to suggest a new feature, [create an issue][Issues].

## Contribute

Contribution to open-source project is everything from spreading a word, writing
documentation to implementing features and fixing bugs.

- Do you use **jsLingui** in production site? Let us know!
- Have you seen interesting talk or article about **i18n**?
  [Share it](https://github.com/lingui/js-lingui/edit/master/docs/misc/talks-about-i18n.rst)!
- Have you found a bug or do you want to suggest a new feature? [Create an issue][Issues]!
- Do you want to improve the docs and write some code?
  Read the [contributors guide][Contributing] and send a PR!

## Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="graphs/contributors"><img src="https://opencollective.com/js-lingui/contributors.svg?width=890&button=false" /></a>

## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/js-lingui#backer)]

<a href="https://opencollective.com/js-lingui#backers" target="_blank"><img src="https://opencollective.com/js-lingui/backers.svg?width=890"></a>

## Sponsors

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
[Documentation]: https://lingui.github.io/js-lingui/
[TutorialReact]: https://lingui.github.io/js-lingui/tutorials/react.html
[TutorialReactNative]: https://lingui.github.io/js-lingui/tutorials/react-native.html
[TutorialJavaScript]: https://lingui.github.io/js-lingui/tutorials/javascript.html
[TutorialCLI]: https://lingui.github.io/js-lingui/tutorials/cli.html

[Badge-CI]: https://img.shields.io/circleci/project/github/lingui/js-lingui/master.svg
[Badge-AppVeyor]: https://ci.appveyor.com/api/projects/status/0wjdm3qofrjo2c4n/branch/master?svg=true
[Badge-Coverage]: https://img.shields.io/codecov/c/github/lingui/js-lingui/master.svg
[Badge-Watch]: https://img.shields.io/github/watchers/lingui/js-lingui.svg?style=social&label=Watch
[Badge-Stars]: https://img.shields.io/github/stars/lingui/js-lingui.svg?style=social&label=Stars
[Badge-Twitter]: https://img.shields.io/twitter/url/https/github.com/lingui/js-lingui.svg?style=social
[Badge-PRWelcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[Badge-ocbackers]: https://opencollective.com/js-lingui/backers/badge.svg
[Badge-ocsponsors]: https://opencollective.com/js-lingui/sponsors/badge.svg

[CI]: https://circleci.com/gh/lingui/js-lingui/tree/master
[AppVeyor]: https://ci.appveyor.com/project/tricoder42/js-lingui/branch/master
[Coverage]: https://codecov.io/gh/lingui/js-lingui
[License]: https://github.com/lingui/js-lingui/blob/master/LICENSE
[Contributing]: https://github.com/lingui/js-lingui/blob/master/CONTRIBUTING.md
[Watch]: https://github.com/lingui/js-lingui/watchers
[Star]: https://github.com/lingui/js-lingui/stargazers
[Twitter]: https://twitter.com/intent/tweet?text=Check%20out%20js-lingui!%20https://github.com/lingui/js-lingui%20%F0%9F%91%8D
[Issues]: https://github.com/lingui/js-lingui/issues/new/choose
[PRWelcome]: http://makeapullrequest.com
[Indiegogo]: https://igg.me/at/js-lingui/x/4367619
[ocbackers-local]: #backers
[ocsponsors-local]: #sponsors
