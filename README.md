<div align="center">
<h1><sub>js</sub>Lingui</h1>

I18n libraries for JavaScript focused on high quality developer experience

<hr />

<a href="https://www.buymeacoffee.com/tricoder" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>
   
[![CircleCI][Badge-CI]][CI] 
[![AppVeyor][Badge-AppVeyor]][AppVeyor]
[![Code Coverage][Badge-Coverage]][Coverage]
[![PRs Welcome][Badge-PRWelcome]][PRWelcome]
[![All Contributors](https://img.shields.io/badge/all_contributors-13-orange.svg?style=flat-square)](#contributors)
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

![Example use case with React](https://lingui.github.io/js-lingui/_static/lingui-pitch.png)

## Features

- Lightweight - about [5kb gzipped](https://github.com/lingui/js-lingui/blob/master/scripts/build/results.json)
  (1.9 kB core, 3.1 kB React components)
- Full support of **ICU MessageFormat** with extension to support HTML
- Unopinionated - supports manual and auto-generated message IDs out-of-the-box
- Batteries included - **CLI** for working with message catalogs
  (extracting, validating, compiling, …)
- Easy to migrate from react-intl

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
  
Big thanks goes to these people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars1.githubusercontent.com/u/827862?v=3" width="100px;"/><br /><sub><b>Tomáš Ehrlich</b></sub>](http://www.tomasehrlich.cz)<br />[💻](https://github.com/lingui/js-lingui/commits?author=tricoder42 "Code") [📖](https://github.com/lingui/js-lingui/commits?author=tricoder42 "Documentation") [💡](#example-tricoder42 "Examples") [✅](#tutorial-tricoder42 "Tutorials") | [<img src="https://avatars1.githubusercontent.com/u/3697116?v=3" width="100px;"/><br /><sub><b>Josef Hornych</b></sub>](https://github.com/Peping)<br />[📖](https://github.com/lingui/js-lingui/commits?author=Peping "Documentation") [🐛](https://github.com/lingui/js-lingui/issues?q=author%3APeping "Bug reports") | [<img src="https://avatars2.githubusercontent.com/u/307006?v=3" width="100px;"/><br /><sub><b>Christian Kaps</b></sub>](https://www.silhouette.rocks)<br />[🐛](https://github.com/lingui/js-lingui/issues?q=author%3Aakkie "Bug reports") | [<img src="https://avatars0.githubusercontent.com/u/2085291?v=3" width="100px;"/><br /><sub><b>brunesto</b></sub>](https://github.com/brunesto)<br />[💻](https://github.com/lingui/js-lingui/commits?author=brunesto "Code") [🐛](https://github.com/lingui/js-lingui/issues?q=author%3Abrunesto "Bug reports") | [<img src="https://avatars0.githubusercontent.com/u/614768?v=3" width="100px;"/><br /><sub><b>David Furlong</b></sub>](https://davidfurlong.github.io/)<br />[💬](#question-davidfurlong "Answering Questions") | [<img src="https://avatars2.githubusercontent.com/u/1416801?v=4" width="100px;"/><br /><sub><b>Thibaut</b></sub>](http://thibaut.re)<br />[🐛](https://github.com/lingui/js-lingui/issues?q=author%3AthibautRe "Bug reports") [📖](https://github.com/lingui/js-lingui/commits?author=thibautRe "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/2965120?v=4" width="100px;"/><br /><sub><b>Sebastian Sobociński</b></sub>](https://github.com/hiddenboox)<br />[💻](https://github.com/lingui/js-lingui/commits?author=hiddenboox "Code") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars2.githubusercontent.com/u/296106?v=4" width="100px;"/><br /><sub><b>Matt Labrum</b></sub>](https://github.com/mlabrum)<br />[📖](https://github.com/lingui/js-lingui/commits?author=mlabrum "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/1098399?v=4" width="100px;"/><br /><sub><b>Vincent Ricard</b></sub>](https://github.com/ghostd)<br />[📖](https://github.com/lingui/js-lingui/commits?author=ghostd "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/2378900?v=4" width="100px;"/><br /><sub><b>Adam Gruber</b></sub>](https://github.com/adamgruber)<br />[💻](https://github.com/lingui/js-lingui/commits?author=adamgruber "Code") | [<img src="https://avatars1.githubusercontent.com/u/1268629?v=4" width="100px;"/><br /><sub><b>Spencer Mefford</b></sub>](https://github.com/spencermefford)<br />[💻](https://github.com/lingui/js-lingui/commits?author=spencermefford "Code") | [<img src="https://avatars2.githubusercontent.com/u/1448788?v=4" width="100px;"/><br /><sub><b>Jeow Li Huan</b></sub>](https://github.com/huan086)<br />[💻](https://github.com/lingui/js-lingui/commits?author=huan086 "Code") | [<img src="https://avatars1.githubusercontent.com/u/1566403?v=4" width="100px;"/><br /><sub><b>Vojtech Novak</b></sub>](https://github.com/vonovak)<br />[📖](https://github.com/lingui/js-lingui/commits?author=vonovak "Documentation") |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.

## License

The project is licensed under the [MIT][License] license.

[ReactIntl]: https://github.com/yahoo/react-intl
[Documentation]: https://lingui.github.io/js-lingui/
[TutorialReact]: https://lingui.github.io/js-lingui/tutorials/react.html
[TutorialReactNative]: https://lingui.github.io/js-lingui/tutorials/react-native.html
[TutorialJavaScript]: https://lingui.github.io/js-lingui/tutorials/javascript.html
[TutorialCLI]: https://lingui.github.io/js-lingui/tutorials/cli.html

[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors

[Badge-CI]: https://img.shields.io/circleci/project/github/lingui/js-lingui/master.svg
[Badge-AppVeyor]: https://ci.appveyor.com/api/projects/status/0wjdm3qofrjo2c4n/branch/master?svg=true
[Badge-Coverage]: https://img.shields.io/codecov/c/github/lingui/js-lingui/master.svg
[Badge-Watch]: https://img.shields.io/github/watchers/lingui/js-lingui.svg?style=social&label=Watch
[Badge-Stars]: https://img.shields.io/github/stars/lingui/js-lingui.svg?style=social&label=Stars
[Badge-Twitter]: https://img.shields.io/twitter/url/https/github.com/lingui/js-lingui.svg?style=social
[Badge-PRWelcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square

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
