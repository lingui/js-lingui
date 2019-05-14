Testing
=======

.. warning:: This is an incomplete draft of a guide.

Components using :component:`Trans` or :js:func:`withI18n` require access to the context of :component:`I18nProvider`. This is not available when mounting single components in Enzyme. These helper functions aim to address that and wrap a valid, context around them.

Adapted from this gist_.

.. _gist: https://gist.github.com/mirague/c05f4da0d781a9b339b501f1d5d33c37/

.. code-block:: jsx

   import React from 'react'
   import { shape, object } from 'prop-types'
   import { mount, shallow } from 'enzyme'
   import { I18nProvider } from '@lingui/react'

   // Create the I18nProvider to retrieve context for wrapping around.
   const language = 'de-DE'
   const intlProvider = new I18nProvider({
     language,
     catalogs: {
       [language]: {}
     }
   }, {})

   const {
     linguiPublisher: {
       i18n: originalI18n
     }
   } = intlProvider.getChildContext()

   // You customize the i18n object here:
   const i18n = {
     ...originalI18n,
     _: key => key // provide _ macro, for just passing down the key
   }

   /**
    * When using Lingui `withI18n` on components, props.i18n is required.
    */
   function nodeWithI18nProp(node) {
     return React.cloneElement(node, { i18n })
   }

   /*
    * Methods to use
    */
   export function shallowWithIntl(node, { context } = {}) {
     return shallow(
       nodeWithI18nProp(node),
       {
         context: Object.assign({}, context, { i18n })
       }
     )
   }

   export function mountWithIntl(node, { context, childContextTypes } = {}) {
     const newContext = Object.assign({}, context, { linguiPublisher: { i18n } })
     /*
      * I18nProvider sets the linguiPublisher in the context for withI18n to get
      * the i18n object from.
      */
     const newChildContextTypes = Object.assign({},
       {
         linguiPublisher: shape({
           i18n: object.isRequired
         }).isRequired
       },
       childContextTypes
     )
     return mount(
       nodeWithI18nProp(node),
       {
         context: newContext,
         childContextTypes: newChildContextTypes
       }
     )
   }

Usage:

.. code-block:: jsx

   import { mountWithIntl } from 'enzyme-test-helper.js'

   const wrapper = mountWithIntl(
     <OurComponent />
   );

   expect(wrapper.state('prop')).to.equal('value')

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
