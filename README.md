| Branch | master | next |
| ---: | :---: | :---: |
| Build Status | [![CircleCI](https://circleci.com/gh/lingui/js-lingui/tree/master.svg?style=svg)](https://circleci.com/gh/lingui/js-lingui/tree/master) | [![CircleCI](https://circleci.com/gh/lingui/js-lingui/tree/next.svg?style=svg)](https://circleci.com/gh/lingui/js-lingui/tree/next) |

**📖 [Documentation][Documentation]**

# Lingui - tools for ~~internationalization~~ i18n in javascript

Type-checked and intuitive way to internationalize applications in Javascript 
and ReactJS.

> Internationalization is the design and development of a product, application or document content that enables easy localization for target audiences that vary in culture, region, or language.
>
> --- [ W3C Web Internationalization FAQ](https://www.w3.org/International/questions/qa-i18n)

## Key features

- Small and fast - about 6kb gzipped (no hacks with `webpack.IgnorePlugin` required, no message parsing in production)
- Babel plugin for convenient, type-checked way of writing ICU MessageSyntax (recommended, but not required)
- CLI for working with message catalogs (extracting, merging, compiling)
- Built on standard ICU MessageFormat (might replace [react-intl][ReactIntl] completely)
  - Variable interpolation
  - Components inside translations (e.g: `Read <Link to="...">documentation</Link>.`)
  - Plurals, Ordinals and Categories (i.e. Select)
  - Number and Date formats (from Intl)
- Works with manual and generated message IDs
- Works with in any JS environment, while integration packages brings better performance in target environments (e.g: `lingui-react` for React)
- High quality build (high test coverage, follows semver, deprecation warnings for breaking changes and migration guides for major releases)

See the [tutorial for React]()

![Example use case with React](https://lingui.gitbooks.io/js/assets/lingui-pitch.png)

### Intuitive way of writing messages

No matter what i18n library you use, there is always an underlying message
format that handles variable interpolation, plurals and custom format. 
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
$ lingui extract
```

```
📖  Writing message catalogues:
Writing locales/cs/messages.json
Writing locales/en/messages.json

📈  Catalog statistics:
┌──────────┬─────────────┬─────────┐
│ Language │ Total count │ Missing │
├──────────┼─────────────┼─────────┤
│ cs       │     43      │   11    │
│ en       │     43      │    9    │
└──────────┴─────────────┴─────────┘

Messages extracted!

(use "lingui extract" to update catalogs with new messages)
(use "lingui compile" to compile catalogs for production)
✨  Done!
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

```jsx harmony
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

## License

[MIT](./LICENSE.md)

[ReactIntl]: https://github.com/yahoo/react-intl
[Documentation]: https://lingui.gitbooks.io/js/
[TutorialReact]: https://lingui.gitbooks.io/js/tutorials/react.html
