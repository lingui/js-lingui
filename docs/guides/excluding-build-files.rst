Excluding message catalog build files
=====================================

:cli:`extract` command creates temporary message catalogs per each source file. Also,
:cli:`compile` command generates compiled message catalogs from source ones. All these files
can be safely ignored from VCS and linters.

Replace ``locale`` in paths below with your custom :conf:`localeDir` from configuration.

- ``locale/_build/``
- ``locale/**/*.js``

Git
---

Add following lines to your ``.gitignore``::

   locale/_build/
   locale/**/*.js

ESLint
------

Specify which directories to lint explicitely or add following lines to your
`.eslintignore <https://eslint.org/docs/user-guide/configuring#ignoring-files-and-directories>`_::

   locale/_build/
   locale/**/*.js
