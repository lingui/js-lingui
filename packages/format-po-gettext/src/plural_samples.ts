import cardinals from "cldr-core/supplemental/plurals.json";

type PluralForm = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'
type FormattedRuleset = Record<PluralForm, string>


const FORMS: Readonly<PluralForm[]> = [ 'zero', 'one', 'two', 'few', 'many', 'other' ];

////////////////////////////////////////////////////////////////////////////////
// Helpers

// Strip key prefixes to get clear names: zero / one / two / few / many / other
// pluralRule-count-other -> other
export function renameKeys(rules: Record<string, string>): FormattedRuleset {
  const result = {};
  Object.keys(rules).forEach(k => {
    const newKey = k.match(/[^-]+$/)[0]
    result[newKey] = rules[k];
  });
  return result as FormattedRuleset
}

// Create array of sample values for single range
// 5~16, 0.04~0.09. Both string & integer forms (when possible)
export function fillRange(value: string): number[] {
  let [ start, end ] = value.split('~')

  const decimals = (start.split('.')[1] || '').length;
  // for example 0.1~0.9 has 10 values, need to add that many to list
  // 0.004~0.009 has 100 values
  let mult = Math.pow(10, decimals);

  // convert to numbers
  const startNum = Number(start);
  const endNum = Number(end);

  let range = Array(Math.ceil(endNum * mult - startNum * mult + 1)).fill(0)
    .map((v, idx) => ((idx + startNum * mult) / mult))

  let last = range[range.length - 1];

  // Stupid self check
  if (endNum !== last) {
    throw new Error(`Range create error for ${value}: last value is ${last}`);
  }

  return range.map(v => Number(v));
}

// Create array of test values for @integer or @decimal
export function createSamples(src: string): number[] {
  let result: number[] = [];

  src
    .replace(/…/, '')
    .trim()
    .replace(/,$/, '')
    .split(',')
    .map(function (val) { return val.trim(); })
    .forEach(val => {
      if (val.indexOf('~') !== -1) {
        result = result.concat(fillRange(val));
      } else {
        // push test data as String
        result.push(val);
        // push test data as Number if the same
        if (String(+val) === val) { result.push(+val); }
      }
    });

  return result;
}

// Create equation for single form rule
function toSingleRule(str) {

  return str
    // replace modulus with shortcuts
    .replace(/([nivwfte]) % (\d+)/g, '$1$2')
    // replace ranges
    .replace(/([nivwfte]\d*) (=|\!=) (\d+[.,][.,\d]+)/g, (match, v, cond, range) => {
      // range = 5,8,9 (simple set)
      if (range.indexOf('..') < 0 && range.indexOf(',') >= 0) {
        if (cond === '=') {
          return `IN([ ${range.split(',').join(', ')} ], ${v})`;
        }
        return `!IN([ ${range.split(',').join(', ')} ], ${v})`;
      }
      // range = 0..5 or 0..5,8..20 or 0..5,8
      let conditions = range.split(',').map(interval => {
        // simple value
        if (interval.indexOf('..') < 0) return `${v} ${cond} ${interval}`;
        // range
        let [ start, end ] = interval.split('..');
        if (cond === '=') return `B(${start}, ${end}, ${v})`;

        return `!B(${start}, ${end}, ${v})`;
      });

      let joined;
      if (conditions.length > 1) {
        joined =  `(${conditions.join(cond === '=' ? ' || ' : ' && ')})`;
      } else {
        joined = conditions[0];
      }
      return joined;
    })
    .replace(/ = /g, ' === ')
    .replace(/ != /g, ' !== ')
    .replace(/ or /g, ' || ')
    .replace(/ and /g, ' && ');
}


function createLocaleFn(rules) {

  Object.keys(rules).forEach(r => {
    if (FORMS.indexOf(r) < 0) { throw new Error("Don't know this form: "); }
  });

  // Make sure existing forms are ordered
  // @ts-ignore
  let forms = Object.keys(rules).sort((a, b) => FORMS.indexOf(a) > FORMS.indexOf(b));

  if (forms.length === 1) return {};

  let condition = '';

  forms.forEach(function (form, idx) {
    if (form === 'other') {
      condition += idx;
      return;
    }
    let rule = rules[form].split('@')[0].trim();
    condition += `${toSingleRule(rule)} ? ${idx} : `;
  });

  let shortcuts = [ ...new Set(condition.match(/[nivwfte]\d+/g) || []) ] // unique
    .map(sh => `${sh} = ${sh[0]} % ${sh.slice(1)}`)
    .join(', ');

  let pmax = Math.max(
    ...('nivftwe'.split('').map((p, idx) => condition.indexOf(p) < 0 ? -1 : idx))
  ) + 1;

  let fn = `
  function (${ 'nivftwe'.slice(0, pmax).split('').join(', ') }) {<% if (shortcuts) { %>
    var ${ shortcuts };<% } %>
    return ${ condition };
  }
  `
  return {
    c:   forms.map(f => FORMS.indexOf(f)),
    cFn: fn
  };
}

// Create fixtures for single locale rules
function createLocaleTest(rules) {
  let result = {};

  Object.keys(rules).forEach(form => {
    let samples = rules[form].split(/@integer|@decimal/).slice(1);

    result[form] = [];
    samples.forEach(sample => {
      result[form] = result[form].concat(createSamples(sample));
    });
  });

  return result;
}

////////////////////////////////////////////////////////////////////////////////

// Process all locales
let compiled = {};
const pluralRules = {}

// Parse plural rules
// Object.entries(cardinals.supplemental['plurals-type-cardinal']).forEach(([ loc, ruleset ]) => {
//   let rules = renameKeys(ruleset);

//   compiled[loc.toLowerCase()] = createLocaleFn(rules);
//   pluralRules[loc.toLowerCase()] = createLocaleTest(rules);
// });

export default pluralRules
