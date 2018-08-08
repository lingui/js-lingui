# Change Log

<a name="2.4.0"></a>
## [2.4.0 (unreleased)](https://github.com/lingui/js-lingui/compare/v2.3.0...v2.4.0) (TBA)

Support for Create React App.

### New Features

* New `lingui init` command which detects project type and install all required packages
* `lingui extract` detects ``create-react-app` projects and extracts messages using
  ``rect-app`` babel preset

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
