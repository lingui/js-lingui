/* eslint-disable-file */
/* istanbul ignore next */
var _cp = [
function(n, ord) {
  if (ord) return 'other';
  return 'other';
},
function(n, ord) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},
function(n, ord) {
  if (ord) return 'other';
  return ((n == 0
          || n == 1)) ? 'one' : 'other';
},
function(n, ord) {
  var s = String(n).split('.'), v0 = !s[1];
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one' : 'other';
}
];

/* istanbul ignore next */
(function (root, plurals) {
  if (typeof define === 'function' && define.amd) {
    define(plurals);
  } else if (typeof exports === 'object') {
    module.exports = plurals;
  } else {
    root.plurals = plurals;
  }
}(this, {
af: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

ak: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return ((n == 0
          || n == 1)) ? 'one' : 'other';
},

am: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n >= 0 && n <= 1) ? 'one' : 'other';
},

ar: function(n, ord
/*``*/) {
  var s = String(n).split('.'), t0 = Number(s[0]) == n,
      n100 = t0 && s[0].slice(-2);
  if (ord) return 'other';
  return (n == 0) ? 'zero'
      : (n == 1) ? 'one'
      : (n == 2) ? 'two'
      : ((n100 >= 3 && n100 <= 10)) ? 'few'
      : ((n100 >= 11 && n100 <= 99)) ? 'many'
      : 'other';
},

ars: function(n, ord
/*``*/) {
  var s = String(n).split('.'), t0 = Number(s[0]) == n,
      n100 = t0 && s[0].slice(-2);
  if (ord) return 'other';
  return (n == 0) ? 'zero'
      : (n == 1) ? 'one'
      : (n == 2) ? 'two'
      : ((n100 >= 3 && n100 <= 10)) ? 'few'
      : ((n100 >= 11 && n100 <= 99)) ? 'many'
      : 'other';
},

as: function(n, ord
/*``*/) {
  if (ord) return ((n == 1 || n == 5 || n == 7 || n == 8 || n == 9
          || n == 10)) ? 'one'
      : ((n == 2
          || n == 3)) ? 'two'
      : (n == 4) ? 'few'
      : (n == 6) ? 'many'
      : 'other';
  return (n >= 0 && n <= 1) ? 'one' : 'other';
},

asa: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

ast: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1];
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one' : 'other';
},

az: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], i10 = i.slice(-1),
      i100 = i.slice(-2), i1000 = i.slice(-3);
  if (ord) return ((i10 == 1 || i10 == 2 || i10 == 5 || i10 == 7 || i10 == 8)
          || (i100 == 20 || i100 == 50 || i100 == 70
          || i100 == 80)) ? 'one'
      : ((i10 == 3 || i10 == 4) || (i1000 == 100 || i1000 == 200
          || i1000 == 300 || i1000 == 400 || i1000 == 500 || i1000 == 600 || i1000 == 700
          || i1000 == 800
          || i1000 == 900)) ? 'few'
      : (i == 0 || i10 == 6 || (i100 == 40 || i100 == 60
          || i100 == 90)) ? 'many'
      : 'other';
  return (n == 1) ? 'one' : 'other';
},

be: function(n, ord
/*``*/) {
  var s = String(n).split('.'), t0 = Number(s[0]) == n,
      n10 = t0 && s[0].slice(-1), n100 = t0 && s[0].slice(-2);
  if (ord) return ((n10 == 2
          || n10 == 3) && n100 != 12 && n100 != 13) ? 'few' : 'other';
  return (n10 == 1 && n100 != 11) ? 'one'
      : ((n10 >= 2 && n10 <= 4) && (n100 < 12
          || n100 > 14)) ? 'few'
      : (t0 && n10 == 0 || (n10 >= 5 && n10 <= 9)
          || (n100 >= 11 && n100 <= 14)) ? 'many'
      : 'other';
},

bem: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

bez: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

bg: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

bh: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return ((n == 0
          || n == 1)) ? 'one' : 'other';
},

bm: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

bn: function(n, ord
/*``*/) {
  if (ord) return ((n == 1 || n == 5 || n == 7 || n == 8 || n == 9
          || n == 10)) ? 'one'
      : ((n == 2
          || n == 3)) ? 'two'
      : (n == 4) ? 'few'
      : (n == 6) ? 'many'
      : 'other';
  return (n >= 0 && n <= 1) ? 'one' : 'other';
},

bo: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

br: function(n, ord
/*``*/) {
  var s = String(n).split('.'), t0 = Number(s[0]) == n,
      n10 = t0 && s[0].slice(-1), n100 = t0 && s[0].slice(-2),
      n1000000 = t0 && s[0].slice(-6);
  if (ord) return 'other';
  return (n10 == 1 && n100 != 11 && n100 != 71 && n100 != 91) ? 'one'
      : (n10 == 2 && n100 != 12 && n100 != 72 && n100 != 92) ? 'two'
      : (((n10 == 3 || n10 == 4) || n10 == 9) && (n100 < 10
          || n100 > 19) && (n100 < 70 || n100 > 79) && (n100 < 90
          || n100 > 99)) ? 'few'
      : (n != 0 && t0 && n1000000 == 0) ? 'many'
      : 'other';
},

brx: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

bs: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], f = s[1] || '', v0 = !s[1],
      i10 = i.slice(-1), i100 = i.slice(-2), f10 = f.slice(-1), f100 = f.slice(-2);
  if (ord) return 'other';
  return (v0 && i10 == 1 && i100 != 11
          || f10 == 1 && f100 != 11) ? 'one'
      : (v0 && (i10 >= 2 && i10 <= 4) && (i100 < 12 || i100 > 14)
          || (f10 >= 2 && f10 <= 4) && (f100 < 12
          || f100 > 14)) ? 'few'
      : 'other';
},

ca: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1];
  if (ord) return ((n == 1
          || n == 3)) ? 'one'
      : (n == 2) ? 'two'
      : (n == 4) ? 'few'
      : 'other';
  return (n == 1 && v0) ? 'one' : 'other';
},

ce: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

cgg: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

chr: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

ckb: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

cs: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], v0 = !s[1];
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one'
      : ((i >= 2 && i <= 4) && v0) ? 'few'
      : (!v0) ? 'many'
      : 'other';
},

cy: function(n, ord
/*``*/) {
  if (ord) return ((n == 0 || n == 7 || n == 8
          || n == 9)) ? 'zero'
      : (n == 1) ? 'one'
      : (n == 2) ? 'two'
      : ((n == 3
          || n == 4)) ? 'few'
      : ((n == 5
          || n == 6)) ? 'many'
      : 'other';
  return (n == 0) ? 'zero'
      : (n == 1) ? 'one'
      : (n == 2) ? 'two'
      : (n == 3) ? 'few'
      : (n == 6) ? 'many'
      : 'other';
},

da: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], t0 = Number(s[0]) == n;
  if (ord) return 'other';
  return (n == 1 || !t0 && (i == 0
          || i == 1)) ? 'one' : 'other';
},

de: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1];
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one' : 'other';
},

dsb: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], f = s[1] || '', v0 = !s[1],
      i100 = i.slice(-2), f100 = f.slice(-2);
  if (ord) return 'other';
  return (v0 && i100 == 1
          || f100 == 1) ? 'one'
      : (v0 && i100 == 2
          || f100 == 2) ? 'two'
      : (v0 && (i100 == 3 || i100 == 4) || (f100 == 3
          || f100 == 4)) ? 'few'
      : 'other';
},

dv: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

dz: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

ee: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

el: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

en: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1], t0 = Number(s[0]) == n,
      n10 = t0 && s[0].slice(-1), n100 = t0 && s[0].slice(-2);
  if (ord) return (n10 == 1 && n100 != 11) ? 'one'
      : (n10 == 2 && n100 != 12) ? 'two'
      : (n10 == 3 && n100 != 13) ? 'few'
      : 'other';
  return (n == 1 && v0) ? 'one' : 'other';
},

eo: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

es: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

et: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1];
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one' : 'other';
},

eu: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

fa: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n >= 0 && n <= 1) ? 'one' : 'other';
},

ff: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n >= 0 && n < 2) ? 'one' : 'other';
},

fi: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1];
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one' : 'other';
},

fil: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], f = s[1] || '', v0 = !s[1],
      i10 = i.slice(-1), f10 = f.slice(-1);
  if (ord) return (n == 1) ? 'one' : 'other';
  return (v0 && (i == 1 || i == 2 || i == 3)
          || v0 && i10 != 4 && i10 != 6 && i10 != 9
          || !v0 && f10 != 4 && f10 != 6 && f10 != 9) ? 'one' : 'other';
},

fo: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

fr: function(n, ord
/*``*/) {
  if (ord) return (n == 1) ? 'one' : 'other';
  return (n >= 0 && n < 2) ? 'one' : 'other';
},

fur: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

fy: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1];
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one' : 'other';
},

ga: function(n, ord
/*``*/) {
  var s = String(n).split('.'), t0 = Number(s[0]) == n;
  if (ord) return (n == 1) ? 'one' : 'other';
  return (n == 1) ? 'one'
      : (n == 2) ? 'two'
      : ((t0 && n >= 3 && n <= 6)) ? 'few'
      : ((t0 && n >= 7 && n <= 10)) ? 'many'
      : 'other';
},

gd: function(n, ord
/*``*/) {
  var s = String(n).split('.'), t0 = Number(s[0]) == n;
  if (ord) return 'other';
  return ((n == 1
          || n == 11)) ? 'one'
      : ((n == 2
          || n == 12)) ? 'two'
      : (((t0 && n >= 3 && n <= 10)
          || (t0 && n >= 13 && n <= 19))) ? 'few'
      : 'other';
},

gl: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1];
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one' : 'other';
},

gsw: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

gu: function(n, ord
/*``*/) {
  if (ord) return (n == 1) ? 'one'
      : ((n == 2
          || n == 3)) ? 'two'
      : (n == 4) ? 'few'
      : (n == 6) ? 'many'
      : 'other';
  return (n >= 0 && n <= 1) ? 'one' : 'other';
},

guw: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return ((n == 0
          || n == 1)) ? 'one' : 'other';
},

gv: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], v0 = !s[1], i10 = i.slice(-1),
      i100 = i.slice(-2);
  if (ord) return 'other';
  return (v0 && i10 == 1) ? 'one'
      : (v0 && i10 == 2) ? 'two'
      : (v0 && (i100 == 0 || i100 == 20 || i100 == 40 || i100 == 60
          || i100 == 80)) ? 'few'
      : (!v0) ? 'many'
      : 'other';
},

ha: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

haw: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

he: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], v0 = !s[1], t0 = Number(s[0]) == n,
      n10 = t0 && s[0].slice(-1);
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one'
      : (i == 2 && v0) ? 'two'
      : (v0 && (n < 0
          || n > 10) && t0 && n10 == 0) ? 'many'
      : 'other';
},

hi: function(n, ord
/*``*/) {
  if (ord) return (n == 1) ? 'one'
      : ((n == 2
          || n == 3)) ? 'two'
      : (n == 4) ? 'few'
      : (n == 6) ? 'many'
      : 'other';
  return (n >= 0 && n <= 1) ? 'one' : 'other';
},

hr: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], f = s[1] || '', v0 = !s[1],
      i10 = i.slice(-1), i100 = i.slice(-2), f10 = f.slice(-1), f100 = f.slice(-2);
  if (ord) return 'other';
  return (v0 && i10 == 1 && i100 != 11
          || f10 == 1 && f100 != 11) ? 'one'
      : (v0 && (i10 >= 2 && i10 <= 4) && (i100 < 12 || i100 > 14)
          || (f10 >= 2 && f10 <= 4) && (f100 < 12
          || f100 > 14)) ? 'few'
      : 'other';
},

hsb: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], f = s[1] || '', v0 = !s[1],
      i100 = i.slice(-2), f100 = f.slice(-2);
  if (ord) return 'other';
  return (v0 && i100 == 1
          || f100 == 1) ? 'one'
      : (v0 && i100 == 2
          || f100 == 2) ? 'two'
      : (v0 && (i100 == 3 || i100 == 4) || (f100 == 3
          || f100 == 4)) ? 'few'
      : 'other';
},

hu: function(n, ord
/*``*/) {
  if (ord) return ((n == 1
          || n == 5)) ? 'one' : 'other';
  return (n == 1) ? 'one' : 'other';
},

hy: function(n, ord
/*``*/) {
  if (ord) return (n == 1) ? 'one' : 'other';
  return (n >= 0 && n < 2) ? 'one' : 'other';
},

id: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

ig: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

ii: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

"in": function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

is: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], t0 = Number(s[0]) == n,
      i10 = i.slice(-1), i100 = i.slice(-2);
  if (ord) return 'other';
  return (t0 && i10 == 1 && i100 != 11
          || !t0) ? 'one' : 'other';
},

it: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1];
  if (ord) return ((n == 11 || n == 8 || n == 80
          || n == 800)) ? 'many' : 'other';
  return (n == 1 && v0) ? 'one' : 'other';
},

iu: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one'
      : (n == 2) ? 'two'
      : 'other';
},

iw: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], v0 = !s[1], t0 = Number(s[0]) == n,
      n10 = t0 && s[0].slice(-1);
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one'
      : (i == 2 && v0) ? 'two'
      : (v0 && (n < 0
          || n > 10) && t0 && n10 == 0) ? 'many'
      : 'other';
},

ja: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

jbo: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

jgo: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

ji: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1];
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one' : 'other';
},

jmc: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

jv: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

jw: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

ka: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], i100 = i.slice(-2);
  if (ord) return (i == 1) ? 'one'
      : (i == 0 || ((i100 >= 2 && i100 <= 20) || i100 == 40 || i100 == 60
          || i100 == 80)) ? 'many'
      : 'other';
  return (n == 1) ? 'one' : 'other';
},

kab: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n >= 0 && n < 2) ? 'one' : 'other';
},

kaj: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

kcg: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

kde: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

kea: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

kk: function(n, ord
/*``*/) {
  var s = String(n).split('.'), t0 = Number(s[0]) == n,
      n10 = t0 && s[0].slice(-1);
  if (ord) return (n10 == 6 || n10 == 9
          || t0 && n10 == 0 && n != 0) ? 'many' : 'other';
  return (n == 1) ? 'one' : 'other';
},

kkj: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

kl: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

km: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

kn: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n >= 0 && n <= 1) ? 'one' : 'other';
},

ko: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

ks: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

ksb: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

ksh: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 0) ? 'zero'
      : (n == 1) ? 'one'
      : 'other';
},

ku: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

kw: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one'
      : (n == 2) ? 'two'
      : 'other';
},

ky: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

lag: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0];
  if (ord) return 'other';
  return (n == 0) ? 'zero'
      : ((i == 0
          || i == 1) && n != 0) ? 'one'
      : 'other';
},

lb: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

lg: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

lkt: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

ln: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return ((n == 0
          || n == 1)) ? 'one' : 'other';
},

lo: function(n, ord
/*``*/) {
  if (ord) return (n == 1) ? 'one' : 'other';
  return 'other';
},

lt: function(n, ord
/*``*/) {
  var s = String(n).split('.'), f = s[1] || '', t0 = Number(s[0]) == n,
      n10 = t0 && s[0].slice(-1), n100 = t0 && s[0].slice(-2);
  if (ord) return 'other';
  return (n10 == 1 && (n100 < 11
          || n100 > 19)) ? 'one'
      : ((n10 >= 2 && n10 <= 9) && (n100 < 11
          || n100 > 19)) ? 'few'
      : (f != 0) ? 'many'
      : 'other';
},

lv: function(n, ord
/*``*/) {
  var s = String(n).split('.'), f = s[1] || '', v = f.length,
      t0 = Number(s[0]) == n, n10 = t0 && s[0].slice(-1),
      n100 = t0 && s[0].slice(-2), f100 = f.slice(-2), f10 = f.slice(-1);
  if (ord) return 'other';
  return (t0 && n10 == 0 || (n100 >= 11 && n100 <= 19)
          || v == 2 && (f100 >= 11 && f100 <= 19)) ? 'zero'
      : (n10 == 1 && n100 != 11 || v == 2 && f10 == 1 && f100 != 11
          || v != 2 && f10 == 1) ? 'one'
      : 'other';
},

mas: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

mg: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return ((n == 0
          || n == 1)) ? 'one' : 'other';
},

mgo: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

mk: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], f = s[1] || '', v0 = !s[1],
      i10 = i.slice(-1), i100 = i.slice(-2), f10 = f.slice(-1);
  if (ord) return (i10 == 1 && i100 != 11) ? 'one'
      : (i10 == 2 && i100 != 12) ? 'two'
      : ((i10 == 7
          || i10 == 8) && i100 != 17 && i100 != 18) ? 'many'
      : 'other';
  return (v0 && i10 == 1
          || f10 == 1) ? 'one' : 'other';
},

ml: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

mn: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

mo: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1], t0 = Number(s[0]) == n,
      n100 = t0 && s[0].slice(-2);
  if (ord) return (n == 1) ? 'one' : 'other';
  return (n == 1 && v0) ? 'one'
      : (!v0 || n == 0
          || n != 1 && (n100 >= 1 && n100 <= 19)) ? 'few'
      : 'other';
},

mr: function(n, ord
/*``*/) {
  if (ord) return (n == 1) ? 'one'
      : ((n == 2
          || n == 3)) ? 'two'
      : (n == 4) ? 'few'
      : 'other';
  return (n >= 0 && n <= 1) ? 'one' : 'other';
},

ms: function(n, ord
/*``*/) {
  if (ord) return (n == 1) ? 'one' : 'other';
  return 'other';
},

mt: function(n, ord
/*``*/) {
  var s = String(n).split('.'), t0 = Number(s[0]) == n,
      n100 = t0 && s[0].slice(-2);
  if (ord) return 'other';
  return (n == 1) ? 'one'
      : (n == 0
          || (n100 >= 2 && n100 <= 10)) ? 'few'
      : ((n100 >= 11 && n100 <= 19)) ? 'many'
      : 'other';
},

my: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

nah: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

naq: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one'
      : (n == 2) ? 'two'
      : 'other';
},

nb: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

nd: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

ne: function(n, ord
/*``*/) {
  var s = String(n).split('.'), t0 = Number(s[0]) == n;
  if (ord) return ((t0 && n >= 1 && n <= 4)) ? 'one' : 'other';
  return (n == 1) ? 'one' : 'other';
},

nl: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1];
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one' : 'other';
},

nn: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

nnh: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

no: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

nqo: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

nr: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

nso: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return ((n == 0
          || n == 1)) ? 'one' : 'other';
},

ny: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

nyn: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

om: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

or: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

os: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

pa: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return ((n == 0
          || n == 1)) ? 'one' : 'other';
},

pap: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

pl: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], v0 = !s[1], i10 = i.slice(-1),
      i100 = i.slice(-2);
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one'
      : (v0 && (i10 >= 2 && i10 <= 4) && (i100 < 12
          || i100 > 14)) ? 'few'
      : (v0 && i != 1 && (i10 == 0 || i10 == 1)
          || v0 && (i10 >= 5 && i10 <= 9)
          || v0 && (i100 >= 12 && i100 <= 14)) ? 'many'
      : 'other';
},

prg: function(n, ord
/*``*/) {
  var s = String(n).split('.'), f = s[1] || '', v = f.length,
      t0 = Number(s[0]) == n, n10 = t0 && s[0].slice(-1),
      n100 = t0 && s[0].slice(-2), f100 = f.slice(-2), f10 = f.slice(-1);
  if (ord) return 'other';
  return (t0 && n10 == 0 || (n100 >= 11 && n100 <= 19)
          || v == 2 && (f100 >= 11 && f100 <= 19)) ? 'zero'
      : (n10 == 1 && n100 != 11 || v == 2 && f10 == 1 && f100 != 11
          || v != 2 && f10 == 1) ? 'one'
      : 'other';
},

ps: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

pt: function(n, ord
/*``*/) {
  var s = String(n).split('.'), t0 = Number(s[0]) == n;
  if (ord) return 'other';
  return ((t0 && n >= 0 && n <= 2) && n != 2) ? 'one' : 'other';
},

"pt-PT": function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1];
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one' : 'other';
},

rm: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

ro: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1], t0 = Number(s[0]) == n,
      n100 = t0 && s[0].slice(-2);
  if (ord) return (n == 1) ? 'one' : 'other';
  return (n == 1 && v0) ? 'one'
      : (!v0 || n == 0
          || n != 1 && (n100 >= 1 && n100 <= 19)) ? 'few'
      : 'other';
},

rof: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

root: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

ru: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], v0 = !s[1], i10 = i.slice(-1),
      i100 = i.slice(-2);
  if (ord) return 'other';
  return (v0 && i10 == 1 && i100 != 11) ? 'one'
      : (v0 && (i10 >= 2 && i10 <= 4) && (i100 < 12
          || i100 > 14)) ? 'few'
      : (v0 && i10 == 0 || v0 && (i10 >= 5 && i10 <= 9)
          || v0 && (i100 >= 11 && i100 <= 14)) ? 'many'
      : 'other';
},

rwk: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

sah: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

saq: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

sdh: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

se: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one'
      : (n == 2) ? 'two'
      : 'other';
},

seh: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

ses: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

sg: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

sh: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], f = s[1] || '', v0 = !s[1],
      i10 = i.slice(-1), i100 = i.slice(-2), f10 = f.slice(-1), f100 = f.slice(-2);
  if (ord) return 'other';
  return (v0 && i10 == 1 && i100 != 11
          || f10 == 1 && f100 != 11) ? 'one'
      : (v0 && (i10 >= 2 && i10 <= 4) && (i100 < 12 || i100 > 14)
          || (f10 >= 2 && f10 <= 4) && (f100 < 12
          || f100 > 14)) ? 'few'
      : 'other';
},

shi: function(n, ord
/*``*/) {
  var s = String(n).split('.'), t0 = Number(s[0]) == n;
  if (ord) return 'other';
  return (n >= 0 && n <= 1) ? 'one'
      : ((t0 && n >= 2 && n <= 10)) ? 'few'
      : 'other';
},

si: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], f = s[1] || '';
  if (ord) return 'other';
  return ((n == 0 || n == 1)
          || i == 0 && f == 1) ? 'one' : 'other';
},

sk: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], v0 = !s[1];
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one'
      : ((i >= 2 && i <= 4) && v0) ? 'few'
      : (!v0) ? 'many'
      : 'other';
},

sl: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], v0 = !s[1], i100 = i.slice(-2);
  if (ord) return 'other';
  return (v0 && i100 == 1) ? 'one'
      : (v0 && i100 == 2) ? 'two'
      : (v0 && (i100 == 3 || i100 == 4)
          || !v0) ? 'few'
      : 'other';
},

sma: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one'
      : (n == 2) ? 'two'
      : 'other';
},

smi: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one'
      : (n == 2) ? 'two'
      : 'other';
},

smj: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one'
      : (n == 2) ? 'two'
      : 'other';
},

smn: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one'
      : (n == 2) ? 'two'
      : 'other';
},

sms: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one'
      : (n == 2) ? 'two'
      : 'other';
},

sn: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

so: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

sq: function(n, ord
/*``*/) {
  var s = String(n).split('.'), t0 = Number(s[0]) == n,
      n10 = t0 && s[0].slice(-1), n100 = t0 && s[0].slice(-2);
  if (ord) return (n == 1) ? 'one'
      : (n10 == 4 && n100 != 14) ? 'many'
      : 'other';
  return (n == 1) ? 'one' : 'other';
},

sr: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], f = s[1] || '', v0 = !s[1],
      i10 = i.slice(-1), i100 = i.slice(-2), f10 = f.slice(-1), f100 = f.slice(-2);
  if (ord) return 'other';
  return (v0 && i10 == 1 && i100 != 11
          || f10 == 1 && f100 != 11) ? 'one'
      : (v0 && (i10 >= 2 && i10 <= 4) && (i100 < 12 || i100 > 14)
          || (f10 >= 2 && f10 <= 4) && (f100 < 12
          || f100 > 14)) ? 'few'
      : 'other';
},

ss: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

ssy: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

st: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

sv: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1], t0 = Number(s[0]) == n,
      n10 = t0 && s[0].slice(-1), n100 = t0 && s[0].slice(-2);
  if (ord) return ((n10 == 1
          || n10 == 2) && n100 != 11 && n100 != 12) ? 'one' : 'other';
  return (n == 1 && v0) ? 'one' : 'other';
},

sw: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1];
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one' : 'other';
},

syr: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

ta: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

te: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

teo: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

th: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

ti: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return ((n == 0
          || n == 1)) ? 'one' : 'other';
},

tig: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

tk: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

tl: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], f = s[1] || '', v0 = !s[1],
      i10 = i.slice(-1), f10 = f.slice(-1);
  if (ord) return (n == 1) ? 'one' : 'other';
  return (v0 && (i == 1 || i == 2 || i == 3)
          || v0 && i10 != 4 && i10 != 6 && i10 != 9
          || !v0 && f10 != 4 && f10 != 6 && f10 != 9) ? 'one' : 'other';
},

tn: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

to: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

tr: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

ts: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

tzm: function(n, ord
/*``*/) {
  var s = String(n).split('.'), t0 = Number(s[0]) == n;
  if (ord) return 'other';
  return ((n == 0 || n == 1)
          || (t0 && n >= 11 && n <= 99)) ? 'one' : 'other';
},

ug: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

uk: function(n, ord
/*``*/) {
  var s = String(n).split('.'), i = s[0], v0 = !s[1], t0 = Number(s[0]) == n,
      n10 = t0 && s[0].slice(-1), n100 = t0 && s[0].slice(-2), i10 = i.slice(-1),
      i100 = i.slice(-2);
  if (ord) return (n10 == 3 && n100 != 13) ? 'few' : 'other';
  return (v0 && i10 == 1 && i100 != 11) ? 'one'
      : (v0 && (i10 >= 2 && i10 <= 4) && (i100 < 12
          || i100 > 14)) ? 'few'
      : (v0 && i10 == 0 || v0 && (i10 >= 5 && i10 <= 9)
          || v0 && (i100 >= 11 && i100 <= 14)) ? 'many'
      : 'other';
},

ur: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1];
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one' : 'other';
},

uz: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

ve: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

vi: function(n, ord
/*``*/) {
  if (ord) return (n == 1) ? 'one' : 'other';
  return 'other';
},

vo: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

vun: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

wa: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return ((n == 0
          || n == 1)) ? 'one' : 'other';
},

wae: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

wo: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

xh: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

xog: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n == 1) ? 'one' : 'other';
},

yi: function(n, ord
/*``*/) {
  var s = String(n).split('.'), v0 = !s[1];
  if (ord) return 'other';
  return (n == 1 && v0) ? 'one' : 'other';
},

yo: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

yue: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

zh: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return 'other';
},

zu: function(n, ord
/*``*/) {
  if (ord) return 'other';
  return (n >= 0 && n <= 1) ? 'one' : 'other';
}
}));
