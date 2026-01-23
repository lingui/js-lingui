import { MessageType } from "@lingui/conf"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"
import { TranslationIoSegment } from "./translationio-api"

const EXPLICIT_ID_FLAG = "js-lingui-explicit-id"
const EXPLICIT_ID_AND_CONTEXT_FLAG = "js-lingui-explicit-id-and-context"

function isGeneratedId(id: string, message: MessageType): boolean {
  return id === generateMessageId(message.message, message.context)
}

const joinOrigin = (origin: [file: string, line?: number]): string =>
  origin.join(":")

const splitOrigin = (origin: string) => {
  const [file, line] = origin.split(":")
  return [file, line ? Number(line) : null] as [file: string, line: number]
}

export function createSegmentFromLinguiItem(key: string, item: MessageType) {
  const itemHasExplicitId = !isGeneratedId(key, item)
  const itemHasContext = !!item.context

  const segment: TranslationIoSegment = {
    type: "source", // No way to edit text for source language (inside code), so not using "key" here
    source: "",
    context: "",
    references: [],
    comment: "",
  }

  // For segment.source & segment.context, we must remain compatible with projects created/synced before Lingui V4
  if (itemHasExplicitId) {
    segment.source = item.message || item.translation
    segment.context = key
  } else {
    segment.source = item.message || item.translation

    if (itemHasContext) {
      segment.context = item.context
    }
  }

  if (item.origin) {
    segment.references = item.origin.map(joinOrigin)
  }

  // Since Lingui v4, when using explicit IDs, Lingui automatically adds 'js-lingui-explicit-id' to the extractedComments array
  const comments: string[] = []

  if (itemHasExplicitId) {
    if (itemHasContext) {
      // segment.context is already used for the explicit ID, so we need to pass the context (for translators) in segment.comment
      comments.push(item.context, EXPLICIT_ID_AND_CONTEXT_FLAG)
    } else {
      comments.push(EXPLICIT_ID_FLAG)
    }
  }

  segment.comment = [...comments, ...(item.comments || [])].join(" | ")

  return segment
}

export function createLinguiItemFromSegment(segment: TranslationIoSegment) {
  const segmentHasExplicitId = segment.comment?.includes(EXPLICIT_ID_FLAG)
  const segmentHasExplicitIdAndContext = segment.comment?.includes(
    EXPLICIT_ID_AND_CONTEXT_FLAG
  )

  const item: MessageType = {
    translation: segment.target!,
    origin: segment.references?.length
      ? segment.references.map(splitOrigin)
      : [],
    message: segment.source,
    comments: [],
  }

  let id: string = null

  if (segmentHasExplicitId || segmentHasExplicitIdAndContext) {
    id = segment.context!
  } else {
    id = generateMessageId(segment.source, segment.context)
    item.context = segment.context
  }

  if (segment.comment) {
    item.comments = segment.comment.split(" | ").filter(
      // drop flags from comments
      (comment) =>
        comment !== EXPLICIT_ID_AND_CONTEXT_FLAG && comment !== EXPLICIT_ID_FLAG
    )

    // We recompose a target PO Item that is consistent with the source PO Item
    if (segmentHasExplicitIdAndContext) {
      item.context = item.comments.shift()
    }
  }

  return [id, item] as const
}
