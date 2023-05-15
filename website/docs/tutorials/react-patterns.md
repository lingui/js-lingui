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

## Choosing between generated and explicit ID

Using generated IDs provides more scalability and gives a better developer experience. On the other hand, explicit IDs for phrases make it easier to identify phrases out of context and to track where they're used. IDs usually follow a naming scheme that includes *where* the phrase is used.

### Using ID generated from message

#### With [`Trans`](/docs/ref/macro.md#trans)

In the example code above, the content of [`Trans`](/docs/ref/macro.md#trans) is transformed into a message in MessageFormat syntax. By default, this message is used for generating the ID. Considering the example above, the catalog would be fulfilled by these entries:

```js
const catalog = [
  {
    id: "uxV9Xq",
    message: "LinguiJS example",
  },
  {
    id: "9/omjw",
    message: "Hello <0>{name}</0>.",
  },
]
```

#### With [`t`](/docs/ref/macro.md#t)

In the following example, the message `Image caption` will be extracted and used to create an ID.

```jsx
import { t } from "@lingui/macro"

export default function ImageWithCaption() {
   return <img src="..." alt={t`Image caption`} />
}
```

#### Providing context for a message

Use `context` to add more contextual information for translators. It also influences the ID generation: the same text elements with different contexts are extracted with different IDs.

See [Context](/ref/macro#context) for more details.

```jsx
import { Trans } from "@lingui/macro";
<Trans context="direction">right</Trans>;
<Trans context="correctness">right</Trans>;

// ↓ ↓ ↓ ↓ ↓ ↓

import { Trans } from "@lingui/react";
<Trans id={"d1wX4r"} message="right" />;
<Trans id={"16eaSK"} message="right" />;
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
import { msg } from "@lingui/macro"
import { Trans } from "@lingui/react"

const favoriteColors = [
   msg`Red`,
   msg`Orange`,
   msg`Yellow`,
   msg`Green`,
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

Or to render the message descriptor as a string-only translation, pass it to the [`i18n._()`](/docs/ref/core.md#i18n._) method:

```jsx
import { i18n } from "@lingui/core"
import { msg } from "@lingui/macro"

const favoriteColors = [
  msg`Red`,
  msg`Orange`,
  msg`Yellow`,
  msg`Green`,
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

A simple way to do this, is to make an object that maps the possible values of "status" to message descriptors (tagged with the [`defineMessage`](/docs/ref/macro.md#definemessage) macro), and render them as needed with deferred translation:

```jsx
import { msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";

const statusMessages = {
   ['STATUS_OPEN']: msg`Open`,
   ['STATUS_CLOSED']: msg`Closed`,
   ['STATUS_CANCELLED']: msg`Cancelled`,
   ['STATUS_COMPLETED']: msg`Completed`,
}

export default function StatusDisplay({ statusCode }) {
   const { i18n } = useLingui();
   return <div>{i18n._(statusMessages[statusCode])}</div>
}
```

## Memoization pitfall

In the following contrived example, the welcome message will not be updated when locale changes.

This is expected behavior, because the `useMemo` has no dependencies. In order for this to work as expected, the `useMemo` needs to depend on an `i18n` instance. Specifically, it needs to depend on `i18n` from the `useLingui` hook, as the reference to the `i18n` object from `@lingui/core` does not change throughout your app's lifetime.

```jsx
import { msg } from "@lingui/macro";
import { i18n } from "@lingui/core"

const welcomeMessage = msg`Open`;

export function Welcome() {
  const buggyWelcome = useMemo(() => {
    return i18n._(welcomeMessage);
  }, []);

  return <div>{buggyWelcome}</div>;
}
```
