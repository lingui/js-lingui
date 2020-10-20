Excluding message catalog build files
=====================================

:cli:`extract` command creates temporary message catalogs per each source file. Also,
:cli:`compile` command generates compiled message catalogs from source ones. All these files
can be safely ignored from VCS and linters.

Can be safely ignored because this files must be created every time you deploy to production, so we encourage to use CI methods to automatize this process.
If you commit it you will produce conflicts, which somebody will need to solve, in this minimized and transpired (basically unreadable to human) file.
In summary, please, **compile always your catalogs**

Replace ``locales`` in paths below with your custom :conf:`localeDir` from configuration.

- ``locales/_build/``
- ``locales/**/*.js``

Git
---

Add following lines to your ``.gitignore``::

   locales/_build/
   locales/**/*.js

ESLint
------

Specify which directories to lint explicitely or add following lines to your
`.eslintignore <https://eslint.org/docs/user-guide/configuring#ignoring-files-and-directories>`_::

   locales/_build/
   locales/**/*.js
