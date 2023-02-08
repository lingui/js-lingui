import { FallbackLocales, LinguiConfig, LinguiConfigNormalized } from "../types"

export function setCldrParentLocales(
  config: LinguiConfig
): LinguiConfigNormalized {
  if (config.fallbackLocales === false) {
    return {
      ...config,
      fallbackLocales: {} as FallbackLocales,
    }
  }

  if (!config.fallbackLocales.default) {
    config.locales.forEach((locale) => {
      const fl = getCldrParentLocale(locale.toLowerCase())
      if (fl && !config.fallbackLocales[locale]) {
        config.fallbackLocales = {
          ...config.fallbackLocales,
          [locale]: fl,
        } as FallbackLocales
      }
    })
  }

  return config as LinguiConfigNormalized
}

export function getCldrParentLocale(sourceLocale: string) {
  return {
    "en-ag": "en",
    "en-ai": "en",
    "en-au": "en",
    "en-bb": "en",
    "en-bm": "en",
    "en-bs": "en",
    "en-bw": "en",
    "en-bz": "en",
    "en-ca": "en",
    "en-cc": "en",
    "en-ck": "en",
    "en-cm": "en",
    "en-cx": "en",
    "en-cy": "en",
    "en-dg": "en",
    "en-dm": "en",
    "en-er": "en",
    "en-fj": "en",
    "en-fk": "en",
    "en-fm": "en",
    "en-gb": "en",
    "en-gd": "en",
    "en-gg": "en",
    "en-gh": "en",
    "en-gi": "en",
    "en-gm": "en",
    "en-gy": "en",
    "en-hk": "en",
    "en-ie": "en",
    "en-il": "en",
    "en-im": "en",
    "en-in": "en",
    "en-io": "en",
    "en-je": "en",
    "en-jm": "en",
    "en-ke": "en",
    "en-ki": "en",
    "en-kn": "en",
    "en-ky": "en",
    "en-lc": "en",
    "en-lr": "en",
    "en-ls": "en",
    "en-mg": "en",
    "en-mo": "en",
    "en-ms": "en",
    "en-mt": "en",
    "en-mu": "en",
    "en-mw": "en",
    "en-my": "en",
    "en-na": "en",
    "en-nf": "en",
    "en-ng": "en",
    "en-nr": "en",
    "en-nu": "en",
    "en-nz": "en",
    "en-pg": "en",
    "en-ph": "en",
    "en-pk": "en",
    "en-pn": "en",
    "en-pw": "en",
    "en-rw": "en",
    "en-sb": "en",
    "en-sc": "en",
    "en-sd": "en",
    "en-sg": "en",
    "en-sh": "en",
    "en-sl": "en",
    "en-ss": "en",
    "en-sx": "en",
    "en-sz": "en",
    "en-tc": "en",
    "en-tk": "en",
    "en-to": "en",
    "en-tt": "en",
    "en-tv": "en",
    "en-tz": "en",
    "en-ug": "en",
    "en-us": "en",
    "en-vc": "en",
    "en-vg": "en",
    "en-vu": "en",
    "en-ws": "en",
    "en-za": "en",
    "en-zm": "en",
    "en-zw": "en",
    "en-at": "en",
    "en-be": "en",
    "en-ch": "en",
    "en-de": "en",
    "en-dk": "en",
    "en-fi": "en",
    "en-nl": "en",
    "en-se": "en",
    "en-si": "en",
    "es-ar": "es",
    "es-bo": "es",
    "es-br": "es",
    "es-bz": "es",
    "es-cl": "es",
    "es-co": "es",
    "es-cr": "es",
    "es-cu": "es",
    "es-do": "es",
    "es-ec": "es",
    "es-es": "es",
    "es-gt": "es",
    "es-hn": "es",
    "es-mx": "es",
    "es-ni": "es",
    "es-pa": "es",
    "es-pe": "es",
    "es-pr": "es",
    "es-py": "es",
    "es-sv": "es",
    "es-us": "es",
    "es-uy": "es",
    "es-ve": "es",
    "pt-ao": "pt",
    "pt-ch": "pt",
    "pt-cv": "pt",
    "pt-fr": "pt",
    "pt-gq": "pt",
    "pt-gw": "pt",
    "pt-lu": "pt",
    "pt-mo": "pt",
    "pt-mz": "pt",
    "pt-pt": "pt",
    "pt-st": "pt",
    "pt-tl": "pt",
    "az-arab": "az",
    "az-cyrl": "az",
    "blt-latn": "blt",
    "bm-nkoo": "bm",
    "bs-cyrl": "bs",
    "byn-latn": "byn",
    "cu-glag": "cu",
    "dje-arab": "dje",
    "dyo-arab": "dyo",
    "en-dsrt": "en",
    "en-shaw": "en",
    "ff-adlm": "ff",
    "ff-arab": "ff",
    "ha-arab": "ha",
    "hi-latn": "hi",
    "iu-latn": "iu",
    "kk-arab": "kk",
    "ks-deva": "ks",
    "ku-arab": "ku",
    "ky-arab": "ky",
    "ky-latn": "ky",
    "ml-arab": "ml",
    "mn-mong": "mn",
    "mni-mtei": "mni",
    "ms-arab": "ms",
    "pa-arab": "pa",
    "sat-deva": "sat",
    "sd-deva": "sd",
    "sd-khoj": "sd",
    "sd-sind": "sd",
    "shi-latn": "shi",
    "so-arab": "so",
    "sr-latn": "sr",
    "sw-arab": "sw",
    "tg-arab": "tg",
    "ug-cyrl": "ug",
    "uz-arab": "uz",
    "uz-cyrl": "uz",
    "vai-latn": "vai",
    "wo-arab": "wo",
    "yo-arab": "yo",
    "yue-hans": "yue",
    "zh-hant": "zh",
    "zh-hant-hk": "zh",
    "zh-hant-mo": "zh-hant-hk",
  }[sourceLocale]
}
