import type {
  FallbackLocales,
  LinguiConfig,
  LinguiConfigNormalized,
} from "../types"

export function setCldrParentLocales(
  config: LinguiConfig,
): LinguiConfigNormalized {
  const { locales, fallbackLocales } = config
  if (fallbackLocales === false) {
    return { ...config, fallbackLocales: {} } as LinguiConfigNormalized
  }
  if (fallbackLocales?.default) {
    return config as LinguiConfigNormalized
  }

  const localeNames = new Map(
    locales.map((locale) => [locale.toLowerCase(), locale]),
  )
  const fallbacks: FallbackLocales = { ...fallbackLocales }

  for (const locale of locales) {
    if (Object.hasOwn(fallbacks, locale)) continue

    const parents: string[] = []
    for (
      let parent = getCldrParentLocale(locale);
      parent && parent !== "und";
      parent = getCldrParentLocale(parent)
    ) {
      const configured = localeNames.get(parent.toLowerCase())
      // Keep the historical language fallback when a regional catalog is absent.
      if (configured || !getCldrParentLocale(parent))
        parents.push(configured ?? parent)
    }
    if (parents.length > 0) {
      fallbacks[locale] = parents.length === 1 ? parents[0] : parents
    }
  }

  return { ...config, fallbackLocales: fallbacks } as LinguiConfigNormalized
}

// Parent overrides from CLDR supplemental/parentLocales, with existing language fallbacks.
const parentLocales: Record<string, string> = {
  "en-ag": "en-001",
  "en-ai": "en-001",
  "en-au": "en-001",
  "en-bb": "en-001",
  "en-bm": "en-001",
  "en-bs": "en-001",
  "en-bw": "en-001",
  "en-bz": "en-001",
  "en-ca": "en",
  "en-cc": "en-001",
  "en-ck": "en-001",
  "en-cm": "en-001",
  "en-cx": "en-001",
  "en-cy": "en-001",
  "en-dg": "en-001",
  "en-dm": "en-001",
  "en-er": "en-001",
  "en-fj": "en-001",
  "en-fk": "en-001",
  "en-fm": "en-001",
  "en-gb": "en-001",
  "en-gd": "en-001",
  "en-gg": "en-001",
  "en-gh": "en-001",
  "en-gi": "en-001",
  "en-gm": "en-001",
  "en-gy": "en-001",
  "en-hk": "en-001",
  "en-ie": "en-001",
  "en-il": "en-001",
  "en-im": "en-001",
  "en-in": "en-001",
  "en-io": "en-001",
  "en-je": "en-001",
  "en-jm": "en-001",
  "en-ke": "en-001",
  "en-ki": "en-001",
  "en-kn": "en-001",
  "en-ky": "en-001",
  "en-lc": "en-001",
  "en-lr": "en-001",
  "en-ls": "en-001",
  "en-mg": "en-001",
  "en-mo": "en-001",
  "en-ms": "en-001",
  "en-mt": "en-001",
  "en-mu": "en-001",
  "en-mw": "en-001",
  "en-my": "en-001",
  "en-na": "en-001",
  "en-nf": "en-001",
  "en-ng": "en-001",
  "en-nr": "en-001",
  "en-nu": "en-001",
  "en-nz": "en-001",
  "en-pg": "en-001",
  "en-ph": "en",
  "en-pk": "en-001",
  "en-pn": "en-001",
  "en-pw": "en-001",
  "en-rw": "en-001",
  "en-sb": "en-001",
  "en-sc": "en-001",
  "en-sd": "en-001",
  "en-sg": "en-001",
  "en-sh": "en-001",
  "en-sl": "en-001",
  "en-ss": "en-001",
  "en-sx": "en-001",
  "en-sz": "en-001",
  "en-tc": "en-001",
  "en-tk": "en-001",
  "en-to": "en-001",
  "en-tt": "en-001",
  "en-tv": "en-001",
  "en-tz": "en-001",
  "en-ug": "en-001",
  "en-us": "en",
  "en-vc": "en-001",
  "en-vg": "en-001",
  "en-vu": "en-001",
  "en-ws": "en-001",
  "en-za": "en-001",
  "en-zm": "en-001",
  "en-zw": "en-001",
  "en-at": "en-150",
  "en-be": "en-150",
  "en-ch": "en-150",
  "en-de": "en-150",
  "en-dk": "en-150",
  "en-fi": "en-150",
  "en-nl": "en-150",
  "en-se": "en-150",
  "en-si": "en-150",
  "es-ar": "es-419",
  "es-bo": "es-419",
  "es-br": "es-419",
  "es-bz": "es-419",
  "es-cl": "es-419",
  "es-co": "es-419",
  "es-cr": "es-419",
  "es-cu": "es-419",
  "es-do": "es-419",
  "es-ec": "es-419",
  "es-es": "es",
  "es-gt": "es-419",
  "es-hn": "es-419",
  "es-mx": "es-419",
  "es-ni": "es-419",
  "es-pa": "es-419",
  "es-pe": "es-419",
  "es-pr": "es-419",
  "es-py": "es-419",
  "es-sv": "es-419",
  "es-us": "es-419",
  "es-uy": "es-419",
  "es-ve": "es-419",
  "pt-ao": "pt-PT",
  "pt-ch": "pt-PT",
  "pt-cv": "pt-PT",
  "pt-fr": "pt-PT",
  "pt-gq": "pt-PT",
  "pt-gw": "pt-PT",
  "pt-lu": "pt-PT",
  "pt-mo": "pt-PT",
  "pt-mz": "pt-PT",
  "pt-pt": "pt",
  "pt-st": "pt-PT",
  "pt-tl": "pt-PT",
  "az-arab": "und",
  "az-cyrl": "und",
  "blt-latn": "und",
  "bm-nkoo": "und",
  "bs-cyrl": "und",
  "byn-latn": "und",
  "cu-glag": "und",
  "dje-arab": "und",
  "dyo-arab": "und",
  "en-dsrt": "und",
  "en-shaw": "und",
  "ff-adlm": "und",
  "ff-arab": "und",
  "ha-arab": "und",
  "hi-latn": "hi",
  "iu-latn": "und",
  "kk-arab": "und",
  "ks-deva": "und",
  "ku-arab": "und",
  "ky-arab": "und",
  "ky-latn": "und",
  "ml-arab": "und",
  "mn-mong": "und",
  "mni-mtei": "und",
  "ms-arab": "und",
  "pa-arab": "und",
  "sat-deva": "und",
  "sd-deva": "und",
  "sd-khoj": "und",
  "sd-sind": "und",
  "shi-latn": "und",
  "so-arab": "und",
  "sr-latn": "und",
  "sw-arab": "und",
  "tg-arab": "und",
  "ug-cyrl": "und",
  "uz-arab": "und",
  "uz-cyrl": "und",
  "vai-latn": "und",
  "wo-arab": "und",
  "yo-arab": "und",
  "yue-hans": "und",
  "zh-hant": "und",
  "zh-hant-hk": "zh-Hant",
  "zh-hant-mo": "zh-Hant-HK",
  "en-001": "en",
  "en-150": "en-001",
  "es-419": "es",
}

function getCldrParentLocale(locale: string): string | undefined {
  const key = locale.toLowerCase()
  return Object.hasOwn(parentLocales, key) ? parentLocales[key] : undefined
}
