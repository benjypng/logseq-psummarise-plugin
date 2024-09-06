import '@logseq/libs'

import { BlockEntity } from '@logseq/libs/dist/LSPlugin'

import { settings } from './settings'
import { goSummarise } from './utils'

const main = async () => {
  console.log('logseq-psummarise-plugin loaded')

  // SUMMARISE BLOCK
  logseq.Editor.registerBlockContextMenuItem('Psummarise block', async (e) => {
    const arrBlk: BlockEntity[] = []
    const blk = await logseq.Editor.getBlock(e.uuid)
    if (!blk) return
    arrBlk.push(blk)
    goSummarise(arrBlk)
  })

  // SUMMARISE BLOCK AND CHILD BLOCKS
  logseq.Editor.registerBlockContextMenuItem(
    'Psummarise block and children',
    async (e) => {
      const arrBlk: BlockEntity[] = []
      const blk = await logseq.Editor.getBlock(e.uuid, {
        includeChildren: true,
      })
      if (!blk) return
      arrBlk.push(blk)
      goSummarise(arrBlk)
    },
  )

  // SUMMARISE PAGE
  logseq.provideModel({
    async extract() {
      const pageBT: BlockEntity[] =
        await logseq.Editor.getCurrentPageBlocksTree()
      if (!pageBT) {
        logseq.UI.showMsg(
          'This function is not available in the rolling journal page. It can only be used on a single journal or regular page',
          'error',
        )
        return
      }
      goSummarise(pageBT)
    },
  })

  logseq.App.registerUIItem('toolbar', {
    key: 'logseq-psummarise-plugin',
    template: `<a data-on-click="extract" class="button"><i class="ti ti-underline"></i></a>`,
  })
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error)
