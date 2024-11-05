# Sync & Collaboration Tools

While Lingui provides a powerful API for managing your translations, it doesn't provide an integrated solution for managing synchronization and collaboration with your translators.

This guide covers tools that can help you manage your localization process. You may come across acronyms like TMS (Translation Management System) or CAT (Computer Aided Translation) that are sometimes used to describe these tools.

## Workflows

The easiest way to translate your application is to translate your message catalogs directly in a text editor, or with a tool like [Poedit](https://poedit.net).

This solution may be good enough when your application is small and doesn't evolve much, but it quickly becomes hard work as the number of sentences to translate and target languages to manage increases over time.

It becomes increasingly difficult and time-consuming to manage the back-and-forth with translators while keeping your application's message catalogs up to date with the current state of a codebase that does not stop evolving.

### Regular Workflow

![Translation workflow *without* sync and collaboration tool](/img/docs/without-collaboration-tool.png)

This is the most basic workflow which involves sending the `.po` files to your translators (usually by email) and syncing them back manually into your application.

This workflow is manageable when your application is still quite small, doesn't contain a lot of text, and doesn't evolve much.

### Sync & Collaboration Tool Workflow

![Translation workflow *with* sync and collaboration tool](/img/docs/with-collaboration-tool.png)

When the amount of text to translate increases, and the number of target languages grows, it becomes more efficient to use a sync and collaboration tool to assist you with the management of your team of translators, and co-evolution between your code and the translated files.

Instead of manually sending and receiving many emails and fixing the inconsistencies with your code, a `sync` method is called and your `.po` and `.js` files are directly updated with the latest translations. Your translators will also be notified when there are new text to translate.

## Benefits

- **Synchronization**: unique `yarn sync` or `npm run sync` command to synchronize your project with all your translators and update your local `.po` and `.js` files with the latest translations.
- **Translation Interface**: provide a professional and flexible interface to translators.
- **Translation Memory**: assist translators by suggesting previously translated sentences that are similar.
- **Machine Translation**: auto-translate with Google Translate, DeepL, etc. and human-proofread later.
- **Smart Plural Management**: allows to translate `Message` and `Messages` instead of `{count, plural, one {Message} other {Messages}}`.
- **Consistency**: assist translators with `{variable}` interpolation and HTML formatting.

## Available Tools

- [Crowdin](/tools/crowdin)
- [Translation.io](/tools/translation-io)
