# Change Log

<a name="2.7.2"></a>
## [2.7.2](https://github.com/lingui/js-lingui/compare/v2.7.1...v2.7.2) (2018-11-14)

### Bug Fixes

* CLI: show more accurate follow-up commands (e.g. show `use (yarn compile) ...` instead of `use (lingui compile) ...` when CLI is invoked using `yarn extract`)
* CLI: add missing export (regression introduced by [#381](https://github.com/lingui/js-lingui/pull/381))

<a name="2.7.1"></a>
## [2.7.1](https://github.com/lingui/js-lingui/compare/v2.7.0...v2.7.1) (2018-11-12)

### Bug Fixes

* CLI: remove "macros" from the list of babel plugins ([#360](https://github.com/lingui/js-lingui/pull/360)).
  Thanks to [Jérôme Steunou](https://github.com/JSteunou).
* Macro: fix ICU message for nested selects ([#365](https://github.com/lingui/js-lingui/pull/365)).
  Thanks to [Maxim Zemskov](https://github.com/Nodge).
* CLI: allow leading space in i18n description comments ([#366](https://github.com/lingui/js-lingui/pull/366)).
  Thanks to [Maxim Zemskov](https://github.com/Nodge).
* Disable Google Clojure Compiler rewritePolyfills behavior ([#374](https://github.com/lingui/js-lingui/pull/374)).
  Thanks to [Ivan Khilko](https://github.com/ikhilko).
* Show hint for missing babel-core package ([#381](https://github.com/lingui/js-lingui/pull/381)).
* Fix message extracting when Trans component is missing ([#389](https://github.com/lingui/js-lingui/pull/389)).

<a name="2.7.0"></a>
## [2.7.0](https://github.com/lingui/js-lingui/compare/v2.6.1...v2.7.0) (2018-09-10)

🔥 Babel Macros 🎣 are finally released! After few weeks of fiddling with API, i18n macros
are finally out without a breaking release. This is the first part of 
[RFC-001](https://lingui.js.org/rfc/001_macros_message_descriptors.html), final form
be delivered in next release.

**Important:** Macros are completely optional and Babel plugins will work until v3.
It's not mandatory to migrate to macro, but recommended.

### New Features

* New package [`@lingui/macro`](https://www.npmjs.com/package/@lingui/macro) published ([#318](https://github.com/lingui/js-lingui/issues/318)).
  Big thanks to [Matt Labrum](https://github.com/mlabrum) for initial implementation.
* [Pseudolocalization](https://lingui.js.org/tutorials/cli.html#pseudolocalization)
  ([#309](https://github.com/lingui/js-lingui/issues/309)).
  Thanks to [Martin Cerny](https://github.com/MartinCerny-awin).
* Extract description of messages ([#197](https://github.com/lingui/js-lingui/issues/197)).
* Add `i18n.date` and `i18n.number` methods ([#299](https://github.com/lingui/js-lingui/issues/299)).

### Bug Fixes

* CLI: how help for unrecognized commands ([#308](https://github.com/lingui/js-lingui/issues/308)).
  Thanks to [An Nguyen](https://github.com/dephiros).
* Fix Flow types ([#306](https://github.com/lingui/js-lingui/issues/306)).


<a name="2.6.1"></a>
## [2.6.1](https://github.com/lingui/js-lingui/compare/v2.6.0...v2.6.1) (2018-09-03)

### Bug Fixes

* `@lingui/cli` - Remove opencollective dependency

<a name="2.6.0"></a>
## [2.6.0](https://github.com/lingui/js-lingui/compare/v2.5.0...v2.6.0) (2018-08-31)

### New Features

* Configuration - add [`extractBabelOptions`](https://lingui.js.org/ref/conf.html#extractbabeloptions)
  ([#287](https://github.com/lingui/js-lingui/issues/287)). Thanks to [Daniel K.](https://github.com/FredyC).
* `lingui extract` - add [`--namespace`](https://lingui.js.org/ref/cli.html#cmdoption-compile-namespace)
   option and [`compileNamespace`](https://lingui.js.org/ref/conf.html#compilenamespace)
   config ([#295](https://github.com/lingui/js-lingui/issues/295)). Thanks to [An Nguyen](https://github.com/dephiros).

### Bug Fixes

* Update peer-dependency on babel-core ([#286](https://github.com/lingui/js-lingui/issues/286)).
* Output multiple origins on separate line in PO format ([#290](https://github.com/lingui/js-lingui/issues/290)).
* Keep headers in PO format ([#294](https://github.com/lingui/js-lingui/issues/294)).
  Thanks to [Daniel K.](https://github.com/FredyC).
* `lingui extract` - set default BABEL_ENV (required by `react-app` preset) ([#300](https://github.com/lingui/js-lingui/issues/300)).
* Fix `@lingui/loader` compatibility with Webpack 4 ([#297](https://github.com/lingui/js-lingui/issues/297)).
* Fix [`I18n`](https://lingui.js.org/ref/react.html#i18n) render prop component to not
  unmount children component between renders ([#302](https://github.com/lingui/js-lingui/issues/302)).

<a name="2.5.0"></a>
## [2.5.0](https://github.com/lingui/js-lingui/compare/v2.4.2...v2.5.0) (2018-08-24)

### New Features

* Disable eslint for compiled catalogs ([#279](https://github.com/lingui/js-lingui/issues/279)). Thanks to [Benoît Grélard](https://github.com/artisologic).
* Add [`I18n`](https://lingui.js.org/ref/react.html#i18n) render prop component ([#282](https://github.com/lingui/js-lingui/issues/282))

### Bug Fixes

* Handle message compile errors in development ([#283](https://github.com/lingui/js-lingui/issues/283))

<a name="2.4.2"></a>
## [2.4.2](https://github.com/lingui/js-lingui/compare/v2.4.1...v2.4.2) (2018-08-19)

### Bug Fixes

* `lingui init` - add missing command ([#270](https://github.com/lingui/js-lingui/issues/270))

<a name="2.4.1"></a>
## [2.4.1](https://github.com/lingui/js-lingui/compare/v2.4.0...v2.4.1) (2018-08-10)

### Bug Fixes

* `lingui extract` - fix path separator on Windows ([#262](https://github.com/lingui/js-lingui/issues/262))
* `lingui extract` - fix extracting from typescript files ([#260](https://github.com/lingui/js-lingui/issues/260))

<a name="2.4.0"></a>
## [2.4.0](https://github.com/lingui/js-lingui/compare/v2.3.0...v2.4.0) (2018-08-09)

Better support for custom file formats and initial support for Create React App.

### New Features

* New message catalog format: [Gettext PO file](https://lingui.github.io/js-lingui/ref/conf.html#po)
  ([#256](https://github.com/lingui/js-lingui/issues/256))
* New [`lingui init`](https://lingui.github.io/js-lingui/ref/cli.html#init) command
  which detects project type and install all required packages ([#253](https://github.com/lingui/js-lingui/pull/253))
* Allow customize messages for missing translations ([#255](https://github.com/lingui/js-lingui/issues/255))
* `lingui extract` detects `create-react-app` projects and extracts messages using
  `rect-app` babel preset

### Bug Fixes

* `lingui add-locale` accepts any valid BCP-47 locale ([#182](https://github.com/lingui/js-lingui/issues/182))
* Flow types are correctly exported for all packages ([#250](https://github.com/lingui/js-lingui/issues/250))

<a name="2.3.0"></a>
## [2.3.0](https://github.com/lingui/js-lingui/compare/v2.2.0...v2.3.0) (2018-07-23)

Long-awaited backlog grooming.

### New Features

* Add support for locales (aka cultures) ([#170](https://github.com/lingui/js-lingui/pull/170)). Thanks to [Cristi Ingineru](https://github.com/cristiingineru).
* Allow React elements to be used as message variables ([#183](https://github.com/lingui/js-lingui/issues/183))
* Support both Babel 6.x and 7.x ([#171](https://github.com/lingui/js-lingui/issues/171), [#232](https://github.com/lingui/js-lingui/issues/232), [#238](https://github.com/lingui/js-lingui/issues/238))
* `withI18n` hoists statics of wrapped component ([#166](https://github.com/lingui/js-lingui/issues/166))
* `Date` and `i18n.date` accepts date as a string ([#155](https://github.com/lingui/js-lingui/issues/155))
* `lingui extract` shows progress ([#180](https://github.com/lingui/js-lingui/issues/180))
* `lingui extract` throws an error when encountering different defaults for the same message ([#200](https://github.com/lingui/js-lingui/issues/200))
* `lingui compile` shows useful error when message has syntax errors ([#191](https://github.com/lingui/js-lingui/issues/191))

### Bug Fixes

* Fix internal catalog names to avoid collisions. Internal catalogs are named `<original_filename>.json`, eg: `App.js.json` ([#244](https://github.com/lingui/js-lingui/issues/244))

### Docs

* [React Native Tutorial](https://lingui.github.io/js-lingui/tutorials/react-native.html) ([#243](https://github.com/lingui/js-lingui/pull/243)). Thanks to [Vojtech Novak](https://github.com/vonovak).
* Add draft of [Testing Guide](https://lingui.github.io/js-lingui/guides/testing.html)
* Add section with [external resources](https://lingui.github.io/js-lingui/misc/talks-about-i18n.html)
* Several fixes by [Vincent Ricard](https://github.com/ghostd) ([#242](https://github.com/lingui/js-lingui/pull/242))

<a name="2.2.0"></a>
## [2.2.0](https://github.com/lingui/js-lingui/compare/v2.1.2...v2.2.0) (2018-07-04)

Release dedicated to **command line interface**. 

### New Features

* Load jsLingui configuration from separate file ([#209](https://github.com/lingui/js-lingui/pull/209)). Thanks to [Vincent Ricard](https://github.com/ghostd).
* Add [--overwrite](https://lingui.github.io/js-lingui/ref/lingui-cli.html#cmdoption-extract-overwrite)
  option which forces overwrite of translations in minimal `format` for `sourceLocale` from source code. ([#199](https://github.com/lingui/js-lingui/issues/199))
* Order messages in catalogs alphabetically by message ID ([#230](https://github.com/lingui/js-lingui/issues/230)). Thanks to [David Reeß](https://github.com/queicherius).
* Add TypeScript extractor ([#228](https://github.com/lingui/js-lingui/pull/228)). Thanks to [Jeow Li Huan](https://github.com/huan086).
* Pass extra Babel options to extractor ([#226](https://github.com/lingui/js-lingui/pull/226)). Thanks to [Jan Willem Henckel](https://github.com/djfarly).

### Bug Fixes

* Mark all messages in file as obsolete when file is completely removed ([#235](https://github.com/lingui/js-lingui/pull/235))
* Support locales with hyphens in cli compile ([#231](https://github.com/lingui/js-lingui/issues/231)). Thanks to [Leonardo Dino](https://github.com/leonardodino).
* Extract with format minimal does not set defaults ([#222](https://github.com/lingui/js-lingui/issues/222))
* Use generated message as a default one in sourceLocale catalog ([#212](https://github.com/lingui/js-lingui/issues/212))
