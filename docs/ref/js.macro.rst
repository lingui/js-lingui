js.macro - API Reference
========================

.. warning:: This is a draft of API reference for upcoming package ``js.macro``

`t` - general translation
-------------------------

   t`Static message`
   _("Static message")

   t`Variable: ${var}`
   _("Variable {var}", { var })

   t('msg.id')`Custom id`
   _("msg.id", {}, { defaults: "Custom id" })

`plural` - pluralization
------------------------

   plural({
      value: count,
      one: "# Book",
      other: "# Books"
   })
   _("{count, plural, one {# Book} other {# Books}", { count })

   plural("msg.id, {
      value: count,
      one: "# Book",
      other: "# Books"
   })
   _("msg.id", { count }, { defaults: "{count, plural, one {# Book} other {# Books}" })
