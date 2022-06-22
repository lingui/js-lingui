# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.14.0](https://github.com/lingui/js-lingui/compare/v3.13.3...v3.14.0) (2022-06-22)


### Bug Fixes

* Add extra package.json under `/esm` ([#1258](https://github.com/lingui/js-lingui/issues/1258)) ([80cd337](https://github.com/lingui/js-lingui/commit/80cd3378ceb5677bfa50b14f67e4e31703392298))
* Fix error read properties of undefined ([#1239](https://github.com/lingui/js-lingui/issues/1239)) ([8dd2398](https://github.com/lingui/js-lingui/commit/8dd2398e0d1fdce1663b8aee391f6ab2208be77b))
* JSX attribute parsing issue when using html entities ([#1234](https://github.com/lingui/js-lingui/issues/1234)) ([98e9332](https://github.com/lingui/js-lingui/commit/98e93322216ab0fc87b8b545fbdd9263b4b6b76b))


### Features

* Pass props to I18nProvider.defaultComponent in Trans.render style ([#1242](https://github.com/lingui/js-lingui/issues/1242)) ([fe4cac4](https://github.com/lingui/js-lingui/commit/fe4cac4f89ae195ad8b5216fdaede73900753686))





## [3.13.3](https://github.com/lingui/js-lingui/compare/v3.13.2...v3.13.3) (2022-04-24)


### Bug Fixes

* @lingui/react compatible with React 18 ([2a235ba](https://github.com/lingui/js-lingui/commit/2a235baa093d668a0a029ec6c683e9dc00f68f42))
* JSX attribute parsing issue when using double quotes ([#1226](https://github.com/lingui/js-lingui/issues/1226)) ([27a7ded](https://github.com/lingui/js-lingui/commit/27a7ded08be7299417ccebddfd25fa39bda99e77))
* specify children for react v18 types ([#1230](https://github.com/lingui/js-lingui/issues/1230)) ([ee69736](https://github.com/lingui/js-lingui/commit/ee69736089d4c48117d85582b56a26c09cdf82ea))





## [3.13.2](https://github.com/lingui/js-lingui/compare/v3.13.1...v3.13.2) (2022-01-24)


### Bug Fixes

* localeData interpolation broken ([457735b](https://github.com/lingui/js-lingui/commit/457735bb61f0a75d0ce176874b1c67a65c4b3084))





## [3.13.1](https://github.com/lingui/js-lingui/compare/v3.13.0...v3.13.1) (2022-01-21)


### Bug Fixes

* add lingui core to macro peer dependencies ([#1187](https://github.com/lingui/js-lingui/issues/1187)) ([daaa773](https://github.com/lingui/js-lingui/commit/daaa7738c1ca08ee30d5bec4c32214bf665cbfbe))
* cloud service `import()` on case-sensitive filesystems ([#1174](https://github.com/lingui/js-lingui/issues/1174)) ([5feb120](https://github.com/lingui/js-lingui/commit/5feb120e8c75d7b8c082d5c4b68185ef5dcc3ebc))
* i18n.activate should load instantly new messages ([#1182](https://github.com/lingui/js-lingui/issues/1182)) ([f8f47a2](https://github.com/lingui/js-lingui/commit/f8f47a2385fe3d8dd3395c493027de2492509325))
* remove the obsolete `defineMessages` function from the typings. ([#1179](https://github.com/lingui/js-lingui/issues/1179)) ([19b032f](https://github.com/lingui/js-lingui/commit/19b032f2d3634722c6bb9cc69ae3ae6c99773cb7))





# [3.13.0](https://github.com/lingui/js-lingui/compare/v3.12.1...v3.13.0) (2021-11-26)


### Bug Fixes

* pin cli-table to 0.3.6 ([#1172](https://github.com/lingui/js-lingui/issues/1172)) ([b659b18](https://github.com/lingui/js-lingui/commit/b659b1802054d76862663decd9ef49d983e0304e))
* **cli:** extract with --overwrite should fallback to key ([#1166](https://github.com/lingui/js-lingui/issues/1166)) ([e5e9d59](https://github.com/lingui/js-lingui/commit/e5e9d598a2f1a27845b414d8be1927b84f3d8e9c))
* Allow pseudoLocalize to work in @lingui/loader ([#1165](https://github.com/lingui/js-lingui/issues/1165)) ([356c224](https://github.com/lingui/js-lingui/commit/356c224530a0fde730b31602eb6f95c7496f245e))
* don't push pseudoLocale to translation.io provider ([#1161](https://github.com/lingui/js-lingui/issues/1161)) ([5d2186b](https://github.com/lingui/js-lingui/commit/5d2186bccf7721aaef8573a6a6e9764f00c107e6))
* stripping origin if line numbers already strippped ([#1143](https://github.com/lingui/js-lingui/issues/1143)) ([82a3265](https://github.com/lingui/js-lingui/commit/82a32655d2cd362ec4d7164822585cbd3ae5dd6e))


### Features

* **cli:** make extract cmd asynchronous execution ([#1170](https://github.com/lingui/js-lingui/issues/1170)) ([f99d8b1](https://github.com/lingui/js-lingui/commit/f99d8b17f3f05c3caef9481feb142f0b35916f91))
* add the ability to extract concatenated comments ([#1152](https://github.com/lingui/js-lingui/issues/1152)) ([0e553cf](https://github.com/lingui/js-lingui/commit/0e553cf14f5f6dce87839abed76fd21f351a2eae))
* msgctxt support ([#1094](https://github.com/lingui/js-lingui/issues/1094)) ([8ee42cb](https://github.com/lingui/js-lingui/commit/8ee42cbfe26bc6d055748dcf2713ab8ade7ec827))





## [3.12.1](https://github.com/lingui/js-lingui/compare/v3.12.0...v3.12.1) (2021-09-28)


### Bug Fixes

* **types:** correct types for  macro with custom i18n instance ([#1141](https://github.com/lingui/js-lingui/issues/1141)) ([a9bffdd](https://github.com/lingui/js-lingui/commit/a9bffddf2ae0c9b6ab6a48552d085cfd53140cca))





# [3.12.0](https://github.com/lingui/js-lingui/compare/v3.11.1...v3.12.0) (2021-09-28)


### Bug Fixes

* **#1137:** configPath is passed through babel-plugin-extract-messages ([#1140](https://github.com/lingui/js-lingui/issues/1140)) ([8921156](https://github.com/lingui/js-lingui/commit/89211567632733cf9955cafc9c92bd87c6154852)), closes [#1137](https://github.com/lingui/js-lingui/issues/1137)
* Add missing babel properties to config validation ([#1135](https://github.com/lingui/js-lingui/issues/1135)) ([6b2d662](https://github.com/lingui/js-lingui/commit/6b2d6622b715e95b914b14df17501cc486ec45f4))


### Features

* **macro:** Add support for passing custom i18n instance ([#1139](https://github.com/lingui/js-lingui/issues/1139)) ([5cad96f](https://github.com/lingui/js-lingui/commit/5cad96fc68a4219178d6caf6ad5c02e2f68f68fa))





## [3.11.1](https://github.com/lingui/js-lingui/compare/v3.11.0...v3.11.1) (2021-09-07)


### Bug Fixes

* cli and conf needed hotfix for [#1110](https://github.com/lingui/js-lingui/issues/1110) ([1c6378d](https://github.com/lingui/js-lingui/commit/1c6378daa84f77757f99f6e592f6cb0e1fe02ebd))





# [3.11.0](https://github.com/lingui/js-lingui/compare/v3.10.4...v3.11.0) (2021-09-07)


### Bug Fixes

* 'compile --watch' not watching for correct file based on format ([#1088](https://github.com/lingui/js-lingui/issues/1088)) ([ab68c06](https://github.com/lingui/js-lingui/commit/ab68c06775c37bf5960536f274ed35fb2420f6a8))
* add extract-template for po-gettext format ([#1089](https://github.com/lingui/js-lingui/issues/1089)) ([ea00f55](https://github.com/lingui/js-lingui/commit/ea00f551cbae2ae7596f7fe3055cb8442863f53a))
* country-coded language breaks plurals with po-gettext ([#1131](https://github.com/lingui/js-lingui/issues/1131)) ([6b60b8a](https://github.com/lingui/js-lingui/commit/6b60b8af20e7a8e4e74354a870aaa8ef0d25d1e8))
* extractors CLI validation and accept require and require.resolve ([#1126](https://github.com/lingui/js-lingui/issues/1126)) ([c50a06e](https://github.com/lingui/js-lingui/commit/c50a06eac65d71853ec2c29905a0c4883a5cc70d))
* fallbackLocales to false causing unexpected behaviour ([#1123](https://github.com/lingui/js-lingui/issues/1123)) ([60e3952](https://github.com/lingui/js-lingui/commit/60e3952f9e99a6d21992821bff573e42f6ecf5fd))
* fix testing suite [#1098](https://github.com/lingui/js-lingui/issues/1098) ([1144cc7](https://github.com/lingui/js-lingui/commit/1144cc782b25113366245922131e58bc40b2047d))
* keys with leading number was generating bad object keys ([#1127](https://github.com/lingui/js-lingui/issues/1127)) ([8bb2983](https://github.com/lingui/js-lingui/commit/8bb2983fa93e024ba2cb3d2f63262d2495755755))
* no files being found when catalogs.include has more than one entry ([#1108](https://github.com/lingui/js-lingui/issues/1108)) ([04efd85](https://github.com/lingui/js-lingui/commit/04efd85ab5bae72607c06672f5c8da809a45dbcb))
* sideEffects to false for shrinking bundle size ([#1129](https://github.com/lingui/js-lingui/issues/1129)) ([57cd2e5](https://github.com/lingui/js-lingui/commit/57cd2e576945ba30aea30d5cf5bcb27d1f77fe4c))
* unicode chars were removed from .po files when extracting ([#1125](https://github.com/lingui/js-lingui/issues/1125)) ([d688329](https://github.com/lingui/js-lingui/commit/d688329c0457a080d5cd485a95e94ffa5e00c5ae))
* wrong detect whether a translation is plural ([#1119](https://github.com/lingui/js-lingui/issues/1119)) ([48b6644](https://github.com/lingui/js-lingui/commit/48b6644f56d66a80d08ca9d95faca8c04d47eba0))


### Features

* Add debounce option to compile and extract CLI ([#1101](https://github.com/lingui/js-lingui/issues/1101)) ([a13334c](https://github.com/lingui/js-lingui/commit/a13334ceba850bfd50818d66551877867b86d655))
* Cloud service providers & Translation.io ([#1107](https://github.com/lingui/js-lingui/issues/1107)) ([cbc87b5](https://github.com/lingui/js-lingui/commit/cbc87b5dab8daf0cd2217b2a2525dfd12dad7272))





## [3.10.4](https://github.com/lingui/js-lingui/compare/v3.10.3...v3.10.4) (2021-06-16)


### Bug Fixes

* remoteLoader parse complex structures failed [#1087](https://github.com/lingui/js-lingui/issues/1087) ([cee63c4](https://github.com/lingui/js-lingui/commit/cee63c45f1c2bd9efecf6d2a5ff623f2e2af39c2))





## [3.10.3](https://github.com/lingui/js-lingui/compare/v3.10.2...v3.10.3) (2021-06-14)


### Bug Fixes

* add string return type to i18n._ ([#1081](https://github.com/lingui/js-lingui/issues/1081)) ([68d32d6](https://github.com/lingui/js-lingui/commit/68d32d63899c9a0b2c66891070831c6488a7d013))
* remoteLoader pure functional on browser env ([#1085](https://github.com/lingui/js-lingui/issues/1085)) ([85856ac](https://github.com/lingui/js-lingui/commit/85856acfa6b1375ef2c96ce0022ee7fe29b4449f))





## [3.10.2](https://github.com/lingui/js-lingui/compare/v3.10.1...v3.10.2) (2021-06-08)


### Bug Fixes

* remoteLoader should return an object instead of export ([d461695](https://github.com/lingui/js-lingui/commit/d46169598e4b43c5fb5cb686f9b1e8811292e9c6))





## [3.10.1](https://github.com/lingui/js-lingui/compare/v3.10.0...v3.10.1) (2021-06-08)


### Bug Fixes

* reverts reduce size of ESM packages ([#1066](https://github.com/lingui/js-lingui/issues/1066)) ([3a057e0](https://github.com/lingui/js-lingui/commit/3a057e0c61224b98c93203e0d88136fa48f309ba))





# [3.10.0](https://github.com/lingui/js-lingui/compare/v3.9.0...v3.10.0) (2021-06-08)


### Bug Fixes

* po-gettext format issues with CLI ([#1073](https://github.com/lingui/js-lingui/issues/1073)) ([a529aca](https://github.com/lingui/js-lingui/commit/a529aca239b232926b786811f9ac03c9b771417b))
* reduce size of ESM packages ([#1066](https://github.com/lingui/js-lingui/issues/1066)) ([9990eba](https://github.com/lingui/js-lingui/commit/9990ebaa9d30f7e218c106a2abfd7ddbcf0e0170))
* use correct case for PO file header MIME-Version ([#1074](https://github.com/lingui/js-lingui/issues/1074)) ([f31afc5](https://github.com/lingui/js-lingui/commit/f31afc53837f0e67660d2825125f74fc11db8e0b))


### Features

* load remote catalogs with remoteLoader() ([#1080](https://github.com/lingui/js-lingui/issues/1080)) ([e73a4b3](https://github.com/lingui/js-lingui/commit/e73a4b34cf8d83a45044c220148761d79b4fd8a9))





# [3.9.0](https://github.com/lingui/js-lingui/compare/v3.8.10...v3.9.0) (2021-05-18)


### Bug Fixes

* ESM dev entrypoint was causing unexpected behaviors ([#1059](https://github.com/lingui/js-lingui/issues/1059)) ([2b8d70b](https://github.com/lingui/js-lingui/commit/2b8d70b35ed103d94a2f88ea7c6813a29a1d5635))
* lineNumbers false was removing the entire origin ([#1060](https://github.com/lingui/js-lingui/issues/1060)) ([2d25f2c](https://github.com/lingui/js-lingui/commit/2d25f2c5d8f7c624250a1218f83cbe43433c264b))


### Features

* configurable and extendable extractors with Lingui config ([#1065](https://github.com/lingui/js-lingui/issues/1065)) ([263ee59](https://github.com/lingui/js-lingui/commit/263ee59163c94220f5ba3999aa60ca40dc352e0c))





## [3.8.10](https://github.com/lingui/js-lingui/compare/v3.8.9...v3.8.10) (2021-04-19)


### Bug Fixes

* loader works smoothly on webpack 5 & 4 ([#1046](https://github.com/lingui/js-lingui/issues/1046)) ([78ad09f](https://github.com/lingui/js-lingui/commit/78ad09fc88e8ec07daefb455457e778471977f2f))





## [3.8.9](https://github.com/lingui/js-lingui/compare/v3.8.8...v3.8.9) (2021-04-09)


### Bug Fixes

* event emitter refactor (reverted)  ([#1038](https://github.com/lingui/js-lingui/issues/1038)) ([f299493](https://github.com/lingui/js-lingui/commit/f299493999299fe9a7d0e01b9045e7f0a9813c6a))





## [3.8.8](https://github.com/lingui/js-lingui/compare/v3.8.7...v3.8.8) (2021-04-09)


### Bug Fixes

* unicode char was not extracting correctly ([3653f6f](https://github.com/lingui/js-lingui/commit/3653f6f62043a095a2babaf16a54280db9996228))





## [3.8.7](https://github.com/lingui/js-lingui/compare/v3.8.6...v3.8.7) (2021-04-09)


### Bug Fixes

* unicode chars in native environments + event emitter refactor ([#1036](https://github.com/lingui/js-lingui/issues/1036)) ([39fa90d](https://github.com/lingui/js-lingui/commit/39fa90d95c08f105f3f7feb17b65d9b8f916b73a))





## [3.8.6](https://github.com/lingui/js-lingui/compare/v3.8.5...v3.8.6) (2021-04-08)


### Bug Fixes

* unicode chars were extracting with double slashes ([#1035](https://github.com/lingui/js-lingui/issues/1035)) ([aed49b1](https://github.com/lingui/js-lingui/commit/aed49b15f3d13635a4e4a8d19fc4cb9f6e4a6f70))





## [3.8.5](https://github.com/lingui/js-lingui/compare/v3.8.4...v3.8.5) (2021-04-08)


### Bug Fixes

* improve compile log error if bad syntax on the string ([9b2705f](https://github.com/lingui/js-lingui/commit/9b2705feada95f5272346bacee54a26b5518af5e))





## [3.8.4](https://github.com/lingui/js-lingui/compare/v3.8.3...v3.8.4) (2021-04-08)


### Bug Fixes

* respect unicode chars in t macro ([#1032](https://github.com/lingui/js-lingui/issues/1032)) ([7597621](https://github.com/lingui/js-lingui/commit/7597621827f66e81a4e1fdf6ec64c986c9c88c7d))
* typescript loader config ([#1029](https://github.com/lingui/js-lingui/issues/1029)) ([93afb72](https://github.com/lingui/js-lingui/commit/93afb72c1d6235df1516655d5ab4eea0eeb606ee))
* undefined interpolation on t macro ([#1030](https://github.com/lingui/js-lingui/issues/1030)) ([194f9b3](https://github.com/lingui/js-lingui/commit/194f9b318434bcaf4b68af549a6ed246fed2be02))





## [3.8.3](https://github.com/lingui/js-lingui/compare/v3.8.2...v3.8.3) (2021-04-05)


### Bug Fixes

* extract works with template string id's ([#1027](https://github.com/lingui/js-lingui/issues/1027)) ([a17d629](https://github.com/lingui/js-lingui/commit/a17d629d82395cd86cc080648ef2ebe2a9653225))





## [3.8.2](https://github.com/lingui/js-lingui/compare/v3.8.1...v3.8.2) (2021-03-31)

**Note:** Version bump only for package js-lingui-workspaces





## [3.8.1](https://github.com/lingui/js-lingui/compare/v3.8.0...v3.8.1) (2021-03-23)


### Bug Fixes

* fallback locales default not overwritten ([78e4576](https://github.com/lingui/js-lingui/commit/78e45766fda0c147b77f96d71e9d775743ee8d18))





# [3.8.0](https://github.com/lingui/js-lingui/compare/v3.7.2...v3.8.0) (2021-03-23)


### Bug Fixes

* selectOrdinal pseudolocalize insensitive ([16acafe](https://github.com/lingui/js-lingui/commit/16acafe42a2ae1c33200ab9b89bc7a17db69897d))


### Features

* allow to disable lineNumbers ([#1007](https://github.com/lingui/js-lingui/issues/1007)) ([fe67e0f](https://github.com/lingui/js-lingui/commit/fe67e0f7986188bff2c102703c4df3507506e0f2))





## [3.7.2](https://github.com/lingui/js-lingui/compare/v3.7.1...v3.7.2) (2021-03-14)


### Bug Fixes

* lingui extract ignores custom directories as args [#998](https://github.com/lingui/js-lingui/issues/998) ([f426881](https://github.com/lingui/js-lingui/commit/f426881d2b6fb51de06ed43159f56b67a36e2ece))
* webpack 5 issue with jest @lingui/loader [#999](https://github.com/lingui/js-lingui/issues/999) ([9e68a8d](https://github.com/lingui/js-lingui/commit/9e68a8d1e6f3565f724dd027b165e85b1d891c92))





## [3.7.1](https://github.com/lingui/js-lingui/compare/v3.7.0...v3.7.1) (2021-03-07)


### Bug Fixes

* exports attribute on package.json, expo compat ([#997](https://github.com/lingui/js-lingui/issues/997)) ([79aa509](https://github.com/lingui/js-lingui/commit/79aa50998185847064d80f2a38be0ebcb64424f9))





# [3.7.0](https://github.com/lingui/js-lingui/compare/v3.6.0...v3.7.0) (2021-03-04)


### Bug Fixes

* @lingui/cli type error when catalog is missing ([#988](https://github.com/lingui/js-lingui/issues/988)) ([8c44af2](https://github.com/lingui/js-lingui/commit/8c44af2442f979ae60de8059e68436508cdc8f74))
* macro components should omit key prop [#994](https://github.com/lingui/js-lingui/issues/994) ([f2a4da0](https://github.com/lingui/js-lingui/commit/f2a4da08542567b77fc2ae8ebf9385f6d8055f6f))
* Report correct number of missing messages in strict mode ([#992](https://github.com/lingui/js-lingui/issues/992)) ([128f3e2](https://github.com/lingui/js-lingui/commit/128f3e237daef838e18e73818fc681609e4bc131))
* use pkgUp.sync to localize package.json ([#985](https://github.com/lingui/js-lingui/issues/985)) ([18d985d](https://github.com/lingui/js-lingui/commit/18d985dd414276d07a1f7ffc7e21ffa5e0dadc36))


### Features

* raise event on missing translation ([#993](https://github.com/lingui/js-lingui/issues/993)) ([ecf83c3](https://github.com/lingui/js-lingui/commit/ecf83c37e177cb10f157fb8913d73e18662e3ca4))





# [3.6.0](https://github.com/lingui/js-lingui/compare/v3.5.1...v3.6.0) (2021-02-23)


### Features

* --watch mode for extract and compile ([#974](https://github.com/lingui/js-lingui/issues/974)) ([a4f90ee](https://github.com/lingui/js-lingui/commit/a4f90ee1cedf3726908104f535b9a8985a444363))
* ship universal modules with ESM ([#979](https://github.com/lingui/js-lingui/issues/979)) ([6cd5fe0](https://github.com/lingui/js-lingui/commit/6cd5fe0a71dd5cf7e0832bd3e9902a2f6ba789f6))





## [3.5.1](https://github.com/lingui/js-lingui/compare/v3.5.0...v3.5.1) (2021-02-09)


### Bug Fixes

* @lingui/macro types for global environments ([#973](https://github.com/lingui/js-lingui/issues/973)) ([92a5ce7](https://github.com/lingui/js-lingui/commit/92a5ce786d979d4bd0f65a50962fdb3bd27d91d7))
* runtimeConfigModule config validation ([#972](https://github.com/lingui/js-lingui/issues/972)) ([5656c95](https://github.com/lingui/js-lingui/commit/5656c95b8b2ecfdfe903a941918c60abe16e1691))
* **@lingui/loader:** accept webpack 5.x as a peer dependency ([#971](https://github.com/lingui/js-lingui/issues/971)) ([b9683cc](https://github.com/lingui/js-lingui/commit/b9683cc3f1274efab805d6143398d78fbb3310c5))





# [3.5.0](https://github.com/lingui/js-lingui/compare/v3.4.0...v3.5.0) (2021-02-02)


### Bug Fixes

* @lingui/conf lodash.get dependency ([#950](https://github.com/lingui/js-lingui/issues/950)) ([f7b59ab](https://github.com/lingui/js-lingui/commit/f7b59abbcfc8bd797478a549641ca9e3b97a9701))
* Select /> pseudolocalization ([#961](https://github.com/lingui/js-lingui/issues/961)) ([f1e1a25](https://github.com/lingui/js-lingui/commit/f1e1a25acd654c9877147ce3f40bc827bc54987a))
* I18nProvider defaultComponent typing ([#953](https://github.com/lingui/js-lingui/issues/953)) ([6b08dd3](https://github.com/lingui/js-lingui/commit/6b08dd309d1ac8e0a8dc081e097e69678e822eda))
* message when translations are missing ([#964](https://github.com/lingui/js-lingui/issues/964)) ([14f24f2](https://github.com/lingui/js-lingui/commit/14f24f2725771dcea0793de146abc9b86ea88789))
* NODE_ENV=production crashes lingui extract [#952](https://github.com/lingui/js-lingui/issues/952) ([f368b35](https://github.com/lingui/js-lingui/commit/f368b353e975dab4024b755eb9d70f48b535a693))
* obsolete flag disable when using extract [files] ([#967](https://github.com/lingui/js-lingui/issues/967)) ([0ea63e9](https://github.com/lingui/js-lingui/commit/0ea63e9a0b5cd2463fca18621e6dba16642f4d00))
* React macros fixes ([#958](https://github.com/lingui/js-lingui/issues/958)) ([353c537](https://github.com/lingui/js-lingui/commit/353c5379a22473293aafcb4651db387e72c82a7a))
* wrong typing of Trans macro component prop ([#960](https://github.com/lingui/js-lingui/issues/960)) ([57482c0](https://github.com/lingui/js-lingui/commit/57482c0f1ecab7c266628e7c9be2bd10538c7a57))
* **docs:** documentation-typos ([#955](https://github.com/lingui/js-lingui/issues/955)) ([f73cb8c](https://github.com/lingui/js-lingui/commit/f73cb8c09d9919489f5fbb9a539da30faae53004))


### Features

* Introduced @lingui/snowpack-plugin ([#947](https://github.com/lingui/js-lingui/issues/947)) ([96bd31b](https://github.com/lingui/js-lingui/commit/96bd31b54d5ebfa2e28c96e14ee92d43b4199ae5))





# [3.4.0](https://github.com/lingui/js-lingui/compare/v3.3.0...v3.4.0) (2021-01-13)


### Bug Fixes

* added return type to i18n._ ([#922](https://github.com/lingui/js-lingui/issues/922)) ([249c486](https://github.com/lingui/js-lingui/commit/249c486d258a4fb44bae1e3da1765e00003429a7))
* compilerBabelOptions warning with jest-validate ([#938](https://github.com/lingui/js-lingui/issues/938)) ([087ec1f](https://github.com/lingui/js-lingui/commit/087ec1fe45076bcfc8ea3a6f7657f39bbe1c1d58))
* Last scaped brackets were not unscaped ([db2f768](https://github.com/lingui/js-lingui/commit/db2f7684f4a8b6babe1c87fef9fb2775ebf3a97c))
* Use LINGUI_CONFIG env as fallback for extract ([#932](https://github.com/lingui/js-lingui/issues/932)) ([ce71a8b](https://github.com/lingui/js-lingui/commit/ce71a8bc6f7b7bb9d1f3c46d473dc5e700a6b6b5))
* **detect-locale:** ESM import not published ([#926](https://github.com/lingui/js-lingui/issues/926)) ([4ad90d4](https://github.com/lingui/js-lingui/commit/4ad90d4c60b752e9f0d82f3dd71936711c51573d))
* prevent adding undefined msgid to messages ([#915](https://github.com/lingui/js-lingui/issues/915)) ([3afacec](https://github.com/lingui/js-lingui/commit/3afaceccb669b59ee2f5b42ee2e138646ccdb79d))


### Features

* Lingui compiles to typescript files ([#942](https://github.com/lingui/js-lingui/issues/942)) ([10bce7d](https://github.com/lingui/js-lingui/commit/10bce7dc890f208dc71bcf81dc34e57d389544fe))
* Support lingui config in multiple formats ([#941](https://github.com/lingui/js-lingui/issues/941)) ([8631111](https://github.com/lingui/js-lingui/commit/8631111a83c5f2fb87e7b6d794a279dbf7e8579d))





# [3.3.0](https://github.com/lingui/js-lingui/compare/v3.2.3...v3.3.0) (2020-12-08)


### Bug Fixes

* accept pseudolocalization in SelectOrdinal ([#903](https://github.com/lingui/js-lingui/issues/903)) ([d4c24bf](https://github.com/lingui/js-lingui/commit/d4c24bf6bbb1a6eeb651b1a70490b10f502a28c6))
* formatters exceptions throw error ([#889](https://github.com/lingui/js-lingui/issues/889)) ([d6b774c](https://github.com/lingui/js-lingui/commit/d6b774cf53dd4bf691a228d3f05edaea2442b121))
* macro underscore type ([#884](https://github.com/lingui/js-lingui/issues/884)) ([5cade19](https://github.com/lingui/js-lingui/commit/5cade1924dd038ba73ff85cdcf7ce80d31ddbd0f))
* plural pseudolocalization with offset ([#887](https://github.com/lingui/js-lingui/issues/887)) ([3d54b4d](https://github.com/lingui/js-lingui/commit/3d54b4d9b10b731733a385306263de2da08100ec))
* scaped literals double backslash formatting ([#898](https://github.com/lingui/js-lingui/issues/898)) ([fc8c628](https://github.com/lingui/js-lingui/commit/fc8c628e05522167c5ad76e2cb8c6161be95b8b4))
* select prop types ([#890](https://github.com/lingui/js-lingui/issues/890)) ([672fb1f](https://github.com/lingui/js-lingui/commit/672fb1f5731fe0abeb2fa7ea0de78827e547873c))


### Features

* add support for runtimeConfigModule w/ Trans ([#895](https://github.com/lingui/js-lingui/issues/895)) ([23b06b5](https://github.com/lingui/js-lingui/commit/23b06b5dfbf0db306cdfab83801898caceb5a8b0))
* config accepts compilerBabelOptions ([#906](https://github.com/lingui/js-lingui/issues/906)) ([38d01ef](https://github.com/lingui/js-lingui/commit/38d01ef13a7867460b68ab709f94a17176a21f25))
* extract messages from specific files ([#881](https://github.com/lingui/js-lingui/issues/881)) ([82dea5f](https://github.com/lingui/js-lingui/commit/82dea5f35b55cbb039a48e49fc94dbfbbaca7df9))
* Implement gettext plurals for PO files ([#677](https://github.com/lingui/js-lingui/issues/677)) ([415b90e](https://github.com/lingui/js-lingui/commit/415b90e0abfb24bb7170a5ba7630a4ead94898dd))





## [3.2.3](https://github.com/lingui/js-lingui/compare/v3.2.2...v3.2.3) (2020-11-22)


### Bug Fixes

* export TransRenderProps from @lingui/react ([#877](https://github.com/lingui/js-lingui/issues/877)) ([3db9d6b](https://github.com/lingui/js-lingui/commit/3db9d6b0bfe9edae99523cd706de6826f67184ad))
* omit i18n prop in withI18n typescript interface ([#879](https://github.com/lingui/js-lingui/issues/879)) ([5927d42](https://github.com/lingui/js-lingui/commit/5927d42b256d1adfb26ed03367e521bfc8f1e2e6))





## [3.2.2](https://github.com/lingui/js-lingui/compare/v3.2.1...v3.2.2) (2020-11-20)


### Bug Fixes

* fallbackLocales overriden if parent found ([a53e12f](https://github.com/lingui/js-lingui/commit/a53e12f19cebeb6412debc9dace0b4a45aa17624))
* locale not present in catalogs warn ([6f598e8](https://github.com/lingui/js-lingui/commit/6f598e81bb3278722b995d69daad3f5cdc492284))
* parse template strings in t and defineMessage macros ([#862](https://github.com/lingui/js-lingui/issues/862)) ([024a7e6](https://github.com/lingui/js-lingui/commit/024a7e61e8d76efc2b4a8dd3bb4e0a3932945496))





# [3.2.0](https://github.com/lingui/js-lingui/compare/v3.1.0...v3.2.0) (2020-11-12)


### Bug Fixes

* absolute rootDir on Windows ([#853](https://github.com/lingui/js-lingui/issues/853)) ([f4eabf9](https://github.com/lingui/js-lingui/commit/f4eabf9fdfa04d23009dda00717344e161f1f8f7))
* MessageDescriptor values type ([#848](https://github.com/lingui/js-lingui/issues/848)) ([9712d94](https://github.com/lingui/js-lingui/commit/9712d94d043c8d40cbc5d017474b5938eb02f8d6))
* t macro as function not extracting ([#846](https://github.com/lingui/js-lingui/issues/846)) ([d819bfc](https://github.com/lingui/js-lingui/commit/d819bfc74707a8766bfe1b1a3d43edce97f8f265))


### Features

* extract multiple comments per translation ID ([#854](https://github.com/lingui/js-lingui/issues/854)) ([c849c9c](https://github.com/lingui/js-lingui/commit/c849c9c024832aa7b07e5f837791e287c3aebe29))





# [3.1.0](https://github.com/lingui/js-lingui/compare/v3.0.3...v3.1.0) (2020-11-10)


### Bug Fixes

* accept catalog paths without ending slash ([#812](https://github.com/lingui/js-lingui/issues/812)) ([5d39586](https://github.com/lingui/js-lingui/commit/5d3958638913d5f6b6d318bf21ce4f3019a69e88))
* add type for t macro as function ([#821](https://github.com/lingui/js-lingui/issues/821)) ([7f09c2d](https://github.com/lingui/js-lingui/commit/7f09c2d4ddd88d885a5df23e1b0c267f937abaaf))
* cache ([c57be58](https://github.com/lingui/js-lingui/commit/c57be58f8e8eb17240241f444f79d699d73540bd))
* ensure render of I18nProvider in async scenarios ([#839](https://github.com/lingui/js-lingui/issues/839)) ([cd2816a](https://github.com/lingui/js-lingui/commit/cd2816a3d847042029c9b29dfb420f2ff5ae02cc))
* fix exit code on compile --strict errors ([#825](https://github.com/lingui/js-lingui/issues/825)) ([69a80e2](https://github.com/lingui/js-lingui/commit/69a80e2b0b5061c657e63835355207be199db692))
* improved performance of formatters ([#818](https://github.com/lingui/js-lingui/issues/818)) ([22667ad](https://github.com/lingui/js-lingui/commit/22667adba5b07cc94abacff8e8b5f5b19202576c))
* mandatory ext on @lingui/loader ([#831](https://github.com/lingui/js-lingui/issues/831)) ([8979aaf](https://github.com/lingui/js-lingui/commit/8979aaf81e5f839a8406d3ac7516205113944c39))
* show error when plurals aren't loaded ([#824](https://github.com/lingui/js-lingui/issues/824)) ([296b6a1](https://github.com/lingui/js-lingui/commit/296b6a1a1f332064f040cc987c4359411d307258))


### Features

* accept t as function ([c0c08ba](https://github.com/lingui/js-lingui/commit/c0c08bab0f16d526d1f69734d6d0e5e1a89edd68))
* add cli option to extract only a specific locale ([#816](https://github.com/lingui/js-lingui/issues/816)) ([49f45b2](https://github.com/lingui/js-lingui/commit/49f45b24a58f79e1f6de9c279b0c033d593d7854))
* enable pseudolocalization from pseudolocale folder ([#836](https://github.com/lingui/js-lingui/issues/836)) ([f1e0078](https://github.com/lingui/js-lingui/commit/f1e0078b9892cd7a95a6ad8105f1a3b41bc3b88b))
* lookup lingui command suggestions in package.json ([#823](https://github.com/lingui/js-lingui/issues/823)) ([d58dc09](https://github.com/lingui/js-lingui/commit/d58dc09554cb7054a3463b9f1b53297338322d66))
* use fallback locales from cldr ([#820](https://github.com/lingui/js-lingui/issues/820)) ([2d9e124](https://github.com/lingui/js-lingui/commit/2d9e124b91f1ba7a65e9f997a3ba952679c6c23a))


### Reverts

* Revert "chore: improved commit-lint" ([75fcf65](https://github.com/lingui/js-lingui/commit/75fcf65d509ef0e628332fabdc17864beacdadc3))





# Change Log

<a name="3.0.3"></a>
## [3.0.3](https://github.com/lingui/js-lingui/compare/v3.0.2..v3.0.3) (2020-11-01)

### Bug Fixes

* Handle multiple paths in catalogs.include ([#803](https://github.com/lingui/js-lingui/pull/803)).

<a name="3.0.2"></a>
## [3.0.2](https://github.com/lingui/js-lingui/compare/v3.0.1..v3.0.2) (2020-11-01)

### Bug Fixes

* Minor fixes in @lingui/macro and @lingui/react types

<a name="3.0.1"></a>
## [3.0.1](https://github.com/lingui/js-lingui/compare/v3.0.0..v3.0.1) (2020-11-01)

### Bug Fixes

* Fix catalog include paths on Windows ([#802](https://github.com/lingui/js-lingui/pull/802)).
* Fix type of Trans component ([#801](https://github.com/lingui/js-lingui/pull/801)).
* Accept React 17 as a peer dependency ([#789](https://github.com/lingui/js-lingui/pull/789)).
* Allow null overrides for render and component props ([#799](https://github.com/lingui/js-lingui/pull/799)).
  Thanks to [Declan Haigh](https://github.com/dhaigh)

<a name="3.0.0"></a>
## [3.0.0](https://github.com/lingui/js-lingui/compare/v2.9.1..v3.0.0) (2020-11-01)

See [migration guide](https://lingui.js.org/releases/migration-3.html) for a full changelog.

<a name="2.9.1"></a>
## [2.9.1](https://github.com/lingui/js-lingui/compare/v2.9.0..v2.9.1) (2020-01-18)

### Bug Fixes

* Fix import of typescript package ([#611](https://github.com/lingui/js-lingui/pull/611)).
  Thanks to [Anton Korzunov](https://github.com/theKashey)
* Fix flow types of withI18n ([#605](https://github.com/lingui/js-lingui/pull/605)).
  Thanks to [Kamil Tunkiewicz](https://github.com/ktunkiewicz)

<a name="2.9.0"></a>
## [2.9.0](https://github.com/lingui/js-lingui/compare/v2.8.3...v2.9.0) (2019-12-02)

### New Features

* Add optional sort by origin/filename ([#563](https://github.com/lingui/js-lingui/issues/563)).
  Thanks to [Kenneth Skovhus](https://github.com/skovhus)
* Lazily split messages by value tags ([#593](https://github.com/lingui/js-lingui/issues/593)).
  Thanks to [Danny Sellers](https://github.com/dannysellers)
* Optional line numbers for lingui format ([#587](https://github.com/lingui/js-lingui/issues/587)).
  Thanks to [Martti Roitto](https://github.com/MarttiR)
* Moved typescript dependency to peer ([#589](https://github.com/lingui/js-lingui/issues/589)).
  Thanks to [Daniel K.](https://github.com/FredyC)

### Bug Fixes

* Compile strict skips pseudo locale ([#584](https://github.com/lingui/js-lingui/issues/584)).
  Thanks to [Daniel Chabr](https://github.com/danielchabr)

<a name="2.8.3"></a>
## [2.8.3](https://github.com/lingui/js-lingui/compare/v2.8.2...v2.8.3) (2019-05-22)

### Bug Fixes

* Loader: Fix type error when no loader config is provided
* Macro: `babel-plugin-macros` are peer dependency and must be installed manually

<a name="2.8.2"></a>
## [2.8.2](https://github.com/lingui/js-lingui/compare/v2.8.0...v2.8.2) (2019-05-22)

### Bug Fixes

* CLI: Don't warn about conflicting default message if it's empty ([#502](https://github.com/lingui/js-lingui/pull/502/)).
  Thanks to [Filip Žmuk](https://github.com/filipcro).
* Conf: Pass config path to getConfig explicitly instead reading it from process.argv ([#509](https://github.com/lingui/js-lingui/pull/509/)).
  Thanks to [Brandon Croft](https://github.com/brandonc).

<a name="2.8.0"></a>
## [2.8.0](https://github.com/lingui/js-lingui/compare/v2.7.4...v2.8.0) (2019-05-17)

### New Features

* Conf: Allow loading specific configuration file using --config argument ([#501](https://github.com/lingui/js-lingui/pull/501/)).
  Thanks to [Brandon Croft](https://github.com/brandonc).

### Bug Fixes
* Macro: Fix escaped backticks in template string ([#477](https://github.com/lingui/js-lingui/pull/477/)).
  Thanks to [Saxon Landers](https://github.com/ackwell).

<a name="2.7.4"></a>
## [2.7.4](https://github.com/lingui/js-lingui/compare/v2.7.3...v2.7.4) (2019-02-19)

### Bug Fixes

* Conf: Allow `extends` and `rootMode` babel config options ([#454](https://github.com/lingui/js-lingui/pull/454/)).
  Thanks to [Adam Thomas](https://github.com/adamscybot).
* React: Fix flow typing with Flow 0.92 ([#448](https://github.com/lingui/js-lingui/pull/448/)).
  Thanks to [Florian Rival](https://github.com/4ian).

<a name="2.7.3"></a>
## [2.7.3](https://github.com/lingui/js-lingui/compare/v2.7.2...v2.7.3) (2019-01-28)

- Export `@lingui/core/dev` subpackage.

### Bug Fixes

* CLI: Log original info with Babel compatibility info ([#401](https://github.com/lingui/js-lingui/issues/401)).
  Thanks to [Sam Gluck](https://github.com/sdgluck).
* CLI: Allow pseudolocales which don't start with a known language ([#411](https://github.com/lingui/js-lingui/issues/411)).
  Thanks to [Eric Plumb](https://github.com/professorplumb).
* CLI: Made pseudolocales to take into account variable names ([#419](https://github.com/lingui/js-lingui/issues/419)).
  Thanks to [Cornel Stefanache](https://github.com/cstefanache).
* CLI: Fix edge case bug in plural pseudolocalization ([#428](https://github.com/lingui/js-lingui/issues/428)).
  Thanks to [Eric Plumb](https://github.com/professorplumb).
* CLI: Fix yarn detection with nps ([#441](https://github.com/lingui/js-lingui/issues/441)).
  Thanks to [MU AOHUA](https://github.com/AOHUA).
  

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
