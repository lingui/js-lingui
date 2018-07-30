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

Snapshot testing
----------------

`Snapshot testing`_ is fast and convenient way to ensure you app doesn't change
unexpectedly. However, components are serialized with all props, so even simple
translation:

.. code-block:: jsx

   <Trans>Today is <DateFormat value={now} /></Trans>

has a very long and hard to read snapshot:

.. code-block:: none

   <Trans
    i18n={
      I18n {
        _activeLanguageData: Object {
          plurals: [Function],
        },
        _activeMessages: Object {},
        _catalogs: Object {
          en: Object {
            languageData: Object {},
            messages: Object {},
          },
        },
        _dev: Object {
          compile: [Function],
          loadLanguageData: [Function],
        },
        _language: en,
        _locales: undefined,
        plural: [Function],
        select: [Function],
        selectOrdinal: [Function],
        t: [Function],
      }
    }
    i18nHash={null}
    id=Today is {now,date}
    values={
      Object {
        now: 2017-04-05T11:14:00.000Z,
      }
    }
   >
    <Render
      value=Today is 4/5/2017
    >
      Today is 4/5/2017
    </Render>
   </Trans>

In such case we might want to test just an HTML output. jest-serializer-html_
indents and formats HTML in snapshot making it easier to diff. Add it to Jest config:

.. code-block:: json

   {
      "snapshotSerializers": [
         "jest-serializer-html"
      ]
   }

Instead of serializing element wrapper, serialize HTMl instead:

.. code-block:: jsx

   expect(mount(<Trans>Today is <DateFormat value={now} /></Trans>).html())
      .toMatchSnapshot()

The final snapshot is shorter and easy to review:

.. code-block:: html

   <div>Today is 4/5/2017</div>

.. _jest-serializer-html: https://github.com/rayrutjes/jest-serializer-html
.. _Snapshot testing: https://jestjs.io/docs/en/snapshot-testing
