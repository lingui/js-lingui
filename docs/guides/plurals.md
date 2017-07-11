Pluralization
=============

Plurals are essential when dealing with internationalization. **jsLingui**
uses [CLDR Plural Rules][cldrPluralRules]. In general, there're 6 plural 
forms (taken from [CLDR Plurals][cldrPlurals] page):

- zero
- one (singular)
- two (dual)
- few (paucal)
- many (also used for fractions if they have a separate class)
- other (required—general plural form—also used if the language only has a single form)

Only the last one, *other*, is required because it's the only common plural form
used in all languages.

All other plural forms depends on language. For example English has only two:
*one* and *other* (1 book vs. 2 books). In Czech, we have three: *one*, *few*, 
*many* (1 kniha, 2 knihy, 5 knih). Some languages have even more, like Russian 
and Arabic.

## Using plural forms

Good thing is that **as a developers, we have to know only plural forms for 
the source language**. 

If we use English in the source code, then we'll use only *one* and *other*:

```js
i18n.plural({
  count: numBooks,
  one: "# book",
  other: "# books"
})
```

When `numBooks == 1`, this will render as *1 book* and for `numBook == 2` it
will be *2 books*. 

> Funny fact for non-english speakers: 0 uses plural form too, *0 books*.

Under the hood, `i18n.plural` is replaced with low-level `i18n._` call. Examle
above will become in production:

```js
i18n._('{numBooks, plural, one {# book} other {# books}}', { values: { numBooks }})
```

When we extract messages from source code using [lingui-cli][linguiCliTutorial], we get:

```
{numBooks, plural, one {# book} other {# books}}
```

Now, we give it to our Czech translator and they'll translate it as:

```
{numBooks, plural, one {# kniha} few {# knihy} other {# knih}}
```

The importing thing is that *we don't need to change our code to support
languages with different plural rules*. Here's a step-by-step description of
the process:

1. In source code, we have:

    ```js
    i18n.plural({
      count: numBooks,
      one: "# book",
      other: "# books"
    })
    ```

2. Code is compiled to (using `lingui-js` or `lingui-react` babel preset):

    ```js
    i18n._(
     '{numBooks, plural, one {# book} other {# books}}',
     { values: { numBooks }}
    )
    ```

3. Message `{numBooks, plural, one {# book} other {# books}}` is translated to:

    ```
    {numBooks, plural, one {# kniha} few {# knihy} other {# knih}}
    ```
    
4. Finally, message is formatted using Czech plural rules.

## Using other language than English

That works perfectly fine! Just learn what [plural forms][cldrPluralRules] your
languages has and then you can use them. Here's the example in Czech:

```js
i18n.plural({
  count: numBooks,
  one: '# kniha',
  few: '# knihy',
  other: '# knih'
})
```

This make **jsLingui** useful also for unilingual projects, i.e: if you don't
translate your app at all. Plurals, number and date formatting are common in
every language.

[cldrPlurals]: http://cldr.unicode.org/index/cldr-spec/plural-rules 
[cldrPluralRules]: http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html

[linguiCliTutorial]: ../tutorials/cli.html
