# Translation.io

<img src="https://translation.io/assets/logo-for-fb-73866392ffcfc181d7d3d6c1b61fa03dbf60c842cbe82d0f58b38af4597614df.png" alt="Translation.io Lingui Logo" width="300"/>
<br />

[Translation.io](https://translation.io/lingui) is a professional synchronization and collaboration platform that will assist your team in the translation of your Lingui application.

Links:

- Website: <https://translation.io/lingui>
- GitHub: <https://github.com/translation/lingui>

## Features

### Smooth Team Management

Invite your collaborators using their email or username, and assign them a role and a target language. We'll bring them on board and keep them informed about any new activity in their language.

![Smooth Team Management on Translation.io](https://translation.io/gifs/lingui/translation-collaborators.gif)

Learn more:

- [Fine-Grained Authorizations](https://translation.io/blog/fine-grained-authorization-and-role-management?default_stack=lingui)
- [Activity Digests](https://translation.io/blog/better-history-and-activity-email-digests?default_stack=lingui)

### Elegant Translation Process

Our interface was designed to be the most ergonomic way to translate. It provides translation suggestions (from [TM](https://en.wikipedia.org/wiki/Translation_memory), Google Translate or DeepL), context, discussion and history.

Keyboard shortcuts allow translators to stay focused on their work, visual hints indicate when something went wrong, for example when an interpolated variable or HTML tag is missing.

![Elegant Translation Process on Translation.io](https://translation.io/gifs/lingui/translation-interface.gif)

Learn more:

- [Keyboard Shortcuts](https://translation.io/blog/shortcuts-and-translation?default_stack=lingui)
- [History and Activity Digests](https://translation.io/blog/better-history-and-activity-email-digests?default_stack=lingui)

### Syntax Highlighting

Sometimes you have no choice but to confront your translators with HTML or interpolated variables. The problem is that translators do not necessarily know the meaning of these notations and may be tempted to translate them or may inadvertently alter them.

`Hello {name}` should never be translated as `Bonjour {nom}`, and we have several mechanisms to ensure that, like warnings and auto-completion:

![Syntax Highlighting warning on Translation.io](https://translation.io/_articles/2019-10-11-highlighting-of-html-tags-and-interpolated-variables/highlight-interpolated-variable-lingui.png)

---

![Syntax Highlighting auto-completion on Translation.io](https://translation.io/gifs/lingui/translation-highlights.gif)

### Smart Plural Management

Lingui allows to write plurals using the [ICU MessageFormat](/docs/ref/message-format.md) syntax that looks like this:

```icu-message-format
{count, plural, =0 {No messages}
                one {# message}
                other {# messages}}
```

But you can't ask a translator to understand this syntax, and he or she would be tempted to translate `one` or `other` keywords in other languages, breaking your code at the same time.

That's why we deconstruct the plural syntaxes to make them easy to translate, and then reconstruct them inside your local `.po` files.

If the target language has more plural forms than the source language, we also provide some examples to the translator, because it could be unclear what plural form the `few` or `other` keyword may refer to in that specific target language (in this example, Czech has 3 plural forms).

![Smart Plural Management on Translation.io](/img/docs/translation-lingui-plural-forms.png)

### Efficient Search

Our powerful search helps translators to maintain consistency of terms throughout their work. In addition, they are able to filter depending on a particular source file or context. To provide a more enjoyable experience, this lightning-fast search works without any page reloading.

![Efficient Search on Translation.io](https://translation.io/gifs/lingui/translation-search.gif)

Learn more:

- [Smart URLs](https://translation.io/blog/smart-urls-in-translation-interface?default_stack=lingui)

### Adaptive Workflows using Tags

Our interface is flexible enough to adapt to your own translation workflows. Add custom tags to your segments and you'll be directly able to filter them. Moreover, these tags will appear in the statistics page so you can use them for reporting.

![Adaptive Workflows using Tags on Translation.io](https://translation.io/gifs/lingui/translation-tags.gif)

Learn more:

- [How to Use Tags](https://translation.io/blog/tags-work-better-as-a-team?default_stack=lingui)
- [Project Statistics](https://translation.io/blog/translation-project-statistics?default_stack=lingui)

## Installation

### 1. Create your Lingui project

Create an account on [Translation.io](https://translation.io/lingui) and create a new Lingui project.

### 2. Configure your application

Copy the `.linguirc` configuration file that was generated for you to the root of your application.

The configuration file looks like this:

```js title=".linguirc"
{
  [...]
  "format": "po",
  "service": {
    "name": "TranslationIO",
    "apiKey": "abcdefghijklmnopqrstuvwxyz012345"
  }
}
```

The synchronization will then be part of the [`extract`](/docs/ref/cli.md#extract) command.

### 3. Add the following scripts

Add these lines to your `package.json` to make your life easier.

```js title="package.json"
{
  "scripts": {
    "sync": "lingui extract --overwrite && lingui compile",
    "sync_and_purge": "lingui extract --overwrite --clean && lingui compile"
  }
}
```

### 4. Initialize your project

Initialize your project and upload your source text and potential existing translations with:

```bash npm2yarn
npm run sync
```

## Usage

### Sync

To send new translatable strings and get new translations from Translation.io, and at the same time generate the minified JavaScript catalog files, simply run:

```bash npm2yarn
npm run sync
```

### Sync and Purge

If you need to remove unused strings from Translation.io, using the current branch as reference.

As the name says, this operation will also perform a sync at the same time.

**Warning**: all strings that are not present in the current local branch will be **permanently deleted from Translation.io**.

```bash npm2yarn
npm run sync_and_purge
```

---

If you need some help with your project, feel free to contact <contact@translation.io>
