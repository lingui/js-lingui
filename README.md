<div align="center">
<h1><sub>js</sub>Lingui</h1>

Seamless internationalization in Javascript and React
</div>

<hr />

[![Join the chat at https://gitter.im/lingui/js-lingui](https://badges.gitter.im/lingui/js-lingui.svg)](https://gitter.im/lingui/js-lingui?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![CircleCI][Badge-CI]][CI] 
[![Code Coverage][Badge-Coverage]][Coverage]
[![PRs Welcome][Badge-PRWelcome]][PRWelcome]
[![All Contributors](https://img.shields.io/badge/all_contributors-10-orange.svg?style=flat-square)](#contributors)
[![MIT License][Badge-License]][LICENSE]

[![Watch on GitHub][Badge-Watch]][Watch]
[![Star on GitHub][Badge-Stars]][Star]
[![Tweet][Badge-Twitter]][Twitter]

**📖 [Documentation][Documentation]**

**📦 [Migrating to 2.x](https://lingui.github.io/js-lingui/releases/migration-2.html)**

Type-checked and intuitive way to internationalize applications in Javascript 
and React.

> Internationalization is the design and development of a product, application or document content that enables easy localization for target audiences that vary in culture, region, or language.
>
> --- [ W3C Web Internationalization FAQ](https://www.w3.org/International/questions/qa-i18n)

## Key features

- Small and fast - about **6kb gzipped**
- Babel plugin for convenient, **type-checked** way of writing ICU MessageFormat (recommended, but not required)
- **CLI** for extracting and compiling message catalogs
- Built on standard **ICU MessageFormat** (is able to replace [react-intl][ReactIntl] completely)
  - Variable interpolation
  - Components inside translations (e.g: `Read <Link to="...">documentation</Link>.`)
  - Plurals, Ordinals and Categories (i.e. Select)
  - Number and Date formats (from Intl)
- Works with manual and generated message IDs
- Works with in any JS environment, while integration packages brings better performance in target environments (e.g: `lingui-react` for React)
- High quality build (high test coverage, follows semver, deprecation warnings for breaking changes and migration guides for major releases)

See the [tutorial for React][TutorialReact]

![Example use case with React](https://lingui.github.io/js-lingui/_static/lingui-pitch.png)

### Intuitive way of writing messages

No matter what i18n library you use, there is always an underlying message
format that handles variable interpolation, plurals and date/number formatting. 
`js-lingui` isn't reinventing the wheel, but rather uses standardized 
**ICU MessageFormat** which is supported in many platforms (the same format
that [react-intl][ReactIntl] uses).

`js-lingui` goes one step further and allows you to write messages in a way
so intuitive that you'll forget there's an underlying i18n library. 

Compare following examples of low-level API and convenient functions/components: 

Instead of:

```js
i18n._(
  'Hello, my name is {name}', 
  { name }
)
```

… you simply write:

```js
i18n.t`Hello, my name is ${name}`
```

---

Complex plural rules:

```js
i18n._(
  `{numBooks, plural, 
    one {{name} has # book} 
    other {{name} has # books}}`, 
  { name, numBooks }
)
```

… becomes readable and type-checked:

```js
i18n.plural({ 
  value: numBooks, 
  one: `${name} # book`, 
  other: `${name} # books`
})
```

---

The same message in React:

```jsx
<Trans id="msg.simple" defaults="Hello {name}" values={{ name }} />
```

… becomes:

```jsx
<Trans id="msg.simple">Hello {name}</Trans>
````

---

Components inside translations:

```jsx 
<Trans 
    id="msg.link" 
    defaults="Read the <0>documentation</0>."
    components={[<Link to="/docs" />]}
/>
```

… works seamlessly:

```jsx
<Trans id="msg.link">
  Read the <Link to="/docs">documentation</Link>.
</Trans>
```

---

Messages with plurals:

```jsx
<Trans 
    id="msg.plural" 
    defaults="{numBooks, plural, one{{name} has # book} other{{name} has # books}}"
    values={{ numBooks }}
/>
```

… are type-checked and errorproof:

```jsx
<Plural 
  id="msg.plural"
  value={numBooks}
  one={<Trans>{name} has # book</Trans>}
  other={<Trans>{name} has # books</Trans>}
/>
```

---

**Note**: In examples above, the first example is low-level API which you can use
when babel plugin isn't available (e.g. in Create React Apps). However, you'll
miss another layer of validation and type-checking for messages.

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
      one={{name} has # book}
      other={{name} has # books}
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
Extracting messages from source files…
Collecting all messages…
Writing message catalogues…
Messages extracted!

Catalog statistics:
┌──────────┬─────────────┬─────────┐
│ Language │ Total count │ Missing │
├──────────┼─────────────┼─────────┤
│ cs       │     42      │   34    │
│ en       │     42      │   42    │
│ fr       │     42      │   42    │
└──────────┴─────────────┴─────────┘

(use "lingui add-locale <language>" to add more locales)
(use "lingui extract" to update catalogs with new messages)
(use "lingui compile" to compile catalogs for production)
```

If you run this command second time, it'll merge translations from existing
catalog with new messages.

### Works with manual and generated message IDs

`js-lingui` doesn't force you to use generated message IDs either. If you prefer
setting your IDs manually, just pass `id` prop. Generated message will be used
as a default one:

```jsx
<Plural 
  id="msg.plural"
  value={numBooks}
  one={{name} has # book}
  other={{name} has # books}
/>
```

### Works anywhere

Core library `@lingui/core` works in any JS environment. Integration libraries
like `@lingui/react` only brings better performance for target environments.

## Contributors

Thanks goes to these people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars1.githubusercontent.com/u/827862?v=3" width="100px;"/><br /><sub><b>Tomáš Ehrlich</b></sub>](http://www.tomasehrlich.cz)<br />[💻](https://github.com/lingui/js-lingui/commits?author=tricoder42 "Code") [📖](https://github.com/lingui/js-lingui/commits?author=tricoder42 "Documentation") [💡](#example-tricoder42 "Examples") [✅](#tutorial-tricoder42 "Tutorials") | [<img src="https://avatars1.githubusercontent.com/u/3697116?v=3" width="100px;"/><br /><sub><b>Josef Hornych</b></sub>](https://github.com/Peping)<br />[📖](https://github.com/lingui/js-lingui/commits?author=Peping "Documentation") [🐛](https://github.com/lingui/js-lingui/issues?q=author%3APeping "Bug reports") | [<img src="https://avatars2.githubusercontent.com/u/307006?v=3" width="100px;"/><br /><sub><b>Christian Kaps</b></sub>](https://www.silhouette.rocks)<br />[🐛](https://github.com/lingui/js-lingui/issues?q=author%3Aakkie "Bug reports") | [<img src="https://avatars0.githubusercontent.com/u/2085291?v=3" width="100px;"/><br /><sub><b>brunesto</b></sub>](https://github.com/brunesto)<br />[💻](https://github.com/lingui/js-lingui/commits?author=brunesto "Code") [🐛](https://github.com/lingui/js-lingui/issues?q=author%3Abrunesto "Bug reports") | [<img src="https://avatars0.githubusercontent.com/u/614768?v=3" width="100px;"/><br /><sub><b>David Furlong</b></sub>](https://davidfurlong.github.io/)<br />[💬](#question-davidfurlong "Answering Questions") | [<img src="https://avatars2.githubusercontent.com/u/1416801?v=4" width="100px;"/><br /><sub><b>Thibaut</b></sub>](http://thibaut.re)<br />[🐛](https://github.com/lingui/js-lingui/issues?q=author%3AthibautRe "Bug reports") [📖](https://github.com/lingui/js-lingui/commits?author=thibautRe "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/2965120?v=4" width="100px;"/><br /><sub><b>Sebastian Sobociński</b></sub>](https://github.com/hiddenboox)<br />[💻](https://github.com/lingui/js-lingui/commits?author=hiddenboox "Code") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars2.githubusercontent.com/u/296106?v=4" width="100px;"/><br /><sub><b>Matt Labrum</b></sub>](https://github.com/mlabrum)<br />[📖](https://github.com/lingui/js-lingui/commits?author=mlabrum "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/1098399?v=4" width="100px;"/><br /><sub><b>Vincent Ricard</b></sub>](https://github.com/ghostd)<br />[📖](https://github.com/lingui/js-lingui/commits?author=ghostd "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/2378900?v=4" width="100px;"/><br /><sub><b>Adam Gruber</b></sub>](https://github.com/adamgruber)<br />[💻](https://github.com/lingui/js-lingui/commits?author=adamgruber "Code") |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.
Contributions of any kind welcome!

## License

[MIT][License]

[ReactIntl]: https://github.com/yahoo/react-intl
[Documentation]: https://lingui.github.io/js-lingui/
[TutorialReact]: https://lingui.github.io/js-lingui/tutorials/react.html

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
[License]: https://github.com/lingui/js-lingui/blob/master/LICENSE
[Watch]: https://github.com/lingui/js-lingui/watchers
[Star]: https://github.com/lingui/js-lingui/stargazers
[Twitter]: https://twitter.com/intent/tweet?text=Check%20out%20js-lingui!%20https://github.com/lingui/js-lingui%20%F0%9F%91%8D
[PRWelcome]: http://makeapullrequest.com

[Badge-CodeSponsor]: https://app.codesponsor.io/embed/84LZA8as5bkg57cgKMJZMe75/lingui/js-lingui.svg
[CodeSponsor]: https://app.codesponsor.io/link/84LZA8as5bkg57cgKMJZMe75/lingui/js-lingui
