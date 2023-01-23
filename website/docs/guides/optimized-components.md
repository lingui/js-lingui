# Optimized components

Let's call any component implementing `shouldComponentUpdate` an *Optimized component*.

:::tip
**TL;DR:** Optimized components are handled correctly in LinguiJS by default. Read this document if you want to understand how things work under the hood.
:::

React components can be optimized to skip updates implementing `shouldComponentUpdate`. Based on change of props and state, component can decide to continue re-rendering or skip the update completely. However, LinguiJS reads translations from context and there are two cases which must be handled to make i18n related updates reliable.

The two cases to handle are:

1.  Translations inside optimized component.
2.  Optimized component is wrapped in [`withI18n`](/docs/ref/react#withi18n) to translate text attributes.

Let's take a look at both scenarios.

## Translations inside optimized component

Imagine following React tree:

```jsx
<OptimizedComponent>
   <AnotherComponent>
      <Trans>I am not alone!</Trans>
   </AnotherComponent>
</OptimizedComponent>
```

When active language is changed or message catalog is updated, `OptimizedComponent` will probably skip the update, because it's props don't change. It means that all children of `OptimizedComponent` won't be updated, including [`Trans`](/docs/ref/react#trans) component.

By default, all [`Trans`](/docs/ref/react#trans) components listen for language and catalog changes and update themselves when it happens. Even if `OptimizedComponent` skips update, [`Trans`](/docs/ref/react#trans) component is updated correctly.

Also, [`withI18n`](/docs/ref/react#withi18n) HOC listens for language and catalog changes, but this behavior can be disabled by passing `update = false` option:

``` jsx
// Component won't listen for language/catalog changes
export default withI18n({ update = false })(Component)
```

## Optimized component wrapped in [`withI18n`](/docs/ref/react#withi18n)

Component should be wrapped in [`withI18n`](/docs/ref/react#withi18n) HOC when it's required to access low-level i18n API. Common use-case is translation of attributes:

``` jsx
import * as React from 'react'
import { t, Trans } from '@lingui/macro'

class HeaderLink extends React.PureComponent {
   render () {
      return <a title={i18n._(t`Title`)}><Trans>Header</Trans></a>
   }
}

export default withI18n()(HeaderLink)
```

Content of link will be updated correctly as discussed in previous section. However, text attributes aren't components but only function calls, so they can't listen to changes of active language and catalog.

The trick here is to update whole component, but since it's a PureComponent, it does shallow comparison of props. [`withI18n`](/docs/ref/react#i18nprovider) HOC makes things easier by passing `i18nHash` to wrapped component. This hash is changed after every change of active language or catalog.

If you have your own implementation of `shouldComponentUpdate`, simply compare also `i18nHash`:

``` jsx
import * as React from 'react'

class HeaderLink extends React.Component {
   shouldComponentUpdate(nextProps, nextState) {
      return nextProps.i18nHash !== this.props.i18nHash /* && your condition */
   }

   render () {
      // render component as usual
   }
}
```

If you don't want your component to receive this hash for whatever reason, you can disable it by passing `withHash = false` option to HOC:

``` jsx
// Component won't pass i18nHash prop
export default withI18n({ withHash = false })(Component)
```

## Summary

LinguiJS handles updates in and for Optimized components in most cases. If you want to disable this behavior, you can pass either `update = false` or `withHash = false` to [`withI18n`](/docs/ref/react#withi18n) HOC.

`update` fixes updates if component has optimized parents while
`withHash` fixes updates for intermediate optimized children.

## Further reading

- [React docs: Optimizing Performance](https://reactjs.org/docs/optimizing-performance.html#avoid-reconciliation)
- [How to handle React context in a reliable way](https://medium.com/react-ecosystem/how-to-handle-react-context-a7592dfdcbc)
