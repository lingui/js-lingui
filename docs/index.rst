jsLingui - Seamless i18n in Javascript and React
================================================

Type-checked and intuitive way to internationalize applications in Javascript and React.

   Internationalization is the design and development of a product, application
   or document content that enables easy localization for target audiences that
   vary in culture, region, or language.

   --- `W3C Web Internationalization FAQ <https://www.w3.org/International/questions/qa-i18n>`_

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

.. toctree::
   :maxdepth: 1
   :caption: Guides

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

   Migration from 0.x to 1.x <releases/migration-1>


Indices
-------

* :ref:`genindex`
* :ref:`search`
