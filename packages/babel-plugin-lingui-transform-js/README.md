react-plugin-transform-js - Syntactic sugar for translations
=====================================================================

Babel plugin for human-friendly definitions of strings for translation in React.
Works in combination with `lingui-react` component.

Cookbook
--------

### Static message

```js
<Trans>Hello World</Trans>
```

becomes:

```js
<Trans id="Hello World" />
```

### Message with variables

```js
<Trans>Hi, my name is {name}</Trans>
```

becomes:

```js
<Trans id="Hi, my name is {name}" params={{name: name}} />
```

### ICU message (must be wrapped inside expression)

```js
<Trans>{`One {${count}, plural, one {glass}, other {glasses}} of wine`}</Trans>
```

becomes:

```js
<Trans id="One {count, plural, one {glass}, other {glasses}} of wine" params={{count: count}} />
```

### Message with inline components

Component name and props aren't included in translation ID.

```js
<Trans>Hi, my name is <a href="/profile">Dave</a>!</Trans>
```

becomes:

```js
<Trans 
  id="Hi, my name is <0>{name}</0>!" 
  params={{name: name}} 
  components={[
    <a href="/profile" />
  ]}
/>
```
