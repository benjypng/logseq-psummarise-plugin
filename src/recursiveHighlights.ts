import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import {
  rxMdBoldRef,
  rxMdHighlightRef,
  rxOrgBoldRef,
  rxOrgHighlightRef,
} from './constants'

const findBold = (content: string, preferredFormat: 'markdown' | 'org') => {
  const rxBlockRef = preferredFormat === 'markdown' ? rxMdBoldRef : rxOrgBoldRef
  return content.match(rxBlockRef) ?? []
}
const findHighlights = (
  content: string,
  preferredFormat: 'markdown' | 'org',
) => {
  const rxBlockRef =
    preferredFormat === 'markdown' ? rxMdHighlightRef : rxOrgHighlightRef
  return content.match(rxBlockRef) ?? []
}

// first cut is bold
// second cut is highlights

export const recurseFirstCut = async (
  arr: BlockEntity[],
  highlightsArr: { highlights: string[]; id: string }[],
) => {
  const { preferredFormat } = await logseq.App.getUserConfigs()

  for (let b of arr) {
    const payload = {
      highlights:
        logseq.settings!.layer1Highlights === '**Bold**'
          ? findBold(b.content, preferredFormat)
          : findHighlights(b.content, preferredFormat),
      id: b.uuid,
    }
    highlightsArr.push(payload)

    if (!b.properties?.id) {
      await logseq.Editor.upsertBlockProperty(b.uuid, 'id', b.uuid)
    }

    if (b.children && b.children.length > 0) {
      recurseFirstCut(b.children as BlockEntity[], highlightsArr)
    } else {
      continue
    }
  }
}

export const recurseSecondCut = async (
  arr: BlockEntity[],
  highlightsArr: { highlights: string[]; id: string }[],
) => {
  const { preferredFormat } = await logseq.App.getUserConfigs()

  for (let b of arr) {
    const payload = {
      highlights:
        logseq.settings!.layer2Highlights === '**Bold**'
          ? findBold(b.content, preferredFormat)
          : findHighlights(b.content, preferredFormat),
      id: b.uuid,
    }

    highlightsArr.push(payload)

    if (!b.properties?.id) {
      await logseq.Editor.upsertBlockProperty(b.uuid, 'id', b.uuid)
    }

    if (b.children && b.children.length > 0) {
      recurseSecondCut(b.children as BlockEntity[], highlightsArr)
    } else {
      continue
    }
  }
}
