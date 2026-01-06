export type TranslationIoSyncRequest = {
  client: "lingui"
  version: string
  source_language: string
  target_languages: string[]
  segments: TranslationIoSegment[]

  purge?: boolean
}
export type TranslationIoInitRequest = {
  client: "lingui"
  version: string
  source_language: string
  target_languages: string[]
  segments: { [locale: string]: TranslationIoSegment[] }
}
export type TranslationIoSegment = {
  type: string
  source: string
  target?: string
  context?: string
  references?: string[]
  comment?: string
}
export type TranslationIoProject = {
  name: string
  url: string
}
export type TranslationIoResponse = {
  errors?: string[]
  project?: TranslationIoProject
  segments?: { [locale: string]: TranslationIoSegment[] }
}

export type FetchResult<T> =
  | { data: T; error: undefined }
  | { error: { response: Response; message: string }; data: undefined }

// export type TranslationIoResponse =
//   | TranslationIoErrorResponse
//   | TranslationProjectResponse
//
// type TranslationIoErrorResponse = {
//   errors: string[]
// }

// type TranslationProjectResponse = {
//   errors: null
//   project: TranslationIoProject
//   segments: { [locale: string]: TranslationIoSegment[] }
// }

export type HttpRequestFunction = (
  action: "init" | "sync",
  request: TranslationIoSyncRequest,
  apiKey: string
) => Promise<FetchResult<TranslationIoResponse>>

async function post<Resp>(
  url: string,
  request: unknown
): Promise<FetchResult<Resp>> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    return {
      error: {
        response,
        message: `Request failed with ${response.status} ${
          response.statusText
        } status. Body: ${await response.text()}`,
      },
      data: undefined,
    }
  }

  return { data: await response.json(), error: undefined }
}

export async function tioSync(
  request: TranslationIoSyncRequest,
  apiKey: string
): Promise<FetchResult<TranslationIoResponse>> {
  return post<TranslationIoResponse>(
    `https://translation.io/api/v1/segments/sync.json?api_key=${apiKey}`,
    request
  )
}

export async function tioInit(
  request: TranslationIoInitRequest,
  apiKey: string
): Promise<FetchResult<TranslationIoResponse>> {
  return post<TranslationIoResponse>(
    `https://translation.io/api/v1/segments/init.json?api_key=${apiKey}`,
    request
  )
}
