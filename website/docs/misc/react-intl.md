# Comparison with react-intl

[react-intl](https://github.com/yahoo/react-intl) is definitely the most popular and widely-used i18n library for React. [LinguiJS](https://github.com/lingui/js-lingui) is in many ways very similar: both libraries use the same syntax for messages (ICU MessageFormat) and they also have very similar API.

Here's an example from [react-intl](https://github.com/yahoo/react-intl) docs:

``` jsx
<FormattedMessage
   id="welcome"
   defaultMessage={`Hello {name}, you have {unreadCount, number} {unreadCount, plural,
     one {message}
     other {messages}
   }`}
   values={{name: <b>{name}</b>, unreadCount}}
 />
```

Looking at the low-level API of [LinguiJS](https://github.com/lingui/js-lingui), there isn't much difference:

``` jsx
<Trans
   id="welcome"
   message={`Hello {name}, you have {unreadCount, number} {unreadCount, plural,
     one {message}
     other {messages}
   }`}
   values={{name: <b>{name}</b>, unreadCount}}
 />
```

There's really no reason to reinvent the wheel when both libs are build on top of the same message syntax. The story doesn't end here, though.

## Translations with rich-text markup

Suppose we have the following text:

``` html
<p>Read the <a href="/docs">documentation</a>.</p>
```

In [react-intl](https://github.com/yahoo/react-intl), this would be translated as:

``` jsx
<FormattedMessage
    id='msg.docs'
    defaultMessage='Read the <link>documentation</link>.'
    values={{
        link: (...chunks) => <a href="/docs">{chunks}</a>
    }}
/>
```

[LinguiJS](https://github.com/lingui/js-lingui) extends ICU MessageFormat with tags. The example above would be:

``` jsx
<Trans
    id='msg.docs'
    message='Read the <0>documentation</0>.'
    components={[
        <a href="/docs" />
    ]}
/>
```

and the translator gets the message in one piece: `Read the <0>documentation</0>`.

However, let's go yet another level deeper.

## Macros for component-based message syntax

[LinguiJS](https://github.com/lingui/js-lingui) provides macros `@lingui/macro` which automatically generates a message syntax.

Let's go back to the previous example:

``` html
<p>
   Read the <a href="/docs">documentation</a>.
</p>
```

All we need to do is to wrap the message in a [`Trans`](/docs/ref/macro.md#trans) macro:

``` html
<p>
   <Trans id="msg.docs">Read the <a href="/docs">documentation</a>.</Trans>
</p>
```

The macro then parses the [`Trans`](/docs/ref/macro.md#trans) macro children and generates `message` and `components` props  automatically in the form described in the previous section.

This is extremely useful when adding i18n to an existing project. All we need is to wrap all messages in [`Trans`](/docs/ref/macro.md#trans) macro.

Let's compare it with [react-intl](https://github.com/yahoo/react-intl) solution to see the difference:

``` jsx
<p>
   <FormattedMessage
       id='msg.docs'
       defaultMessage='Read the <link>documentation</link>.'
       values={{
           link: (...chunks) => <a href="/docs">{chunks}</a>
       }}
   />
</p>
```

:::note
It' also worth mentioning that the message IDs are completely optional. [LinguiJS](https://github.com/lingui/js-lingui) is unopinionated in this way and perfectly works with messages as IDs as well:

``` html
<p>
   <Trans>Read the <a href="/docs">documentation</a>.</Trans>
</p>
```

The message ID is `Read the <0>documentation</0>.` instead of `msg.docs`. Both solutions have pros and cons and the library lets you choose the one which works best for you.
:::

## Plurals

Another very common linguistic feature is pluralization.

Let's take a look at the original example from [react-intl](https://github.com/yahoo/react-intl) docs:

``` jsx
<FormattedMessage
   id="welcome"
   defaultMessage={`Hello {name}, you have {unreadCount, number} {unreadCount, plural,
     one {message}
     other {messages}
   }`}
   values={{name: <b>{name}</b>, unreadCount}}
 />
```

Using [LinguiJS](https://github.com/lingui/js-lingui) macros, we could combine [`Trans`](/docs/ref/macro.md#trans), [`Plural`](/docs/ref/macro.md#plural-1) components and [`i18n.number`](/docs/ref/core.md#i18n.number) macro:

``` jsx
<Trans id="welcome">
   Hello <b>{name}</b>, you have {i18n.number(undreadCount)} <Plural
      one="message"
      other="messages"
   />
</Trans>
```

and the final message would be very similar:

``` jsx
<Trans
   id="welcome"
   message={`Hello <0>{name}</0>, you have {unreadCount, number} {unreadCount, plural,
     one {message}
     other {messages}
   }`}
   values={{name, unreadCount}}
 />
```

The only difference is the [<0>] tag included in the message, as [LinguiJS](https://github.com/lingui/js-lingui) can handle  components in both variables and the message itself.

:::note
It's good to mention here that this isn't the best example of using plurals. Make your translators happy and move plurals to the top of the message:

``` jsx
<Plural
   id="welcome"
   value={number}
   one={<>Hello <b>{name}</b>, you have {i18n.number(undreadMessages)} message.</>}
   other={<>Hello <b>{name}</b>, you have {i18n.number(undreadMessages)} messages.</>}
/>
```

Even though both variants are syntactically valid in ICU MessageFormat, the second one is easier for translating, because (again) the translator gets the phrase in one piece.
:::

## Text attributes

Components can't be used in some contexts, e.g. to translate text attributes. Whereas [react-intl](https://github.com/yahoo/react-intl) provides JS methods (e.g: `formatMessage`) which return plain strings, [LinguiJS](https://github.com/lingui/js-lingui) offers its core library for such translations. And it also provides macros for these use-cases!

Here are a few short examples:

``` jsx
<a title={i18n._(t`The title of ${name}`)}>{name}</a>
<img alt={i18n._(plural({ value: count, one: "flag", other: "flags" }))} src="..." />
```

Custom IDs are supported as well:

``` jsx
<a title={i18n._(t("link.title")`The title of ${name}`}>{name}</a>
<img alt={i18n._(plural("img.alt", { value: count, one: "flag", other: "flags" }))} src="..." />
```

:::note
To inject `i18n` object into props, you need to use HOC [`withI18n`](/docs/ref/react.md#withi18n). It's very similar to `injectIntl` from [react-intl](https://github.com/yahoo/react-intl). Alternatively, you can also use `I18n` render prop component.
:::

## External message catalog

Let's say our app has been internationalized and we now want to send the messages to the translator.

[react-intl](https://github.com/yahoo/react-intl) comes with the Babel plugin which extracts messages from individual files, but it's up to you to merge them into one file which you can send to translators.

[LinguiJS](https://github.com/lingui/js-lingui) provides handy [`CLI`](/docs/tutorials/cli.md) which extracts messages and merges them with any existing translations. Again, the story doesn't end here.

## Compiling messages

The biggest and slowest part of i18n libraries are message parsers and formatters. [LinguiJS](https://github.com/lingui/js-lingui) compiles messages from MessageFormat syntax into JS functions which only accept values for interpolation (e.g. components, variables, etc). This makes the final bundle smaller and makes the library faster. The compiled catalogs are also bundled with locale data like plurals, so it's not necessary to load them manually.

## Disadvantages of LinguiJS

[react-intl](https://github.com/yahoo/react-intl) has been around for some time and it's definitely more popular, more used and a lot of production sites are running it. The community is larger and it's much easier to find help on StackOverflow and other sites.

[LinguiJS](https://github.com/lingui/js-lingui) is a very new library and the community is very small at the moment. It's not tested on many production sites. On the other hand, [LinguiJS](https://github.com/lingui/js-lingui)'s testing suite is very large and all examples are incorporated into the integration testing suite to make sure everything is working fine.

Last but not least, [LinguiJS](https://github.com/lingui/js-lingui) is actively maintained. Bugs are fixed regularly and new features are constantly coming in. Work is currently progressing on webpack code splitting, so that only messages related to the code in the chunk are loaded.

## Summary

-   both libraries use the same MessageFormat syntax
-   similar API (easy to port from one to the other)

On top of that, [LinguiJS](https://github.com/lingui/js-lingui):

-   supports rich-text messages
-   provides macros to simplify writing messages using MessageFormat
    syntax
-   provides a CLI for extracting and compiling messages
-   is very small (<5kb gzipped) and fast
-   works also in vanilla JS (without React)
-   is actively maintained

On the other hand, [react-intl](https://github.com/yahoo/react-intl):

-   is the most popular and used i18n lib in React
-   is used in many production websites (stability)
-   has lots of resources available online

## Discussion

Do you have any comments or questions? Please join the discussion at [GitHub](https://github.com/lingui/js-lingui/discussions) or raise an [issue](https://github.com/lingui/js-lingui/issues/new). All feedback is welcome!
