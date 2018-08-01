jsLingui - Seamless i18n in Javascript and React
================================================

Type-checked and intuitive way to internationalize applications in Javascript and React.

   **Internationalization** is the design and development of a product, application
   or document content that enables easy **localization** for target audiences that
   vary in culture, region, or language.

   --- `W3C Web Internationalization FAQ <https://www.w3.org/International/questions/qa-i18n>`_

Support the project
-------------------

There's ongoing campaign on Indiegogo_ to raise funds for this project. If you want
to support it, please consider donation or share it with your friend.

Key features
------------

* Small and fast - about 6kb gzipped
* Babel plugin for convenient, type-checked way of writing ICU MessageFormat (recommended, but not required)
* CLI for extracting and compiling message catalogs
* Built on standard ICU MessageFormat (might replace react-intl completely)
* Variable interpolation
* Components inside translations (e.g: Read <Link to="...">documentation</Link>.)
* Plurals, Ordinals and Categories (i.e. Select)
* Number and Date formats (from Intl)
* Works with manual and generated message IDs
* Works with in any JS environment, while integration packages brings better performance in target environments (e.g: lingui-react for React)
* High quality build (high test coverage, follows semver, deprecation warnings for breaking changes and migration guides for major releases)

.. figure:: _static/lingui-pitch.png

   Example usecase with React

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

   React <ref/lingui-react>
   CLI <ref/lingui-cli>
   Configuration <ref/lingui-conf>

.. toctree::
   :maxdepth: 1
   :caption: Releases

   Migration from 1.x to 2.x <releases/migration-2>
   Migration from 0.x to 1.x <releases/migration-1>

.. toctree::
   :maxdepth: 1
   :caption: Discussion

   Comparison with react-intl <misc/react-intl>
   Talks and articles about i18n in JavaScript <misc/talks-about-i18n>



Indices
-------

* :ref:`genindex`
* :ref:`search`

.. _Indiegogo: https://igg.me/at/js-lingui/x/4367619
