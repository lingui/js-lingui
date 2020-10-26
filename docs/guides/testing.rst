Testing
=======

Components using :component:`Trans`, :js:func:`withI18n` or :js:func:`useLingui` require access to the context of :component:`I18nProvider`. How you can wrap your component with the I18nProvider depends on the test library you use. 

Here is a working example with `react-testing-library`_, using the `wrapper-property`_:

.. _`react-testing-library` : https://testing-library.com/docs/react-testing-library/intro
.. _wrapper-property: https://testing-library.com/docs/react-testing-library/api#wrapper


.. code-block:: jsx

   // index.js
   import React from 'react'
   import { render } from '@testing-library/react'
   import { i18n } from '@lingui/core'
   import { I18nProvider } from '@lingui/react'
   import { messages } from '../your-path-to/en/messages.js'
   import Inbox from './Inbox'

   i18n.load('en', messages)
   i18n.activate('en')
   const TestingProvider = ({ children }) => (
     <I18nProvider i18n={i18n}>
       {children}
     </I18nProvider>
   )

   test('your example-test', () => {
     render(<Inbox />, { wrapper: TestingProvider });
     expect(screen.getByRole('button')).toBeInTheDocument()
   });

You could define a custom renderer to re-use this TestingProvider, see `react testing library - Custom Render`_

.. _`react testing library - Custom Render`: https://testing-library.com/docs/react-testing-library/setup#custom-render
