<div align="center">
<h1><sub>js</sub>Lingui</h1>

Seamless internationalization in Javascript and React
</div>

<hr />

[![CircleCI][Badge-CI]][CI] 
[![Code Coverage][Badge-Coverage]][Coverage]
[![PRs Welcome][Badge-PRWelcome]][PRWelcome]
[![All Contributors](https://img.shields.io/badge/all_contributors-5-blue.svg?style=flat-square)](#contributors)
[![MIT License][Badge-License]][LICENSE]

[![Watch on GitHub][Badge-Watch]][Watch]
[![Star on GitHub][Badge-Stars]][Star]
[![Tweet][Badge-Twitter]][Twitter]

**📖 [Documentation][Documentation]**

Type-checked and intuitive way to internationalize applications in Javascript 
and React.

> Internationalization is the design and development of a product, application or document content that enables easy localization for target audiences that vary in culture, region, or language.
>
> --- [ W3C Web Internationalization FAQ](https://www.w3.org/International/questions/qa-i18n)

## Key features

- Small and fast - about **6kb gzipped**
- Babel plugin for convenient, **type-checked** way of writing ICU MessageFormat (recommended, but not required)
- **CLI** for extracting and compiling message catalogs
- Built on standard **ICU MessageFormat** (might replace [react-intl][ReactIntl] completely)
  - Variable interpolation
  - Components inside translations (e.g: `Read <Link to="...">documentation</Link>.`)
  - Plurals, Ordinals and Categories (i.e. Select)
  - Number and Date formats (from Intl)
- Works with manual and generated message IDs
- Works with in any JS environment, while integration packages brings better performance in target environments (e.g: `lingui-react` for React)
- High quality build (high test coverage, follows semver, deprecation warnings for breaking changes and migration guides for major releases)

See the [tutorial for React][TutorialReact]

![Example use case with React](https://lingui.gitbooks.io/js/assets/lingui-pitch.png)

### Intuitive way of writing messages

No matter what i18n library you use, there is always an underlying message
format that handles variable interpolation, plurals and date/number formatting. 
`js-lingui` isn't reinventing the wheel, but rather uses standardized 
ICU MessageFormat which is supported in many platforms (the same format
that [react-intl][ReactIntl] uses).

`js-lingui` goes one step further and allows you to write messages in a way
so intuitive that you'll forget there's an underlying i18n library.

```js
const name = 'Arthur'

// Variable interpolation
i18n.t`Hello, my name is ${name}`

// Plurals
const numBooks = 1
i18n.plural({
  value: numBooks,
  one: `${name} has # book`,
  other: `${name} has # books`
})
```

This process is even more intuitive in `react`, if you're using JSX. Just wrap
text in `<Trans>` tag and everything is handled for you - even inline
components just works™:

```js
const Pitch = () => (
  <div>
    // Variable Interpolation
    <Trans id="msg.simple">Hello {name}</Trans>
    
    // Seamless translations with components
    <Trans id="msg.link">
      Read the <Link to="/docs">documentation</Link>.
    </Trans>
    
    // Plurals
    <Plural 
      id="msg.plural"
      value={numBooks}
      one={<Trans>{name} has # book</Trans>}
      other={<Trans>{name} has # books</Trans>}
    />
  </div>
)
```

Message IDs are [optional](#works-with-manual-and-generated-message-ids). 
Without them it's even easier, default messages become message ids:

```js
const Pitch = () => (
  <div>
    // Variable Interpolation
    <Trans>Hello {name}</Trans>
    
    // Seamless translations with components
    <Trans>
      Read the <Link to="/docs">documentation</Link>.
    </Trans>
    
    // Plurals
    <Plural 
      value={numBooks}
      one={<Trans>{name} has # book</Trans>}
      other={<Trans>{name} has # books</Trans>}
    />
  </div>
)
```

### Batteries included - CLI for working with message catalogs

`js-lingui` ships with easy CLI for extracting, merging and compiling of
message catalogs.

All messages from the source files can be extracted with one command:

```bash
lingui extract
```

```
Writing message catalogues:
Writing locales/cs/messages.json
Writing locales/en/messages.json

Catalog statistics:
┌──────────┬─────────────┬─────────┐
│ Language │ Total count │ Missing │
├──────────┼─────────────┼─────────┤
│ cs       │     43      │   11    │
│ en       │     43      │    9    │
└──────────┴─────────────┴─────────┘

Messages extracted!

(use "lingui extract" to update catalogs with new messages)
(use "lingui compile" to compile catalogs for production)
```

If you run this command second time, it'll merge translations from existing
catalog with new messages.

### Works also without babel plugin

If you can't use babel plugin, you'll miss the nice feature of generated messages.
However, if you still want to use this lib because of other reasons (performace),
it's still possible:

```js
// Instead of
i18n.t`Hello, my name is ${name}`

// use i18n._ directly:
i18n._({
  id: 'Hello, my name is {name}',
  values: { name }
})
```

With React:

```js
// Instead of
<Trans>Hello {name}</Trans>;
// Write MessageFormat manually:
<Trans id="Hello {name}" />;
```

This is exactly what babel plugin does. It also validates MessageFormat and
gives you convenient warnings about missing parameters, but if you can't use
babel plugin, you can still use this library and get i18n with superb performace.

### Works with manual and generated message IDs

`js-lingui` doesn't force you to use generated message IDs either. If you prefer
setting your IDs manually, just pass `id` prop. Generated message will be used
as a default one:

```jsx
<Plural 
  id="msg.plural"
  value={numBooks}
  one={<Trans>{name} has # book</Trans>}
  other={<Trans>{name} has # books</Trans>}
/>
```

### Works anywhere

Core library `lingui-i18n` works in any JS environment. Intergration libraries
like `lingui-react` only brings better performace for target environments.

## Contributors

Thanks goes to these people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars1.githubusercontent.com/u/827862?v=3" width="100px;"/><br /><sub>Tomáš Ehrlich</sub>](http://www.tomasehrlich.cz)<br />[💻](https://github.com/lingui/js-lingui/commits?author=tricoder42 "Code") [📖](https://github.com/lingui/js-lingui/commits?author=tricoder42 "Documentation") [💡](#example-tricoder42 "Examples") [✅](#tutorial-tricoder42 "Tutorials") | [<img src="https://avatars1.githubusercontent.com/u/3697116?v=3" width="100px;"/><br /><sub>Josef Hornych</sub>](https://github.com/Peping)<br />[📖](https://github.com/lingui/js-lingui/commits?author=Peping "Documentation") [🐛](https://github.com/lingui/js-lingui/issues?q=author%3APeping "Bug reports") | [<img src="https://avatars2.githubusercontent.com/u/307006?v=3" width="100px;"/><br /><sub>Christian Kaps</sub>](https://www.silhouette.rocks)<br />[🐛](https://github.com/lingui/js-lingui/issues?q=author%3Aakkie "Bug reports") | [<img src="https://avatars0.githubusercontent.com/u/2085291?v=3" width="100px;"/><br /><sub>brunesto</sub>](https://github.com/brunesto)<br />[💻](https://github.com/lingui/js-lingui/commits?author=brunesto "Code") [🐛](https://github.com/lingui/js-lingui/issues?q=author%3Abrunesto "Bug reports") | [<img src="https://avatars0.githubusercontent.com/u/614768?v=3" width="100px;"/><br /><sub>David Furlong</sub>](https://davidfurlong.github.io/)<br />[💬](#question-davidfurlong "Answering Questions") |
| :---: | :---: | :---: | :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.
Contributions of any kind welcome!

## License

[MIT][License]

[ReactIntl]: https://github.com/yahoo/react-intl
[Documentation]: https://lingui.gitbooks.io/js/
[TutorialReact]: https://lingui.gitbooks.io/js/tutorials/react.html

[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors

[Badge-CI]: https://img.shields.io/circleci/project/github/lingui/js-lingui/master.svg
[Badge-Coverage]: https://img.shields.io/codecov/c/github/lingui/js-lingui/master.svg
[Badge-License]: https://img.shields.io/github/license/lingui/js-lingui.svg
[Badge-Watch]: https://img.shields.io/github/watchers/lingui/js-lingui.svg?style=social&label=Watch
[Badge-Stars]: https://img.shields.io/github/stars/lingui/js-lingui.svg?style=social&label=Stars
[Badge-Twitter]: https://img.shields.io/twitter/url/https/github.com/lingui/js-lingui.svg?style=social
[Badge-PRWelcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square

[CI]: https://circleci.com/gh/lingui/js-lingui/tree/master
[Coverage]: https://codecov.io/gh/lingui/js-lingui
[License]: https://github.com/lingui/js-lingui/blob/master/LICENSE.md
[Watch]: https://github.com/lingui/js-lingui/watchers
[Star]: https://github.com/lingui/js-lingui/stargazers
[Twitter]: https://twitter.com/intent/tweet?text=Check%20out%20js-lingui!%20https://github.com/lingui/js-lingui%20%F0%9F%91%8D
[PRWelcome]: http://makeapullrequest.com
