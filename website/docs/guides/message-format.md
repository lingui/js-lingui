# ICU MessageFormat

ICU MessageFormat is a flexible and powerful syntax designed to express the grammatical nuances of different languages. Its flexibility ensures that your application can handle grammatical variations, making it essential for effective internationalization.

## Overview

### Simple text

Example: `Refresh inbox`

### Variables

Example: `Attachment {name} saved`

### Plurals

> Using language specific plural forms (`one`, `other`):

```icu-message-format
{count, plural, one {Message} other {Messages}}
```

> Using exact matches for specific counts (`=0`):

```icu-message-format
{count, plural, =0 {No messages}
                one {# message}
                other {# messages}}
```

> Offsetting plural forms:

```icu-message-format
{count, plural, offset:1
                =0 {Nobody read this message}
                =1 {Only you read this message}
                one {You and # friend read this message}
                other {You and # friends read this message}
```

### Select

```icu-message-format
{gender, select, male {He replied to your message}
                 female {She replied to your message}
                 other {They replied to your message}}
```

### Ordinals

```icu-message-format
{count, selectOrdinal, one {#st message}
                       two {#nd message}
                       few {#rd message}
                       other {#th message}}
```

## See Also

- [Pluralization](/guides/plurals)
- [ICU Playground](https://format-message.github.io/icu-message-format-for-translators/editor.html)
