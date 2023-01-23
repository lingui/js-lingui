# Monorepo

If you're using lingui within a monorepo, you need to pass some extra options to `lingui` babel. `{ rootMode: "upward" }` is required to `lingui` find the correct babel config.

``` json
{
 "catalogs": [{
   "path": "<rootDir>/locale/{locale}/messages",
   "include": ["<rootDir>"],
   "exclude": ["**/node_modules/**"]
 }],
 "extractBabelOptions": {
   "rootMode": "upward",
 },
 "format": "po",
 "locales": ["en"],
}
```

In summary, we'll have:

- 1x `babel.config.js` within root
- 1x `lingui.config.js` within root
- And **n**-times `lingui.config.js` per package which extends/overrides from root
