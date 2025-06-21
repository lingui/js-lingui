# Monorepo

If you're using lingui within a monorepo you need:

- 1x `babel.config.js` within root
- 1x `lingui.config.js` within root
- And **n**-times `lingui.config.js` per package which extends/overrides from root
