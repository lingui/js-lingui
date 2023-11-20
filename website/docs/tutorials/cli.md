# Working with LinguiJS CLI

`@lingui/cli` provides the `lingui` command for extracting, merging and compiling message catalogs. Follow [setup instructions](/docs/ref/cli.md) to install required packages.

## Extracting messages

We're going to use an app we built in the [React tutorial](/docs/tutorials/react.md). The [`extract`](/docs/ref/cli.md#extract) command looks for messages in the source files and extracts them:

```bash npm2yarn
> npm run extract

Extracting messages from source files…
Collecting all messages…
Writing message catalogs…
Messages extracted!

Catalog statistics:
┌──────────┬─────────────┬─────────┐
│ Language │ Total count │ Missing │
├──────────┼─────────────┼─────────┤
│ cs       │     40      │   40    │
│ en       │     40      │   40    │
└──────────┴─────────────┴─────────┘

(use "yarn extract" to update catalogs with new messages)
(use "yarn compile" to compile catalogs for production)
```

The message catalog will look like this:

```json
{
  "Message Inbox": "",
  "See all <0>unread messages</0> or <1>mark them</1> as read.": "",
  "{messagesCount, plural, one {There's {messagesCount} message in your inbox.} other {There are {messagesCount} messages in your inbox.}}": "",
  "Last login on {lastLogin,date}.": ""
}
```

It's in a JSON dictionary, where 'key' is message ID and value is an object with some relevant information: translation, defaults and origin for the message.

This catalog is ready for translation. Let's translate it into Czech by filling the `translation` fields:

```json
{
  "Message Inbox": "Přijaté zprávy",
  "See all <0>unread messages</0> or <1>mark them</1> as read.": "Zobrazit všechny <0>nepřečtené zprávy</0> nebo je <1>označit</1> jako přečtené.",
  "{messagesCount, plural, one {There's {messagesCount} message in your inbox.} other {There are {messagesCount} messages in your inbox.}}": "{messagesCount, plural, one {V příchozí poště je {messagesCount} zpráva.} few {V příchozí poště jsou {messagesCount} zprávy. } other {V příchozí poště je {messagesCount} zpráv.}}",
  "Last login on {lastLogin,date}.": "Poslední přihlášení {lastLogin,date}"
}
```

If we run the [`extract`](/docs/ref/cli.md#extract) command again, we can see in the stats that all messages are translated:

```bash npm2yarn
> npm run extract

Catalog statistics:
┌──────────┬─────────────┬─────────┐
│ Language │ Total count │ Missing │
├──────────┼─────────────┼─────────┤
│ cs       │      4      │    0    │
│ en       │      4      │    4    │
└──────────┴─────────────┴─────────┘

Messages extracted!

(use "yarn extract" to update catalogs with new messages)
(use "yarn compile" to compile catalogs for production)
```

[`extract`](/docs/ref/cli.md#extract) merges all translations with new messages, so you can run this command any time without worrying about losing any translations.

:::tip
Visit the [Message Extraction](/docs/guides/message-extraction.md) guide to read more about how it works.
:::

## Preparing catalogs for production

Once we have all catalogs ready and translated, we can compile all catalogs into minified JS files with the [`compile`](/docs/ref/cli.md#compile) command.

```bash npm2yarn
> npm run compile

Compiling message catalogs…
Done!
```

The `locale` directory now contains the source catalogs (`messages.json`) and the compiled ones (`messages.js`).

Messages added to compiled file are collected in specific order:

1.  Translated message from specified locale
2.  Translated message from fallback locale for specified locale
3.  Translated message from default fallback locale
4.  Message key

It is also possible to merge the translated catalogs into a single file per locale by specifying `catalogsMergePath`. For example if `catalogsMergePath` is assigned `locales/{locale}` then catalogs will be compiled to `/locales/cs.js` and `/locales/en.js`.

## Cleaning up obsolete messages

By default, the [`extract`](/docs/ref/cli.md#extract) command merges messages extracted from source files with the existing message catalogs. This is safe as we won't accidentally lose translated messages.

However, over time, some messages might be removed from the source. We can use the [`--clean`](/docs/ref/cli.md#extract-clean) option to clean up our message catalogs:

```bash npm2yarn
npm run extract --clean
```

## Validation of message catalogs

It might be useful to check if all messages were translated (e.g: in a continuous integration runner). The [`compile`](/docs/ref/cli.md#compile) command has a [`--strict`](/docs/ref/cli.md#compile-strict) option, which does exactly that.

The example output might look like this:

```bash npm2yarn
> npm run compile --strict

Compiling message catalogs…
Error: Failed to compile catalog for locale en!
Missing 42 translation(s)
```

## Configuring source locale

One drawback to checking for missing translations is that the English message catalog doesn't need translations, as our source code is in English.

Let's fix it by setting [`sourceLocale`](/docs/ref/conf.md#sourcelocale) in `package.json`:

```json title="package.json"
{
  "lingui": {
    "sourceLocale": "en"
  }
}
```

Running `extract` again shows the correct statistics:

```bash npm2yarn
> npm run extract

Catalog statistics:
┌─────────────┬─────────────┬─────────┐
│ Language    │ Total count │ Missing │
├─────────────┼─────────────┼─────────┤
│ cs          │      4      │    0    │
│ en (source) │      4      │    -    │
└─────────────┴─────────────┴─────────┘
```

And compilation in strict mode no longer throws an error:

```bash npm2yarn
> npm run compile --strict

Compiling message catalogs…
Done!
```

If you use natural language for message IDs (that's the default), set [`sourceLocale`](/docs/ref/conf.md#sourcelocale). You shouldn't use this config if you're using custom IDs (e.g: `Component.title`).

## Catalogs in VCS and CI

The `locale/_build` folder and `locale/*/*.js` (compiled catalogs) are safe to be ignored by your VCS. What you do need to keep in VCS are the JSON files (`locale/*/*.json`) that contain the messages for translators. The JavaScript functions that return the actual translations when your app runs in production are created from those JSON files. See [Excluding build files](/docs/guides/excluding-build-files.md) guide for more info.

If you're using a CI, it is a good idea to add the `yarn extract` and `yarn compile` commands to your build process.

## Further reading

- [CLI Reference](/docs/ref/cli.md)
- [Configuration Reference](/docs/ref/conf.md)
- [Message Extraction](/docs/guides/message-extraction.md)
