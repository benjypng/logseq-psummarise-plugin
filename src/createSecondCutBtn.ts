import '@logseq/libs'

import { BlockEntity, IBatchBlock } from '@logseq/libs/dist/LSPlugin.user'

import { recurseSecondCut } from './recursiveHighlights'

export const createSecondCutBtn = (headerBlk: BlockEntity) => {
  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const [type] = payload.arguments
    if (!type) return

    const id = type.split('_')[1]?.trim()
    const btnId = `secondCut_${id}`

    if (!type.startsWith(':secondCut_')) return

    logseq.provideModel({
      async secondCut() {
        ///////////////////
        //// SECOND CUT ////
        ///////////////////
        const pageBT = await logseq.Editor.getCurrentPageBlocksTree()
        if (!pageBT || !pageBT[0]) return

        const blockBT = await logseq.Editor.getBlock(headerBlk.uuid, {
          includeChildren: true,
        })
        if (!blockBT) return

        const blockBTChildren: BlockEntity[] = blockBT.children as BlockEntity[]
        const secondCutArr: { highlights: string[]; id: string }[] = []
        recurseSecondCut(blockBTChildren, secondCutArr)

        if (secondCutArr.length === 0) {
          logseq.UI.showMsg(
            'No highlights found. Please ensure that you have highlighted something, or that the plugin settings is as per your workflow.',
            'error',
          )
          return
        }

        const layerTwoBlock = await logseq.Editor.insertBlock(
          pageBT[0].uuid,
          `${logseq.settings!.layer2}`,
          {
            before: pageBT[0].content.includes(':: ') ? false : true,
            sibling: true,
          },
        )
        if (!layerTwoBlock) return

        // Create batch block
        const highlightsBatchBlks: IBatchBlock[] = []
        for (const h of secondCutArr) {
          if (h.highlights === null) {
            continue
          } else if (h.highlights.length === 1) {
            const payload = {
              content: `${h.highlights[0]} [${logseq.settings!.highlightsRefChar}](${h.id})`,
            }
            highlightsBatchBlks.push(payload)
          } else {
            for (const i of h.highlights) {
              const payload = {
                content: `${i} [${logseq.settings!.highlightsRefChar}](${h.id})`,
              }
              highlightsBatchBlks.push(payload)
            }
          }
        }

        await logseq.Editor.insertBatchBlock(
          layerTwoBlock.uuid,
          highlightsBatchBlks,
          {
            before: false,
            sibling: false,
          },
        )

        logseq.Editor.openInRightSidebar(layerTwoBlock.uuid)
      },
    })

    logseq.provideStyle(`
      .renderBtn {
        border: 1px solid black;
        border-radius: 8px;
        padding: 3px;
        font-size: 80%;
        background-color: white;
        color: black;
      }
      .renderBtn:hover {
        background-color: black;
        color: white;
      }
    `)

    logseq.provideUI({
      key: `${btnId}`,
      slot,
      reset: true,
      template: `<button data-on-click="secondCut" class="renderBtn">Extract Highlights</button>`,
    })
  })
}
