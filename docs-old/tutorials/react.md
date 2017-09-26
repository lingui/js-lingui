# Tutorial: Internationalization in React

This tutorial covers all steps required to translate a [React][React] application
in multiple languages.

Sample code is available in [tutorial-lingui-react][TutorialLinguiReact] repository.

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
into phrases and go through them separately:

### Plural

[Plural][Plural] is first weird looking component.
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

Languages are specified as ISO country codes.

Now we're ready to extract messages:

```bash
$ lingui extract
```

We see that we have 4 messages in total and all are untranslated. Let's open
English file and take a look at message format:

```js
{
  "Message Inbox": {
    "translation": "",
    "origin": [...]
  },
  "See all <0>unread messages</0> or <1>mark them</1> as read.": {
    "translation": "",
    "origin": [...]
  },
  "{messagesCount, plural, one {There's {messagesCount} message in your inbox.} other {There're {messagesCount} messages in your inbox.}}": {
    "translation": "",
    "origin": [...]
  },
  "Last login on {lastLogin, date}": {
    "translation": "",
    "origin": [...]
  }
}
```

The content or `origin` attributes is truncated in example above. It tells
us from where the message was extracted.

As I said, we're going to have a short break now, because we'll send Czech
message catalog to our translator. They'll do their job and send us translations.

## Loading translated messages

Alright, translator just sent us finished translations:

```json
{
  "Message Inbox": {
    "translation": "Příchozí zprávy",
    "origin": [...]
  },
  "See all <0>unread messages</0> or <1>mark them</1> as read.": {
    "translation": "Přejít na <0>nepřečtené zprávy</0> nebo je <1>označit</1> jako přečtené",
    "origin": [...]
  },
  "{messagesCount, plural, one {There's {messagesCount} message in your inbox.} other {There're {messagesCount} messages in your inbox.}}": {
    "translation": "{messagesCount, plural, one {V příchozí poště je {messagesCount} zpráva.} few {V příchozí poště jsou {messagesCount} zprávy.} other {V příchozí poště je {messagesCount} zpráv.}}",
    "origin": [...]
  },
  "Last login on {lastLogin, date}": {
    "translation": "Poslední přihlášení {lastLogin, date}",
    "origin": [...]
  }
}
```

You probably don't understand half of it, but it doesn't matter. Just copy-paste
it instead the original `locale/cs/messages.json`.

Now we need to compile it. This step is necessary in production, otherwise
message formatting won't work:

```bash
$ lingui compile
```


## Variations

This library is very flexible and doesn't try to force you into anything. Here
are two most common variations that you might choose.

### Using custom message IDs

Some people prefer using custom message IDs instead of auto-generated ones,
like `msg.hello` or `Inbox.heading`. It's possible to do it with `lingui-react` 
too! Just pass `id` prop to [Trans][Trans] components:

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
  "Inbox.heading": {
    "translation": "",
    "defaults": "Message Inbox",
  }
  "Inbox.unreadMessages": {
    "translation": "",
    "defaults": "See all <0>unread messages</0> or <1>mark them</1> as read.",
  }
  "Inbox.totalMessages": {
    "translation": "",
    "defaults": "{messagesCount, plural, one {There's {messagesCount} message in your inbox.} other {There're {messagesCount} messages in your inbox.}}"
  },
  "Inbox.lastLogin": {
    "translation": "",
    "defaults": "Last login on {lastLogin, date}"
  }
}
```

This approach has it's pros and cons and opinios differs. Important is 
that `jsLingui` supports both ways and it's up to developers to choose what 
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

You still might encouter some problem when using `lingui extract`. These
problems are described in guide about [intergrations][Integrations].
TL;DR: Most boilerplates hard-code babel config to webpack. It's impossible
to read & extend these config from external tools. All you need to do is
copy-paste config to `.babelrc`, which is the stardard location recommended
by Babel itself.

You may ask if we can't do it without plugin during runtime. Unfortunatelly, no.
First, the performance would be really terrible. Second, but more important reason,
we would have to include MessageFormat parser into our production bundle, which
is really big dependency.

**Note**: In the example above, if you don't want to use custom IDs, simply replace
 `id` with `defaults`, like this:
 
 ```js
 // Instead of
 <Trans id="Inbox.header" defaults="Message Inbox" />
 
 // … it's possible to use source language as message ID
 <Trans id="Message Inbox" />
```

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
[Integrations]: ../guides/integrations.html
[TutorialLinguiReact]: https://github.com/lingui/tutorial-lingui-react
