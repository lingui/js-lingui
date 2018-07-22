Testing
=======

.. warning:: This is an incomplete draft of a guide.

Components using :component:`Trans` or :js:func:`withI18n` must be wrapped in
:component:`I18nProvider` in tests:

.. code-block:: jsx

   import React from 'react'
   import { mount } from 'enzyme'
   import { I18nProvider } from '@lingui/react'
   import Component from './Component'

   describe('Component', function () {
     it('should render correctly', function () {
        const tree = mount(<I18nProvider><Component /></I18nProvider>
        expect(tree).toMatchSnapshot()
     })
   })
