Migrationg guide from 0.x to 1.x
================================

Even though only few projects use `js-lingui` at the moment, this guide is
trying to setup high quality migration path in project.

## Babel plugins

Formatting of the source code shouldn't affect generated messages. 
Both babel plugins from now normalize newlines inside translations.

In Javascript, multiple spaces before and after newline are replaced with
single space, while newlines are removed completely:

```js
i18n.t`
  This message is wrapped
  on multiple
  lines
`

// babel-plugin-lingui-transform-js 0.x
"This message is wrapped\n  on multiple\n  lines"

// babel-plugin-lingui-transform-js 1.x
"This message is wrapped on multiple lines"
```

In React it follow JSX conventions: newlines between text are replaced with
single space, but newlines between components or text and component are
removed and no space is added:

```jsx
<Trans>
  This message is wrapped
  on multiple
  <strong>lines</strong>
</Trans>


// babel-plugin-lingui-transform-react 0.x
"This message is wrapped\n  on multiple\n  <0>lines</0>"

// babel-plugin-lingui-transform-react 1.x
"This message is wrapped on multiple<0>lines</0>"
```

As weird as it is, this is consistent how JSX works. If you need to force
a space at the end of line, add `{" "}`:

```jsx
<Trans>
  Follow the <a>link</a>{" "}
  or go <a>back</a>.
</Trans>

// will result in:
"Follow the <0>link</0> or go <1>back</1>."
```

This change won't break the code, but it's necessary to update message catalogs.

## Javascript API

### I18n constructor replaced with factory function

`I18n` constructor is replaced with `setupI18n` factory function:

```js
import { setupI18n } from 'lingui-i18n'

// lingui-i18n 0.x
const i18n = new I18n(
  language: string, 
  messages: {[language: string]: Messages}
)

// lingui-i18n 1.x
const i18n = setupI18n({
  language: string,
  catalogs?: {
    {[language: string]}: {
      messages: Messages
    }
  },
  development?: Development
})
```

`messages` were also replaced with `catalog`, more info [below](#messages-replaced-with-catalogs).

`lingui-i18n` still exports the default instance of `I18n` class, this
remains unchanged:

```js
import i18n from 'lingui-i18n'
```

### Explicit development mode

The biggest change in first major release is support for compiled message
catalogs. Most i18n libraries parse and compile messages on the fly, 
which makes them heavy and slow. However, compiler is still useful in
development, only now it has to be enabled manually:

```js
import { setupI18n } from 'lingui-i18n'

const dev = process.env.NODE_ENV !== 'production' 
  // this import is required in development only
  ? require('lingui-i18n/dev') 
  : null

const i18n = setupI18n({
  language: 'en',
  development: dev
})
```

Development data include compiler and plural rules for all languages. Both
are very large and unnecessary in production, because `lingui-i18n` 
supports loading of compiled message catalogs.

### Messages replaced with catalogs

Plural rules are removed from library completely, because compiled message
catalogs contain language specific data including plural rules. `messages`
were replaced with `catalogs` to simplify loading all required data:

```js
// lingui-i18n 0.x
type Messages = {
  [source: string]: string
}

type AllMessages = {
  [language: string]: Messages
}

// setupI18n({ messages: AllMessages })
const i18n = setupI18n({
  messages: {
    en: {
      msg: 'Hello'
    }
  }
})

// i18n.load(messages: AllMessages)
i18n.load({
  en: {
    msg: 'Hello'
  }
})


// lingui-i18n 1.x
type Messages = {
  // support both static and compiled messages
  [source: string]: string | Function
}

type Catalog = {
  messages: Messages,
  meta: {
    // required in production
    plurals: Function
  }
}

type Catalogs = {
  [language: string]: Catalog
}

// setupI18n({ catalogs: Catalogs })
const i18n = setupI18n({
  catalogs: {
    en: {
      messages: {
        msg: 'Hello'
      }
    }
  }
})

// i18n.load(catalogs: Catalogs)
i18n.load({
  en: {
    messages: {
      msg: 'Hello'
    }
  }
})
```

More aboat [loading message catalogs]().

## React API

Changes in React API reflects changes in underlying core `lingui-i18n`.

`InjectI18n` was removed and replaced with `WithI18n` decorator. Loading
`InjectI18n` in recent versions of `lingui-react@<1.0.0` raised deprecation
warning in console.

Development data must be loaded explicitely. It works in the same way as in
`lingui-i18n`:

```jsx
import { I18nProvider } from 'lingui-react'

const dev = process.env.NODE_ENV !== 'production' 
  // this import is required in development only
  ? require('lingui-i18n/dev') 
  : null
  
const App = () => {
    <I18nProvider language="en" development={dev}>
        <Content />
    </I18nProvider>
}
```

Also, messages were replaced with catalogs:

```jsx
import { I18nProvider } from 'lingui-react'

const dev = process.env.NODE_ENV !== 'production' 
  // this import is required in development only
  ? require('lingui-i18n/dev') 
  : null
  
const catalog = {
    messages: {
        msg: "Hello"
    }
}
  
const App = () => {
    <I18nProvider language="en" catalogs={{ en: catalog }} development={dev}>
        <Content />
    </I18nProvider>
}
```

## CLI

`lingui export` command now create more complex message catalog, which contain
not only translation, but also default message (if any) and locations from where
the string were extracted.

Running `lingui export` will generate new style catalog while merging translations
from the old one. This process is completely seamless. However, any external
tool must be update to accept new style catalogs.
