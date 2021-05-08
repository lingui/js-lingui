.. _message-format:

*****************
ICU MessageFormat
*****************

ICU MessageFormat is a flexible yet powerful syntax to express all nuances of grammar
for each language.

Use `online ICU editor <https://devpal.co/icu-message-editor/>`_ to explore or validate ICU formats.

Overview
--------

+------------------+------------------------------------------------------------------+
| Format           + Example                                                          |
+==================+==================================================================+
| Simple text      | ``Refresh inbox``                                                |
+------------------+------------------------------------------------------------------+
| Variables        | ``Attachment {name} saved``                                      |
+------------------+------------------------------------------------------------------+
| .. icu:: plural  | - Using language specific plural forms (``one``, ``other``)::    |
|                  |                                                                  |
| Plurals          |     {count, plural, one {Message} other {Messages}}              |
|                  |                                                                  |
|                  | - Using exact matches (``=0``):                                  |
|                  |                                                                  |
|                  |   .. code-block:: none                                           |
|                  |                                                                  |
|                  |     {count, plural, =0 {No messages}                             |
|                  |                     one {# message}                              |
|                  |                     other {# messages}}                          |
|                  |                                                                  |
|                  | - Offseting plural form:                                         |
|                  |                                                                  |
|                  |   .. code-block:: none                                           |
|                  |                                                                  |
|                  |      {count, plural, offset:1                                    |
|                  |                      =0 {Nobody read this message}               |
|                  |                      =1 {Only you read this message}             |
|                  |                      one {You and # friend read this message}    |
|                  |                      other {You and # friends read this message} |
+------------------+------------------------------------------------------------------+
| .. icu:: select  | .. code-block:: none                                             |
|                  |                                                                  |
| Select           |    {gender, select, male {He replied to your message}            |
|                  |                     female {She replied to your message}         |
|                  |                     other {They replied to your message}}        |
+------------------+------------------------------------------------------------------+
| .. icu:: ordinal | .. code-block:: none                                             |
|                  |                                                                  |
| Ordinals         |    {count, selectOrdinal, one {1st message}                      |
|                  |                           two {2nd message}                      |
|                  |                           few {3rd message}                      |
|                  |                           other {#th message}}                   |
+------------------+------------------------------------------------------------------+
