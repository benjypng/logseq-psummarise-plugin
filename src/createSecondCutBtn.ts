import "@logseq/libs";
import {
  BlockEntity,
  IBatchBlock,
  PageEntity,
} from "@logseq/libs/dist/LSPlugin.user";
import { recurseSecondCut } from "./recursiveHighlights";

export const createSecondCutBtn = (
  headerBlk: BlockEntity,
  currPage: PageEntity
) => {
  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const [type] = payload.arguments;
    const id = type.split("_")[1]?.trim();
    const btnId = `secondCut_${id}`;

    if (!type.startsWith(":secondCut_")) return;

    logseq.provideModel({
      async secondCut() {
        ///////////////////
        //// SECOND CUT ////
        ///////////////////
        const blockBT: BlockEntity = await logseq.Editor.getBlock(
          headerBlk.uuid,
          { includeChildren: true }
        );
        const blockBTChildren: BlockEntity[] =
          blockBT.children as BlockEntity[];
        const secondCutArr: { highlights: string[]; id: string }[] = [];
        recurseSecondCut(blockBTChildren, secondCutArr);

        const layerTwoBlock: BlockEntity = await logseq.Editor.insertBlock(
          currPage.name,
          `${logseq.settings.layer2}`,
          { before: false, sibling: true, isPageBlock: true }
        );
        // Create batch block
        const highlightsBatchBlks: Array<IBatchBlock> = [];
        for (let h of secondCutArr) {
          if (h.highlights === null) {
            continue;
          } else if (h.highlights.length === 1) {
            const payload = {
              content: `${h.highlights[0]} [${logseq.settings.highlightsRefChar}](${h.id})`,
            };
            highlightsBatchBlks.push(payload);
          } else {
            for (let i of h.highlights) {
              const payload = {
                content: `${i} [${logseq.settings.highlightsRefChar}](${h.id})`,
              };
              highlightsBatchBlks.push(payload);
            }
          }
        }

        await logseq.Editor.insertBatchBlock(
          layerTwoBlock.uuid,
          highlightsBatchBlks,
          {
            before: false,
            sibling: false,
          }
        );

        logseq.Editor.openInRightSidebar(layerTwoBlock.uuid);
      },
    });

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
    `);

    logseq.provideUI({
      key: `${btnId}`,
      slot,
      reset: true,
      template: `<button data-on-click="secondCut" class="renderBtn">Extract Highlights</button>`,
    });
  });
};
