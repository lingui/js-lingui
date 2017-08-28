# Planned features

- lingui-cli
  - `info` command which prints statistics about catalogs
  - keep catalog with collected messages
    - default format could be reverted to `minimal`, because all information are in default catalog (origin, default, etc)
    
- lingui-react
  - with `defaultRender` option, there's possibility to create debugging component, which reports all texts on the page, highlights missing ones and maybe also allow inline editing (with local server support).
  
# More interesting topics

## webpack loader (🌱 easy)
  
- Compile message catalogs (`import("lingui-loader?messages.i18n.json")`
- ❓ Generate message catalogs on-the-fly from parsed source files (not sure if possible)
- use conventional extensions, `i18n.js` for compiled and `i18n.json` for source message catalogs

## Namespaces (🌿 difficult)

Per-component namespaces: `@Inbox/msg.title`

- it needs to work for 3rd party packages as well, so it's possible to distribute locales along with lib (e.g: `@relative-time/ago.minutes`)
- `lingui extract` should extract messages from 3rd party packages as well when translations are missing

## Code splitting (🌲 challenging)

- Include only messages present source code from chunk + include them in chunk.
- probably requires webpack plugin, similar to *extract css styles*
