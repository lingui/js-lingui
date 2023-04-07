# Common i18n patterns in React

Following page describes the most common i18n patterns in React. It's a follow-up to [tutorial](/docs/tutorials/react.md) with practical examples. See the [API reference](/docs/ref/react.md) for detailed information about all components.

## Macros

Using jsx macros is the most straightforward way how to translate your React components.

[`Trans`](/docs/ref/macro.md#trans) handles translations of messages including variables and other React components:

```jsx
import { Trans } from "@lingui/macro"

function render() {
  return (
    <>
      <h1><Trans>LinguiJS example</Trans></h1>
      <p><Trans>Hello <a href="/profile">{name}</a>.</Trans></p>
    </>
  );
}
```

You don't need anything special to use [`Trans`](/docs/ref/macro.md#trans) inside your app (except of wrapping the root component in [`I18nProvider`](/docs/ref/react.md#i18nprovider)).

### Using ID generated from message

#### With [`Trans`](/docs/ref/macro.md#trans)

In the examples above, the content of [`Trans`](/docs/ref/macro.md#trans) is transformed into message in MessageFormat syntax. By default, this message is used as the message ID. Considering the example above, messages `LinguiJS example` and `Hello <0>{name}</0>.` are extracted and used as IDs.

#### With [`t`](/docs/ref/macro.md#t)

In the following example, message `Image caption` will be extracted and used as ID.

```jsx
import { t } from "@lingui/macro"

export default function ImageWithCaption() {
   return <img src="..." alt={t`Image caption`} />
}
```

### Using custom ID

#### With [`Trans`](/docs/ref/macro.md#trans)

If you're using custom IDs in your project, add `id` prop to i18n components:

```jsx
import { Trans } from "@lingui/macro"

function render() {
  return (
    <>
      <h1><Trans id="msg.header">LinguiJS example</Trans></h1>
      <p><Trans id="msg.hello">Hello <a href="/profile">{name}</a>.</Trans></p>
    </>
  );
}
```

Messages `msg.header` and `msg.hello` will be extracted with default values `LinguiJS example` and `Hello <0>{name}</0>.`.

#### With [`t`](/docs/ref/macro.md#t)

If you're using custom IDs in your project, call [`t`](/docs/ref/macro.md#t) with a message descriptor object and pass ID as `id` prop:

```jsx
import { t } from "@lingui/macro"

export default function ImageWithCaption() {
   return <img src="..." alt={t({id: 'msg.caption', message: `Image caption`})} />
}
```

Message `msg.caption` will be extracted with default value `Image caption`.

For all other js macros ([`plural`](/docs/ref/macro.md#plural), [`select`](/docs/ref/macro.md#select), [`selectOrdinal`](/docs/ref/macro.md#selectordinal), use them inside [`t`](/docs/ref/macro.md#t) macro to pass ID (in this case, `'msg.caption'`).

```jsx
import { t, plural } from "@lingui/macro"

export default function ImageWithCaption({ count }) {
   return (
      <img src="..." alt={t({id: 'msg.caption', message: plural(count, {
         one: "# image caption",
         other: "# image captions",
      })})} />
   )
}
```

:::tip
It's a good practice to set explicit IDs for phrases to make it easier to identify phrases out of context and to track where they're used. IDs usually follow a naming scheme that includes *where* the phrase is used.
:::

## Element attributes and string-only translations

Sometimes you can't use [`Trans`](/docs/ref/macro.md#trans) component, for example when translating element attributes:

```html
<img src="..." alt="Image caption" />
```

In such case you need to use [`t`](/docs/ref/macro.md#t) macro to wrap message. [`t`](/docs/ref/macro.md#t) is equivalent for [`Trans`](/docs/ref/macro.md#trans), [`plural`](/docs/ref/macro.md#plural) is equivalent to [`Plural`](/docs/ref/macro.md#plural-1).

```jsx
import { t } from "@lingui/macro"

export default function ImageWithCaption() {
   return <img src="..." alt={t`Image caption`} />
}
```

:::tip
In order for the translation to update on language change where the `t` macro is used, call `useLingui()` in your component:

```jsx
import { useLingui } from "@lingui/react"
import { t } from "@lingui/macro"

export default function ImageWithCaption() {
   useLingui()
   return <img src="..." alt={t`Image caption`} />
}
```
:::

## Translations outside React components

Another common pattern is when you need to access translations outside React components, for example inside `redux-saga`. You can use [`t`](/docs/ref/macro.md#t) macro outside React context as usual:

```jsx
import { t } from "@lingui/macro"

export function alert() {
    // use t as if you were inside a React component
    alert(t`...`)
}
```

## Lazy translations

Messages don't have to be declared at the same code location where they're displayed. Tag a string with the [`defineMessage`](/docs/ref/macro.md#definemessage) macro, and you've created a "message descriptor", which can then be passed around as a variable, and can be displayed as a translated string by passing its `id` to [`Trans`](/docs/ref/macro.md#trans) as its `id` prop:

```jsx
import { defineMessage, Trans } from "@lingui/macro"

const favoriteColors = [
   defineMessage({message: "Red"}),
   defineMessage({message: "Orange"}),
   defineMessage({message: "Yellow"}),
   defineMessage({message: "Green"}),
]

export default function ColorList() {
   return (
      <ul>
         {favoriteColors.map(color => (
            <li><Trans id={color.id}/></li>
         ))}
      </ul>
   )
}
```

Or to render the message descriptor as a string-only translation, just pass it to the [`i18n._()`](/docs/ref/core.md#i18n._) method:

```jsx
import { i18n } from "@lingui/core"
import { defineMessage } from "@lingui/macro"

const favoriteColors = [
   defineMessage({message: "Red"}),
   defineMessage({message: "Orange"}),
   defineMessage({message: "Yellow"}),
   defineMessage({message: "Green"}),
]

export function getTranslatedColorNames() {
   return favoriteColors.map(
      color => i18n._(color)
   )
}
```

### Passing messages as props

It's often convenient to pass messages around as component props, for example as a "label" prop on a button. The easiest way to do this is to pass a [`Trans`](/docs/ref/macro.md#trans) element as the prop:

```jsx
import { Trans } from "@lingui/macro"

export default function FancyButton(props) {
   return <button>{props.label}</button>
}

export function LoginLogoutButtons(props) {
   return <div>
      <FancyButton label={<Trans>Log in</Trans>} />
      <FancyButton label={<Trans>Log out</Trans>} />
   </div>
}
```

If you need the prop to be displayed as a string-only translation, you can pass a message tagged with the [`t`](/docs/ref/macro.md#t) macro:

```jsx
import { t } from "@lingui/macro"

export default function ImageWithCaption(props) {
   return <img src="..." alt={props.caption} />
}

export function HappySad(props) {
   return <div>
      <ImageWithCaption caption={t`I'm so happy!`} />
      <ImageWithCaption caption={t`I'm so sad.`} />
   </div>
}
```

### Picking a message based on a variable

Sometimes you need to pick between different messages to display, depending on the value of a variable. For example, imagine you have a numeric "status" code that comes from an API, and you need to display a message representing the current status.

A simple way to do this, is to make an object that maps the possible values of "status" to message descriptors (tagged with the [`defineMessage`](/docs/ref/macro.md#definemessage) macro), and render them as needed with lazy translation:

```jsx
import { defineMessage, Trans } from "@lingui/macro";

const STATUS_OPEN = 1,
      STATUS_CLOSED = 2,
      STATUS_CANCELLED = 4,
      STATUS_COMPLETED = 8

const statusMessages = {
   [STATUS_OPEN]: defineMessage({message: "Open"}),
   [STATUS_CLOSED]: defineMessage({message: "Closed"}),
   [STATUS_CANCELLED]: defineMessage({message: "Cancelled"}),
   [STATUS_COMPLETED]: defineMessage({message: "Completed"}),
}

export default function StatusDisplay({ statusCode }) {
   return <div><Trans id={statusMessages[statusCode].id} /></div>
}
```
