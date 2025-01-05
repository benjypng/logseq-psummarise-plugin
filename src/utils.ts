import { BlockEntity, IBatchBlock } from '@logseq/libs/dist/LSPlugin.user'

import { createSecondCutBtn } from './createSecondCutBtn'
import { recurseFirstCut } from './recursiveHighlights'

const uniqueIdentifier = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')

export const goSummarise = async (arrOfBlocks: BlockEntity[]) => {
  ///////////////////
  //// FIRST CUT ////
  ///////////////////
  // Get matches
  const firstCutArr: { highlights: string[]; id: string }[] = []
  await recurseFirstCut(arrOfBlocks, firstCutArr)
  // Check if any highlights exist in the array
  const hasHighlights = firstCutArr.some(item => item.highlights && item.highlights.length > 0)
  
  if (firstCutArr.length === 0 || !hasHighlights) {
    logseq.UI.showMsg(
      'No highlights found. Please ensure that you have highlighted something, or that the plugin settings is as per your workflow.',
      'error',
    )
    return
  }

  // Create heading block
  if (!arrOfBlocks[0]) return
  const layerOneBlock = await logseq.Editor.insertBlock(
    arrOfBlocks[0].uuid,
    `${logseq.settings!.layer1} {{renderer :secondCut_${uniqueIdentifier()}}}`,
    {
      before:
        arrOfBlocks[0].content.includes(':: ') &&
        !arrOfBlocks[0].content.includes('id:: ')
          ? false
          : true,
      sibling: true,
    },
  )

  // Create batch block
  const highlightsBatchBlks: IBatchBlock[] = []
  const { preferredFormat } = await logseq.App.getUserConfigs()

  for (const h of firstCutArr) {
    if (h.highlights === null || h.highlights.length === 0) {
      continue
    }
    
    for (const i of h.highlights) {
      const payload = {
        content: preferredFormat === 'org'
          ? `${i} [[${h.id}][${logseq.settings!.highlightsRefChar}]]`
          : `${i} [${logseq.settings!.highlightsRefChar}](${h.id})`,
      }
      highlightsBatchBlks.push(payload)
    }
  }

  await logseq.Editor.insertBatchBlock(
    layerOneBlock!.uuid,
    highlightsBatchBlks,
    {
      before: false,
      sibling: false,
    },
  )

  // Create extract highlights button and implement hack to render it
  if (!layerOneBlock) return
  createSecondCutBtn(layerOneBlock)
  await logseq.Editor.editBlock(layerOneBlock.uuid, { pos: 1 })
  await logseq.Editor.exitEditingMode()

  // Open summary block in right sidebar
  logseq.Editor.openInRightSidebar(layerOneBlock.uuid)
}
