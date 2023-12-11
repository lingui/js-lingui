# Excluding build files

[`lingui extract`](/docs/ref/cli.md#extract) command creates a message catalog for each source locale. Also, [`lingui compile`](/docs/ref/cli.md#compile) command generates compiled message catalogs from the source ones.

The compiled files can be safely ignored by your version control because these files must be created every time you deploy to production. We recommend you to create the compiled catalogs in CI, as part of your deployment process. Always remember to **use compiled catalogs** in deployments.

## Git

Add following lines to your `.gitignore`:

```ignore title=".gitignore"
your_locale_folder/**/*.js
```
