# Tutorial: Internationalization in React

This tutorial covers all steps required to translate a [React][React] application
in multiple languages.

Sample code is available in [tutorial-lingui-react][TutorialLinguiReact] repository.

## Starting point

We are going to translate following app:

```jsx
// index.js
import React from 'react'
import { render } from 'react-dom'
import Inbox from './Inbox.js'

const App = () => <Inbox />

render(<App />, document.getElementById('app'))
```

```jsx
// Inbox.js
import React from 'react'

const Inbox = ({ messages, markAsRead, user }) => {
  const messagesCount = messages.length
  const { name, lastLogin } = user
  
  return (
      <div>
        <h1>Message Inbox</h1>
        
        <p>
          See all <Link to="/unread">unread messages</Link>{" or "}
          <a onClick={markAsRead}>mark them</a> as read.
        </p>
        
        <p>
          {
            messagesCount === 1
              ? There's {messagesCount} message in your inbox.
              : There're {messagesCount} messages in your inbox.
          }
        </p>
        
        <footer>
          Last login on {lastLogin}.
        </footer>
      </div>
    )
}

export default Inbox
```

It's pretty basic app which doesn't do anything special.

## Install dependencies and configure Babel

`js-lingui` isn't solo library. It's actually set of tools which helps you
with internationalization. You can pick which one you want to use in your project.
We're going to use all of them to show off the full power of js-lingui.

Three major packages we're going to use are:

- `lingui-react` - React components for translating and formatting messages
- `babel-preset-lingui-react` - Transform messages wrapped in components from 
  `lingui-react` to ICU MessageFormat and validates them
- `lingui-cli` - CLI for working with message catalogs

1. Install `babel-preset-lingui-react` as development dependency, `lingui-react` as a runtime dependency and `lingui-cli` globally:

    ```bash
yarn global add lingui-cli
yarn add lingui-react
yarn add --dev babel-preset-lingui-react
# npm install --save-dev babel-preset-lingui-react
    ```  
    
    or using `npm`:
    
    ```bash
npm install -g lingui-cli
npm install --save lingui-react
npm install --save-dev babel-preset-lingui-react
    ```  
    
    **Note**: If you can't use babel preset, see the example at the end of this tutorial.

2. Add `lingui-react` preset to Babel config:

    ```js
// .babelrc
{
  "presets": [
    "env",
    "react",
    "lingui-react"
  ]
}
    ```
  
We have the environment up and running and we can start internationalize our app!

## Setup application

I would like to jump directly to translation of `Inbox` component, but we need
to do one more step to setup our application.

Since we're going to translate our application, components needs to be aware
of active language. The top-most component which takes care of this is
[I18nProvider][I18nProvider]. In development we're also going to need
some more *stuff*. Don't worry about it now. It will be explained later.

Add all required imports and wrap our app inside [I18nProvider][I18nProvider].

```jsx
// index.js
import React from 'react'
import { render } from 'react-dom'
import Inbox from './Inbox.js'

import { I18nProvider } from 'lingui-react'
// required in development only (huge dependency)
const dev = process.env.NODE_ENV !== 'production' ? require('lingui-i18n/dev') : undefined

const App = () => (
  <I18nProvider language="en" development={dev}>
    <Inbox />
  </I18nProvider>
)

render(<App />, document.getElementById('app'))
```

I know, the development import looks ugly! But we're doing this for a greater
good, saving a lot of bandwidth data.

💡  You might be wondering: how are we going to change active language?  🤔
Yes, that's a great question, but we need to focus! We're not going to change
a language unless we have translated message catalog. And we won't have
translated catalog before we extract all messages from source.

Moreover, it depends how our application is implemented. If you want to take a
short detour, take a look at example with webpack and redux:
[Guide - Dynamic loading of languages in Webpack][GuideWebpackDynamicLoading]

## Introducing the internationalization

Now we're finally going to *translate* our app. Actually, we're not going
to *translate* from one language to another right now. Instead, we're going to
*prepare* our app for being translated. This process is called
*internationalization* and you should practice saying this word alound until
you're able to say it three times very quickly.

Looking at heading and first paragraph in `Inbox`, all we need is wrap the text 
inside [Trans][Trans] and [Plural][Plural] component:

```jsx
// Inbox.js
import React from 'react'
import { Trans, Plural, DateFormat } from 'lingui-react'

const Inbox = ({ messages, markAsRead, user }) => {
  const messagesCount = messages.length
  const { name, lastLogin } = user
  
  return (
      <div>
        <h1><Trans>Message Inbox</Trans></h1>
        
        <p>
          <Trans>
            See all <Link to="/unread">unread messages</Link>{" or "}
            <a onClick={markAsRead}>mark them</a> as read.
          </Trans>
        </p>
        
        <p>
          <Plural 
            value={messagesCount}
            one={`There's ${messagesCount} message in your inbox.`}
            other={`There're ${messagesCount} messages in your inbox.`}
          />
        </p>
        
        <footer>
          <Trans>Last login on <DateFormat value={lastLogin} />.</Trans>
        </footer>
      </div>
    )
}

export default Inbox
```

Wait a second, somebody skipped three pages at once! Let's break the example above
into phrases and go through the separately:

### Simple translations

Heading is very simple, just a text. I guess that's the only part where no
explanation is needed. We just wrap it in [Trans][Trans] component and it
takes care of everything else.

### Components and HTML inside translations

Next message is a bit tricky. We're writing hyper-text which very often includes formatting,
so soon or later we'll need to translate message with components inside.

As tricky as it could be in other i18n libraries, all we need here is wrap everything
inside [Trans][Trans] component again.

### Plural

[Plural][Plural] is first weird looking component. We had one message and now
two?! Except the original `Input` would display this when there's only 1 message:

`There're 1 messages in your inbox`

This phrase has different *singular* and *plural* form. [Plural][Plural] component
selects the right plural form based on active language and `value`. It may sound
strange, but some languages have more that one plural form, e.g: in czech we have
two. Some languages have even more! That's why simple `count === 1 ? singular : plural`
won't save us.

### Date formatting

Last example has date formatting in it. Not only that we speak differently, we
also format our dates and numbers differently! All these little details need to
be take in account when we're internationalizing applications.

## Extracting messages from source

This was pretty intense, so we'll take a little break. But before we do that,
we'll prepare so called message catalog for translators.

Message catalog is a dictionary where keys are messages in source language
and values are translated messages in target language. We usually have one
message catalog per language.

We're not going to write it by hand. We have a handy CLI tool which will extract
messages from source files for us. First we need to add all languages including
the source one (English in our case):

```bash
# Add English and Czech language
$ lingui add-locale en cs 
```

Languages are specified ad ISO country codes.

Now we're ready to extract messages:

```bash
$ lingui extract
```

We see that we have 4 messages in total and all are untranslated. Let's open
English file and take a look at message format:

```js
{
  "Message Inbox": "",
  "See all <0>unread messages</0> or <1>mark them</1> as read.": "",
  "{messagesCount, plural, one {There's {messagesCount} message in your inbox.} other {There're {messagesCount} messages in your inbox.}}": "",
  "Last login on {lastLogin, date}": ""
}
```

This is ICU Message Format. It's very powerful and extensible. It's bit difficult
to write by hand (especially for complex cases like plurals), but that's the
reason why we use babel preset - we use React components as we're used to
and babel preset generates Message Format for us.

Also, you may notice that components and html tags are replaced with indexed
tags (`<0>`, `<1>`). This is a little extension to ICU MessageFormat which
allows rich-text formatting inside translations. Components and their props 
remains in the source code and doesn't scare our translators. Also, in case we 
change just a className, we don't need to update
our message catalogs. How cool is that?

As I said, we're going to have a short break now, because we'll send Czech
message catalog to our translator. They'll do their job and send us translations.

## Loading translated messages

Alright, translator just sent us finished translations:

```js
{
  "Message Inbox": "Příchozí zprávy",
  "See all <0>unread messages</0> or <1>mark them</1> as read.": "Přejít na <0>nepřečtené zprávy</0> nebo je <1>označit</1> jako přečtené",
  "{messagesCount, plural, one {There's {messagesCount} message in your inbox.} other {There're {messagesCount} messages in your inbox.}}": 
  "{messagesCount, plural, one {V příchozí poště je {messagesCount} zpráva.} few {V příchozí poště jsou {messagesCount} zprávy.} other {V příchozí poště je {messagesCount} zpráv.}}",
  "Last login on {lastLogin, date}": "Poslední přihlášení {lastLogin, date}"
}
```

You probably don't understand half of it, but it doesn't matter. Just copy-paste
it instead the original `locale/cs/messages.json`.

Now we need to compile it:

```bash
$ lingui compile
```

If you look into `locale` directory now, you'see two files for each language:

- `messages.json` - readable JSON with all languages and metadata (for translators)
- `messages.js` - minified JS file with compiled messages (for library)

Finally, we import compiled JS catalog into our app and pass it to [I18nProvider][I18nProvider].

```jsx
// index.js
import React from 'react'
import { render } from 'react-dom'
import Inbox from './Inbox.js'

import { I18nProvider } from 'lingui-react'
// required in development only (huge dependency)
const dev = process.env.NODE_ENV !== 'production' ? require('lingui-i18n/dev') : undefined

import { unpackCatalog } from 'lingui-i18n'
import catalog from 'locale/cs/messages.js'

const App = () => (
  <I18nProvider language="cs" catalogs={{ cs: unpackCatalog(catalog) }} development={dev}>
    <Inbox />
  </I18nProvider>
)

render(<App />, document.getElementById('app'))
```

`catalogs` prop expects a dictionary of message catalogs in *all* languages,
but we can load them on demand. Again, this depends on environment. There's
an example [how to do it with webpack][GuideWebpackDynamicLoading].

## Variations

This library is very flexible and doesn't try to force you into anything. Here
are two most common variations that you might choose.

### Using custom message IDs

Some people prefer using custom message IDs instead of auto-generated ones,
like `msg.hello` or `Inbox.heading`. It's possible to do it with `lingui-react` 
too! Just pass `id` prop to [Trans][Trans] components. Other i18n components
must be wrapped inside [Trans][Trans] component too:

```jsx
// Inbox.js
import React from 'react'
import { Trans, Plural, DateFormat } from 'lingui-react'

const Inbox = ({ messages, markAsRead, user }) => {
  const messagesCount = messages.length
  const { name, lastLogin } = user
  
  return (
      <div>
        <h1><Trans id="Inbox.header">Message Inbox</Trans></h1>
        
        <p>
          <Trans id="Inbox.unreadMessages">
            See all <Link to="/unread">unread messages</Link>{" or "}
            <a onClick={markAsRead}>mark them</a> as read.
          </Trans>
        </p>
        
        <p>
          <Plural 
            id="Inbox.totalMessages"
            value={messagesCount}
            one={`There's ${messagesCount} message in your inbox.`}
            other={`There're ${messagesCount} messages in your inbox.`}
          />
        </p>
        
        <footer>
          <Trans id="Inbox.lastLogin">Last login on <DateFormat value={lastLogin} />.</Trans>
        </footer>
      </div>
    )
}

export default Inbox
```

When we extract messages now, the catalog is going to look like this:

```js
{
  "Inbox.heading": "Message Inbox",
  "Inbox.unreadMessages": "See all <0>unread messages</0> or <1>mark them</1> as read.",
  "Inbox.totalMessages": "{messagesCount, plural, one {There's {messagesCount} message in your inbox.} other {There're {messagesCount} messages in your inbox.}}",
  "Inbox.lastLogin": "Last login on {lastLogin, date}"
}
```

This approach has it's pros and cons and opinios differs. Important is 
that `js-lingui` supports both ways and it's up to developers to choose what 
they prefer.

### Without babel preset

If you can't add presets to babel configuration (hello Create React App users 👋),
you can still use this library! You just need to do the work by yourself:

```jsx
// Inbox.js
import React from 'react'
import { Trans } from 'lingui-react'

const Inbox = ({ messages, markAsRead, user }) => {
  const messagesCount = messages.length
  const { name, lastLogin } = user
  
  return (
      <div>
        <h1><Trans id="Inbox.header" defaults="Message Inbox" /></h1>
        
        <p>
          <Trans 
            id="Inbox.unreadMessages" 
            defaults="See all <0>unread messages</0> or <1>mark them</1> as read." 
            components={[
              <Link to="/unread" />,
              <a onClick={markAsRead} />
            ]}
          />
        </p>
        
        <p>
          <Trans 
            id="Inbox.totalMessages"
            defaults="{messagesCount, plural, one {There's {messagesCount} message in your inbox.} other {There're {messagesCount} messages in your inbox.}}"
            values={{ messagesCount }}
          />
        </p>
        
        <footer>
          <Trans id="Inbox.lastLogin" defaults="Last login on {lastLogin, date}" />
        </footer>
      </div>
    )
}

export default Inbox
```

This is how the source code looks like when processed with `babel-preset-lingui-react`.
As you can see, in simple cases it's about the same. However, in complex cases
like plurals, it's less readable and error-prone. Babel preset also validates
MessageFormat so it's almost impossible to make any error.

Good think is, that `lingui extract` doesn't require you to change babel config,
so you can still use it for extracting of messages.

You may ask if we can't do it without plugin during runtime. Unfortunatelly, no.
First, the performance would be really terrible. Second, but more important reason,
we would have to include MessageFormat parser into our production bundle, which
is really big dependency.

**Note**: In the example above, if you don't want to use custom IDs, simply replace
 `id` with `defaults`, like this: `<Trans id="Message Inbox" />`.

## Going down the rabbit hole

This was very quick introduction how to use `lingui-react`. For more information,
take a look at [reference][ReferenceReact] documentation.

Follow up links:

- [All code samples from this tutorial][TutorialLinguiReact]
- [Reference: lingui-react API][ReferenceReact]
- [Guide: Dynamic loading of languages with Webpack][GuideWebpackDynamicLoading]

[react]: https://facebook.github.io/react/ "React, A javascript library for building user interfaces"
[cldrPlurals]: http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html

[I18nProvider]: ../ref/react.html#i18nprovider
[withI18n]: ../ref/react.html#withi18n
[Trans]: ../ref/react.html#trans
[Plural]: ../ref/react.html#plural
[NumberFormat]: ../ref/react.html#numberformat
[DateFormat]: ../ref/react.html#dateformat
[ReferenceReact]: ../ref/react.html
[GuideWebpackDynamicLoading]: ../guides/webpack-dynamic-loading.html "Dynamic loading of languages in Webpack"
[TutorialLinguiReact]: https://github.com/lingui/tutorial-lingui-react
