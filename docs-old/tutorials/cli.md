# Tutorial: Working with CLI

`lingui-cli` provides `lingui` command for extracting, merging and compiling 
message catalogs.

```bash
yarn global add lingui-cli
# or npm install --global lingui-cli
```

## Add a new locale

First we need to add all locales we want to translate our application.
`lingui add-locale` command creates a new directory in `locale` directory and 
also checks that locale exists:

```bash
lingui add-locale en cs
```

Example output:

```
Added locale en.
Added locale cs.

(use "lingui extract" to extract messages)
```

## Extracting messages

We're going to use an app we built in previous tutorial. `lingui extract` command 
looks for messages in source files and extracts them:

```bash
lingui extract
```


```
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

(use "lingui add-locale <locale>" to add more locales)
(use "lingui extract" to update catalogs with new messages)
(use "lingui compile" to compile catalogs for production)
```

Message catalog looks like this:

```json
{
  "Message Inbox": {
    "translation": "",
    "origin": [
      [
        "Inbox.js",
        10
      ]
    ]
  },
  "See all <0>unread messages</0> or <1>mark them</1> as read.": {
    "translation": "",
    "origin": [
      [
        "Inbox.js",
        13
      ]
    ]
  },
  "{messagesCount, plural, one {There's {messagesCount} message in your inbox.} other {There're {messagesCount} messages in your inbox.}}": {
    "translation": "",
    "origin": [
      [
        "Inbox.js",
        20
      ]
    ]
  },
  "Last login on {lastLogin,date}.": {
    "translation": "",
    "origin": [
      [
        "Inbox.js",
        28
      ]
    ]
  }
}
```

It's a JSON dictionary, where key is message ID and value is object with relevant information about message: translation, defaults and origin from where the message was extracted.

This catalog is ready for translation. Let's translate it in Czech by filling `translation` fields:

```json
{
  "Message Inbox": {
    "translation": "Přijaté zprávy",
    "origin": [
      [
        "Inbox.js",
        10
      ]
    ]
  },
  "See all <0>unread messages</0> or <1>mark them</1> as read.": {
    "translation": "Zobrazit všechny <0>nepřečtené zprávy</0> nebo je <1>označit</1> jako přečtené.",
    "origin": [
      [
        "Inbox.js",
        13
      ]
    ]
  },
  "{messagesCount, plural, one {There's {messagesCount} message in your inbox.} other {There're {messagesCount} messages in your inbox.}}": {
    "translation": "{messagesCount, plural, one {V příchozí poště je {messagesCount} zpráva.} few {V příchozí poště jsou {messagesCount} zprávy. } other {V příchozí poště je {messagesCount} zpráv.}}",
    "origin": [
      [
        "Inbox.js",
        20
      ]
    ]
  },
  "Last login on {lastLogin,date}.": {
    "translation": "Poslední přihlášení {lastLogin,date}",
    "origin": [
      [
        "Inbox.js",
        28
      ]
    ]
  }
}
```

If we run `lingui-extract` command again, we see in statistics that all messages are translated:

```
📈  Catalog statistics:
┌──────────┬─────────────┬─────────┐
│ Language │ Total count │ Missing │
├──────────┼─────────────┼─────────┤
│ cs       │      4      │    0    │
│ en       │      4      │    4    │
└──────────┴─────────────┴─────────┘

Messages extracted!

(use "lingui extract" to update catalogs with new messages)
(use "lingui compile" to compile catalogs for production)
```

`lingui extract` merges all translations with new messages, so you can run this 
command any time without worrying to lose any translation.

## Preparing catalogs for production

Once we have all catalogs ready and translated, we can compile JSON into
minified JS file with `lingui compile` command. This command parses messages in
MessageFormat and compiles them into simple functions. It also add plural rules 
to production ready catalog:

```bash
lingui compile
```

Example output:

```
Compiling message catalogs…
Done!
```

Locale dir now contains both source catalogs (`messages.json`) and compiled ones (`messages.js`).

## Cleaning up obsolete messages

By default, `lingui extract` command merges messages extracted from source files
with existing message catalogs. This is safe as we don't accidentaly loose
translated messages.

However, soon or later some messages will be removed from source. We can use
`--clean` option to clean up our message catalogs:

```bash
lingui extract --clean
```

## Validation of message catalogs

It might be necessary to check that all messages are translated (e.g: in
continous integration runner). `lingui compile` command has `--strict` option, 
which does exactly that.

Example output might look like this:

```bash 
$ lingui compile --strict
Compiling message catalogs…
Error: Failed to compile catalog for locale en!
Missing 42 translation(s)
```

## Further read

That's it! Checkout [reference](../ref/cli.md) documentation for more info about
`lingui` commands and configuration.
