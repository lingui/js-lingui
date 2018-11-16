******************************************************
LinguiJS - Seamless internationalization in Javascript
******************************************************

🌍📖 A readable, automated, and optimized (5 kb) internationalization for JavaScript

   **Internationalization** is the design and development of a product, application
   or document content that enables easy **localization** for target audiences that
   vary in culture, region, or language.

   --- `W3C Web Internationalization FAQ <https://www.w3.org/International/questions/qa-i18n>`_

.. image:: https://img.shields.io/github/stars/lingui/js-lingui.svg?style=social&label=Stars
   :alt: GitHub stars
   :target: https://github.com/lingui/js-lingui/

.. image:: https://img.shields.io/github/watchers/lingui/js-lingui.svg?style=social&label=Follow
   :alt: GitHub followers
   :target: https://github.com/lingui/js-lingui/

Key features
============

Lingui is an easy yet powerfull internationalization framework for global projects.

Clean and readable
   Keep your code clean and readable, while the library uses
   battle-tested and powerful **ICU MessageFormat** under the hood.

Universal
   Use it everywhere. :ref:`@lingui/core <ref-core>` provides the essential intl
   functionality which works in any JavaScript project while :ref:`@lingui/react <ref-react>` offers
   components to leverage React rendering.

Full rich-text support
   Use React components inside localized messages
   without any limitation. Writing rich-text messages is as easy as writing JSX.

Powerful tooling
   Manage the whole intl workflow using Lingui :ref:`CLI <ref-cli>`. It
   extracts messages from source code, validates messages coming from translators and
   checks that all messages are translated before shipping to production.

Unopinionated
   Integrate Lingui into your existing workflow. It supports
   message keys as well as auto generated messages. Translations are stored either in
   JSON or standard PO file, which is supported in almost all translation tools.

Lightweight and optimized
   Core library is only `1.9 kB gzipped <https://bundlephobia.com/result?p=@lingui/react>`_,
   React components are additional `3.1 kBs gzipped <https://bundlephobia.com/result?p=@lingui/core>`_.
   That's less than Redux for a full-featured intl library.

Active community
   Join us on `Gitter`_ to discuss the latest development.
   At the moment, Lingui is the most active intl project on GitHub.

Compatible with react-intl
   Low-level React API is very similar to react-intl
   and the message format is the same. It's easy to migrate existing project.

Quick overview
==============

.. literalinclude:: _static/pitch_keys.js
   :language: jsx

Documentation contents
======================

.. toctree::
   :maxdepth: 1
   :caption: Installation

   Create React App <tutorials/setup-cra>
   React project <tutorials/setup-react>

.. toctree::
   :maxdepth: 1
   :caption: Tutorials

   React <tutorials/react>
   React - common patterns <tutorials/react-patterns>
   React Native <tutorials/react-native>
   JavaScript <tutorials/javascript>
   CLI <tutorials/cli>

.. toctree::
   :maxdepth: 1
   :caption: Guides

   Testing <guides/testing>
   Typescript <guides/typescript>
   Excluding build files <guides/excluding-build-files>
   Dynamic loading of translations <guides/dynamic-loading-catalogs>
   Optimized components <guides/optimized-components>
   How plurals work <guides/plurals>

.. toctree::
   :maxdepth: 1
   :caption: API References

   Core (JavaScript) <ref/core>
   React <ref/react>
   Macros <ref/macro>
   CLI <ref/cli>
   Configuration <ref/conf>
   Webpack Loader <ref/loader>
   Catalog Formats <ref/catalog-formats>
   ICU MessageFormat <ref/message-format>

.. toctree::
   :maxdepth: 1
   :caption: Releases

   Migration from 1.x to 2.x <releases/migration-2>
   Migration from 0.x to 1.x <releases/migration-1>

.. toctree::
   :maxdepth: 1
   :caption: Discussion

   Projects using LinguiJS <misc/showroom>
   Comparison with react-intl <misc/react-intl>
   Talks and articles about i18n in JavaScript <misc/talks-about-i18n>
   RFCs and design decisions <rfc/toc>


Indices
-------

* :ref:`genindex`
* :ref:`search`

.. _Gitter: https://gitter.im/lingui/js-lingui
