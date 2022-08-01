Testing
=======

Components using :component:`Trans`, :js:func:`withI18n` or :js:func:`useLingui` require access to the context of :component:`I18nProvider`. How you can wrap your component with the I18nProvider depends on the test library you use. 

Here is a working example with `react-testing-library`_, using the `wrapper-property`_:

.. _`react-testing-library` : https://testing-library.com/docs/react-testing-library/intro
.. _wrapper-property: https://testing-library.com/docs/react-testing-library/api#wrapper


.. code-block:: jsx

   // index.js
    import React from 'react'
    import { getByText, render, act } from '@testing-library/react'
    import { i18n } from '@lingui/core'
    import { I18nProvider } from '@lingui/react'
    import { en, cs } from 'make-plural/plurals'

    import { messages } from './locales/en/messages'
    import { messages as csMessages } from './locales/cs/messages'
    import App from './App'

    i18n.load({
      en: messages,
      cs: csMessages
    })
    i18n.loadLocaleData({
      en: { plurals: en },
      cs: { plurals: cs }
    });

    const TestingProvider = ({ children }: any) => (
      <I18nProvider i18n={i18n}>
        {children}
      </I18nProvider>
    )

    test('Content should be translated correctly in English' , () => {
      act(() => {
        i18n.activate('en')
      })
      const { getByTestId, container } = render(<App />, { wrapper: TestingProvider });
      expect(getByTestId('h3-title')).toBeInTheDocument()
      expect(getByText(container, "Language switcher example:")).toBeDefined()
    });

    test('Content should be translated correctly in Czech', () => {
      act(() => {
        i18n.activate('cs')
      })
      const { getByTestId, container } = render(<App />, { wrapper: TestingProvider });
      expect(getByTestId('h3-title')).toBeInTheDocument()
      expect(getByText(container, "Příklad přepínače jazyků:")).toBeDefined()
    });

You could define a custom renderer to re-use this TestingProvider, see `react testing library - Custom Render`_

.. _`react testing library - Custom Render`: https://testing-library.com/docs/react-testing-library/setup#custom-render


Currently, there is no way to run unit tests using ts-jest because of @lingui/macro as we don't have a mock for it, nor a transformer. If you want to use lingui with ts-jest, please submit a PR.
