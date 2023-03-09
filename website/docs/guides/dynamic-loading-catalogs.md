# Dynamic loading of message catalogs

[`I18nProvider`](/docs/ref/react.md#i18nprovider) doesn't assume anything about your app and it's your responsibility to load messages based on active language.

Here's an example of a basic setup with a dynamic load of catalogs.

## Final I18n loader helper

Here's the full source of `i18n.ts` logic:

```tsx title="i18n.ts"
import { i18n } from '@lingui/core';

export const locales = {
  en: "English",
  cs: "Česky",
};
export const defaultLocale = "en";

/**
* We do a dynamic import of just the catalog that we need
* @param locale any locale string
*/
export async function dynamicActivate(locale: string) {
  const { messages } = await import(`./locales/${locale}/messages`)
  i18n.load(locale, messages)
  i18n.activate(locale)
}
```

**How should I use the dynamicActivate in our application?**

```jsx
import React, { useEffect } from 'react';
import App from './App';

import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { defaultLocale, dynamicActivate } from './i18n';

const I18nApp = () => {
  useEffect(() => {
    // With this method we dynamically load the catalogs
    dynamicActivate(defaultLocale)
  }, [])

  return (
    <I18nProvider i18n={i18n}>
      <App  />
    </I18nProvider>
  )
}
```

## Conclusion

Looking at the content of build dir, we see one chunk per language:

```bash
i18n-0.c433b3bd.chunk.js
i18n-1.f0cf2e3d.chunk.js
main.ab4626ef.js
```

When page is loaded initially, only main bundle and bundle for the first language are loaded:

![Requests during the first render](/img/docs/dynamic-loading-catalogs-1.png)

After changing language in UI, the second language bundle is loaded:

![Requests during the second render](/img/docs/dynamic-loading-catalogs-2.png)

And that's it! 🎉
