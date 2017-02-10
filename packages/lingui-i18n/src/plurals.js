const formats = [
  function (n) {
    
    return n === 1 ? 'one'
      : 'other'
  },
  function (n) {
    
    return 0 <= n && n <= 1 ? 'one'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    
    return i === 0 || n === 1 ? 'one'
      : 'other'
  },
  function (n) {
    
    return n === 0 ? 'zero'
      : n === 1 ? 'one'
      : n === 2 ? 'two'
      : 3 <= n % 100 && n % 100 <= 10 ? 'few'
      : 11 <= n % 100 && n % 100 <= 99 ? 'many'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    const v = (n + '.').split('.')[1].length
    return i === 1 && v === 0 ? 'one'
      : 'other'
  },
  function (n) {
    
    return n % 10 === 1 && n % 100 !== 11 ? 'one'
      : (2 <= n % 10 && n % 10 <= 4) && (n % 100 < 12 || 14 < n % 100) ? 'few'
      : n % 10 === 0 || (5 <= n % 10 && n % 10 <= 9) || (11 <= n % 100 && n % 100 <= 14) ? 'many'
      : 'other'
  },
  function (n) {
    
    return n % 10 === 1 && (n % 100 !== 11 && n % 100 !== 71 && n % 100 !== 91) ? 'one'
      : n % 10 === 2 && (n % 100 !== 12 && n % 100 !== 72 && n % 100 !== 92) ? 'two'
      : ((3 <= n % 10 && n % 10 <= 4) || n % 10 === 9) && ((n % 100 < 10 || 19 < n % 100) && (n % 100 < 70 || 79 < n % 100) && (n % 100 < 90 || 99 < n % 100)) ? 'few'
      : n !== 0 && n % 1000000 === 0 ? 'many'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    const v = (n + '.').split('.')[1].length
    const f = +(n + '.').split('.')[1]
    return v === 0 && i % 10 === 1 && i % 100 !== 11 || f % 10 === 1 && f % 100 !== 11 ? 'one'
      : v === 0 && (2 <= i % 10 && i % 10 <= 4) && (i % 100 < 12 || 14 < i % 100) || (2 <= f % 10 && f % 10 <= 4) && (f % 100 < 12 || 14 < f % 100) ? 'few'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    const v = (n + '.').split('.')[1].length
    return i === 1 && v === 0 ? 'one'
      : (2 <= i && i <= 4) && v === 0 ? 'few'
      : v !== 0 ? 'many'
      : 'other'
  },
  function (n) {
    
    return n === 0 ? 'zero'
      : n === 1 ? 'one'
      : n === 2 ? 'two'
      : n === 3 ? 'few'
      : n === 6 ? 'many'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    const t = +('' + n).replace(/^[^.]*.?|0+$/g, '')
    
    return n === 1 || t !== 0 && (i === 0 || i === 1) ? 'one'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    const v = (n + '.').split('.')[1].length
    const f = +(n + '.').split('.')[1]
    return v === 0 && i % 100 === 1 || f % 100 === 1 ? 'one'
      : v === 0 && i % 100 === 2 || f % 100 === 2 ? 'two'
      : v === 0 && (3 <= i % 100 && i % 100 <= 4) || (3 <= f % 100 && f % 100 <= 4) ? 'few'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    return i === 0 || i === 1 ? 'one'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    const v = (n + '.').split('.')[1].length
    const f = +(n + '.').split('.')[1]
    return v === 0 && (i === 1 || i === 2 || i === 3) || v === 0 && (i % 10 !== 4 && i % 10 !== 6 && i % 10 !== 9) || v !== 0 && (f % 10 !== 4 && f % 10 !== 6 && f % 10 !== 9) ? 'one'
      : 'other'
  },
  function (n) {
    
    return n === 1 ? 'one'
      : n === 2 ? 'two'
      : 3 <= n && n <= 6 ? 'few'
      : 7 <= n && n <= 10 ? 'many'
      : 'other'
  },
  function (n) {
    
    return n === 1 || n === 11 ? 'one'
      : n === 2 || n === 12 ? 'two'
      : ((3 <= n && n <= 10) || (13 <= n && n <= 19)) ? 'few'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    const v = (n + '.').split('.')[1].length
    return v === 0 && i % 10 === 1 ? 'one'
      : v === 0 && i % 10 === 2 ? 'two'
      : v === 0 && (i % 100 === 0 || i % 100 === 20 || i % 100 === 40 || i % 100 === 60 || i % 100 === 80) ? 'few'
      : v !== 0 ? 'many'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    const v = (n + '.').split('.')[1].length
    
    return i === 1 && v === 0 ? 'one'
      : i === 2 && v === 0 ? 'two'
      : v === 0 && (n < 0 || 10 < n) && n % 10 === 0 ? 'many'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    const t = +('' + n).replace(/^[^.]*.?|0+$/g, '')
    return t === 0 && i % 10 === 1 && i % 100 !== 11 || t !== 0 ? 'one'
      : 'other'
  },
  function (n) {
    
    return n === 1 ? 'one'
      : n === 2 ? 'two'
      : 'other'
  },
  function (n) {
    
    return n === 0 ? 'zero'
      : n === 1 ? 'one'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    
    return n === 0 ? 'zero'
      : (i === 0 || i === 1) && n !== 0 ? 'one'
      : 'other'
  },
  function (n) {
    const f = +(n + '.').split('.')[1]
    
    return n % 10 === 1 && (n % 100 < 11 || 19 < n % 100) ? 'one'
      : (2 <= n % 10 && n % 10 <= 9) && (n % 100 < 11 || 19 < n % 100) ? 'few'
      : f !== 0 ? 'many'
      : 'other'
  },
  function (n) {
    const v = (n + '.').split('.')[1].length
    const f = +(n + '.').split('.')[1]
    
    return n % 10 === 0 || (11 <= n % 100 && n % 100 <= 19) || v === 2 && (11 <= f % 100 && f % 100 <= 19) ? 'zero'
      : n % 10 === 1 && n % 100 !== 11 || v === 2 && f % 10 === 1 && f % 100 !== 11 || v !== 2 && f % 10 === 1 ? 'one'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    const v = (n + '.').split('.')[1].length
    const f = +(n + '.').split('.')[1]
    return v === 0 && i % 10 === 1 || f % 10 === 1 ? 'one'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    const v = (n + '.').split('.')[1].length
    
    return i === 1 && v === 0 ? 'one'
      : v !== 0 || n === 0 || n !== 1 && (1 <= n % 100 && n % 100 <= 19) ? 'few'
      : 'other'
  },
  function (n) {
    
    return n === 1 ? 'one'
      : n === 0 || (2 <= n % 100 && n % 100 <= 10) ? 'few'
      : 11 <= n % 100 && n % 100 <= 19 ? 'many'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    const v = (n + '.').split('.')[1].length
    return i === 1 && v === 0 ? 'one'
      : v === 0 && (2 <= i % 10 && i % 10 <= 4) && (i % 100 < 12 || 14 < i % 100) ? 'few'
      : v === 0 && i !== 1 && (0 <= i % 10 && i % 10 <= 1) || v === 0 && (5 <= i % 10 && i % 10 <= 9) || v === 0 && (12 <= i % 100 && i % 100 <= 14) ? 'many'
      : 'other'
  },
  function (n) {
    
    return (0 <= n && n <= 2) && n !== 2 ? 'one'
      : 'other'
  },
  function (n) {
    const v = (n + '.').split('.')[1].length
    
    return n === 1 && v === 0 ? 'one'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    const v = (n + '.').split('.')[1].length
    return v === 0 && i % 10 === 1 && i % 100 !== 11 ? 'one'
      : v === 0 && (2 <= i % 10 && i % 10 <= 4) && (i % 100 < 12 || 14 < i % 100) ? 'few'
      : v === 0 && i % 10 === 0 || v === 0 && (5 <= i % 10 && i % 10 <= 9) || v === 0 && (11 <= i % 100 && i % 100 <= 14) ? 'many'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    
    return i === 0 || n === 1 ? 'one'
      : 2 <= n && n <= 10 ? 'few'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    const f = +(n + '.').split('.')[1]
    
    return (n === 0 || n === 1) || i === 0 && f === 1 ? 'one'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    const v = (n + '.').split('.')[1].length
    return v === 0 && i % 100 === 1 ? 'one'
      : v === 0 && i % 100 === 2 ? 'two'
      : v === 0 && (3 <= i % 100 && i % 100 <= 4) || v !== 0 ? 'few'
      : 'other'
  },
  function (n) {
    
    return (0 <= n && n <= 1) || (11 <= n && n <= 99) ? 'one'
      : 'other'
  },
  function (n) {
    
    return n === 1 || n === 5 || n === 7 || n === 8 || n === 9 || n === 10 ? 'one'
      : n === 2 || n === 3 ? 'two'
      : n === 4 ? 'few'
      : n === 6 ? 'many'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    return (i % 10 === 1 || i % 10 === 2 || i % 10 === 5 || i % 10 === 7 || i % 10 === 8) || (i % 100 === 20 || i % 100 === 50 || i % 100 === 70 || i % 100 === 80) ? 'one'
      : (i % 10 === 3 || i % 10 === 4) || (i % 1000 === 100 || i % 1000 === 200 || i % 1000 === 300 || i % 1000 === 400 || i % 1000 === 500 || i % 1000 === 600 || i % 1000 === 700 || i % 1000 === 800 || i % 1000 === 900) ? 'few'
      : i === 0 || i % 10 === 6 || (i % 100 === 40 || i % 100 === 60 || i % 100 === 90) ? 'many'
      : 'other'
  },
  function (n) {
    
    return (n % 10 === 2 || n % 10 === 3) && (n % 100 !== 12 && n % 100 !== 13) ? 'few'
      : 'other'
  },
  function (n) {
    
    return n === 1 || n === 3 ? 'one'
      : n === 2 ? 'two'
      : n === 4 ? 'few'
      : 'other'
  },
  function (n) {
    
    return n === 0 || n === 7 || n === 8 || n === 9 ? 'zero'
      : n === 1 ? 'one'
      : n === 2 ? 'two'
      : n === 3 || n === 4 ? 'few'
      : n === 5 || n === 6 ? 'many'
      : 'other'
  },
  function (n) {
    
    return n % 10 === 1 && n % 100 !== 11 ? 'one'
      : n % 10 === 2 && n % 100 !== 12 ? 'two'
      : n % 10 === 3 && n % 100 !== 13 ? 'few'
      : 'other'
  },
  function (n) {
    
    return n === 1 ? 'one'
      : n === 2 || n === 3 ? 'two'
      : n === 4 ? 'few'
      : n === 6 ? 'many'
      : 'other'
  },
  function (n) {
    
    return n === 1 || n === 5 ? 'one'
      : 'other'
  },
  function (n) {
    
    return n === 11 || n === 8 || n === 80 || n === 800 ? 'many'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    return i === 1 ? 'one'
      : i === 0 || ((2 <= i % 100 && i % 100 <= 20) || i % 100 === 40 || i % 100 === 60 || i % 100 === 80) ? 'many'
      : 'other'
  },
  function (n) {
    
    return n % 10 === 6 || n % 10 === 9 || n % 10 === 0 && n !== 0 ? 'many'
      : 'other'
  },
  function (n) {
    const i = Math.floor(Math.abs(n))
    return i % 10 === 1 && i % 100 !== 11 ? 'one'
      : i % 10 === 2 && i % 100 !== 12 ? 'two'
      : (i % 10 === 7 || i % 10 === 8) && (i % 100 !== 17 && i % 100 !== 18) ? 'many'
      : 'other'
  },
  function (n) {
    
    return n === 1 ? 'one'
      : n === 2 || n === 3 ? 'two'
      : n === 4 ? 'few'
      : 'other'
  },
  function (n) {
    
    return 1 <= n && n <= 4 ? 'one'
      : 'other'
  },
  function (n) {
    
    return n === 1 ? 'one'
      : n % 10 === 4 && n % 100 !== 14 ? 'many'
      : 'other'
  },
  function (n) {
    
    return (n % 10 === 1 || n % 10 === 2) && (n % 100 !== 11 && n % 100 !== 12) ? 'one'
      : 'other'
  },
  function (n) {
    
    return n % 10 === 3 && n % 100 !== 13 ? 'few'
      : 'other'
  }
]

export default {
  af: { cardinal: formats[0] },
  ak: { cardinal: formats[1] },
  am: { cardinal: formats[2] },
  ar: { cardinal: formats[3] },
  as: { cardinal: formats[2], ordinal: formats[35] },
  asa: { cardinal: formats[0] },
  ast: { cardinal: formats[4] },
  az: { cardinal: formats[0], ordinal: formats[36] },
  be: { cardinal: formats[5], ordinal: formats[37] },
  bem: { cardinal: formats[0] },
  bez: { cardinal: formats[0] },
  bg: { cardinal: formats[0] },
  bh: { cardinal: formats[1] },
  bn: { cardinal: formats[2], ordinal: formats[35] },
  br: { cardinal: formats[6] },
  brx: { cardinal: formats[0] },
  bs: { cardinal: formats[7] },
  ca: { cardinal: formats[4], ordinal: formats[38] },
  ce: { cardinal: formats[0] },
  cgg: { cardinal: formats[0] },
  chr: { cardinal: formats[0] },
  ckb: { cardinal: formats[0] },
  cs: { cardinal: formats[8] },
  cy: { cardinal: formats[9], ordinal: formats[39] },
  da: { cardinal: formats[10] },
  de: { cardinal: formats[4] },
  dsb: { cardinal: formats[11] },
  dv: { cardinal: formats[0] },
  ee: { cardinal: formats[0] },
  el: { cardinal: formats[0] },
  en: { cardinal: formats[4], ordinal: formats[40] },
  eo: { cardinal: formats[0] },
  es: { cardinal: formats[0] },
  et: { cardinal: formats[4] },
  eu: { cardinal: formats[0] },
  fa: { cardinal: formats[2] },
  ff: { cardinal: formats[12] },
  fi: { cardinal: formats[4] },
  fil: { cardinal: formats[13], ordinal: formats[0] },
  fo: { cardinal: formats[0] },
  fr: { cardinal: formats[12], ordinal: formats[0] },
  fur: { cardinal: formats[0] },
  fy: { cardinal: formats[4] },
  ga: { cardinal: formats[14], ordinal: formats[0] },
  gd: { cardinal: formats[15] },
  gl: { cardinal: formats[4] },
  gsw: { cardinal: formats[0] },
  gu: { cardinal: formats[2], ordinal: formats[41] },
  guw: { cardinal: formats[1] },
  gv: { cardinal: formats[16] },
  ha: { cardinal: formats[0] },
  haw: { cardinal: formats[0] },
  he: { cardinal: formats[17] },
  hi: { cardinal: formats[2], ordinal: formats[41] },
  hr: { cardinal: formats[7] },
  hsb: { cardinal: formats[11] },
  hu: { cardinal: formats[0], ordinal: formats[42] },
  hy: { cardinal: formats[12], ordinal: formats[0] },
  is: { cardinal: formats[18] },
  it: { cardinal: formats[4], ordinal: formats[43] },
  iu: { cardinal: formats[19] },
  iw: { cardinal: formats[17] },
  jgo: { cardinal: formats[0] },
  ji: { cardinal: formats[4] },
  jmc: { cardinal: formats[0] },
  ka: { cardinal: formats[0], ordinal: formats[44] },
  kab: { cardinal: formats[12] },
  kaj: { cardinal: formats[0] },
  kcg: { cardinal: formats[0] },
  kk: { cardinal: formats[0], ordinal: formats[45] },
  kkj: { cardinal: formats[0] },
  kl: { cardinal: formats[0] },
  kn: { cardinal: formats[2] },
  ks: { cardinal: formats[0] },
  ksb: { cardinal: formats[0] },
  ksh: { cardinal: formats[20] },
  ku: { cardinal: formats[0] },
  kw: { cardinal: formats[19] },
  ky: { cardinal: formats[0] },
  lag: { cardinal: formats[21] },
  lb: { cardinal: formats[0] },
  lg: { cardinal: formats[0] },
  ln: { cardinal: formats[1] },
  lt: { cardinal: formats[22] },
  lv: { cardinal: formats[23] },
  mas: { cardinal: formats[0] },
  mg: { cardinal: formats[1] },
  mgo: { cardinal: formats[0] },
  mk: { cardinal: formats[24], ordinal: formats[46] },
  ml: { cardinal: formats[0] },
  mn: { cardinal: formats[0] },
  mo: { cardinal: formats[25], ordinal: formats[0] },
  mr: { cardinal: formats[2], ordinal: formats[47] },
  mt: { cardinal: formats[26] },
  nah: { cardinal: formats[0] },
  naq: { cardinal: formats[19] },
  nb: { cardinal: formats[0] },
  nd: { cardinal: formats[0] },
  ne: { cardinal: formats[0], ordinal: formats[48] },
  nl: { cardinal: formats[4] },
  nn: { cardinal: formats[0] },
  nnh: { cardinal: formats[0] },
  no: { cardinal: formats[0] },
  nr: { cardinal: formats[0] },
  nso: { cardinal: formats[1] },
  ny: { cardinal: formats[0] },
  nyn: { cardinal: formats[0] },
  om: { cardinal: formats[0] },
  or: { cardinal: formats[0] },
  os: { cardinal: formats[0] },
  pa: { cardinal: formats[1] },
  pap: { cardinal: formats[0] },
  pl: { cardinal: formats[27] },
  prg: { cardinal: formats[23] },
  ps: { cardinal: formats[0] },
  pt: { cardinal: formats[28] },
  'pt-PT': { cardinal: formats[29] },
  rm: { cardinal: formats[0] },
  ro: { cardinal: formats[25], ordinal: formats[0] },
  rof: { cardinal: formats[0] },
  ru: { cardinal: formats[30] },
  rwk: { cardinal: formats[0] },
  saq: { cardinal: formats[0] },
  sdh: { cardinal: formats[0] },
  se: { cardinal: formats[19] },
  seh: { cardinal: formats[0] },
  sh: { cardinal: formats[7] },
  shi: { cardinal: formats[31] },
  si: { cardinal: formats[32] },
  sk: { cardinal: formats[8] },
  sl: { cardinal: formats[33] },
  sma: { cardinal: formats[19] },
  smi: { cardinal: formats[19] },
  smj: { cardinal: formats[19] },
  smn: { cardinal: formats[19] },
  sms: { cardinal: formats[19] },
  sn: { cardinal: formats[0] },
  so: { cardinal: formats[0] },
  sq: { cardinal: formats[0], ordinal: formats[49] },
  sr: { cardinal: formats[7] },
  ss: { cardinal: formats[0] },
  ssy: { cardinal: formats[0] },
  st: { cardinal: formats[0] },
  sv: { cardinal: formats[4], ordinal: formats[50] },
  sw: { cardinal: formats[4] },
  syr: { cardinal: formats[0] },
  ta: { cardinal: formats[0] },
  te: { cardinal: formats[0] },
  teo: { cardinal: formats[0] },
  ti: { cardinal: formats[1] },
  tig: { cardinal: formats[0] },
  tk: { cardinal: formats[0] },
  tl: { cardinal: formats[13], ordinal: formats[0] },
  tn: { cardinal: formats[0] },
  tr: { cardinal: formats[0] },
  ts: { cardinal: formats[0] },
  tzm: { cardinal: formats[34] },
  ug: { cardinal: formats[0] },
  uk: { cardinal: formats[30], ordinal: formats[51] },
  ur: { cardinal: formats[4] },
  uz: { cardinal: formats[0] },
  ve: { cardinal: formats[0] },
  vo: { cardinal: formats[0] },
  vun: { cardinal: formats[0] },
  wa: { cardinal: formats[1] },
  wae: { cardinal: formats[0] },
  xh: { cardinal: formats[0] },
  xog: { cardinal: formats[0] },
  yi: { cardinal: formats[4] },
  zu: { cardinal: formats[2] },
  lo: { ordinal: formats[0] },
  ms: { ordinal: formats[0] },
  vi: { ordinal: formats[0] }
}
