==================
Pseudolocalization
==================

There is built in support for `pseudolocalization <https://en.wikipedia.org/wiki/Pseudolocalization>`. 
Pseudolocalization is a method for testing the internationalization aspects 
of your application by replacing your strings with altered versions 
and maintaining string readability. It also makes hard coded strings 
and improperly concatenated strings easy to spot so that they can be properly localized.

  Example:
  Ţĥĩś ţēxţ ĩś ƥśēũďōĺōćàĺĩźēď

Configuration
=============

To setup pseudolocalization add :conf:`pseudoLocale` to your lingui :doc:`configuration file </ref/conf>`::

   {
      "lingui": {
         "locale": ["en", "pseudo-LOCALE"],
         "pseudoLocale": "pseudo-LOCALE"
         "fallbackLocales": {
            "pseudo-LOCALE": "en"
         }
      }
   }

:conf:`pseudoLocale` option can be any string that is in :conf:`locale` 

Examples: :conf:`en-PL`, :conf:`pseudo-LOCALE`, :conf:`pseudolocalization` or :conf:`en-UK`

Create pseudolocalization
=========================

PseudoLocale string have to be in :conf:`locales` config as well. 
Otherwise no folder and no pseudolocalization is going to be created.
After running ``yarn extract`` verify that the folder has been created.
The pseudolocalization is automatically created on ``yarn compile`` from messages 
in order specified in :cli:`Preparing catalogs for production`. 
In case fallbackLocales has been used, the pseudolocalization is going to be created from translated fallbacklocale.

Switch browser into specified pseudoLocale
======================================================

We can use browsers settings or extensions. Extensions allow to use any locale.
Browsers are usually limited into valid language tags (BCP 47). 
In that case, the locale for pseudolocalization has to be standard locale,
which is not used in your application for example :conf:`zu_ZA` Zulu - SOUTH AFRICA

Chrome:
a) With extension (valid locale) - https://chrome.google.com/webstore/detail/locale-switcher/kngfjpghaokedippaapkfihdlmmlafcc
b) Without extension (valid locale) - chrome://settings/?search=languages

Firefox:
a) With extension (any string) - https://addons.mozilla.org/en-GB/firefox/addon/quick-accept-language-switc/?src=search
b) Without extension (valid locale) - about:preferences#general > Language
