import { BlockEntity, IBatchBlock } from "@logseq/libs/dist/LSPlugin.user";
import { recurseFirstCut } from "./recursiveHighlights";
import { createSecondCutBtn } from "./createSecondCutBtn";

const uniqueIdentifier = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "");

export const goSummarise = async (arrOfBlocks: BlockEntity[]) => {
  ///////////////////
  //// FIRST CUT ////
  ///////////////////
  // Get matches
  const firstCutArr: { highlights: string[]; id: string }[] = [];

  recurseFirstCut(arrOfBlocks, firstCutArr);

  if (firstCutArr.length === 0) {
    logseq.App.showMsg(
      "No highlights found. Please ensure that you have highlighted something, or that the plugin settings is as per your workflow.",
      "error"
    );
    return;
  }

  // Create heading block
  const layerOneBlock: BlockEntity = await logseq.Editor.insertBlock(
    arrOfBlocks[0].uuid,
    `${logseq.settings.layer1} {{renderer :secondCut_${uniqueIdentifier()}}}`,
    {
      before:
        arrOfBlocks[0].content.includes(":: ") &&
        !arrOfBlocks[0].content.includes("id:: ")
          ? false
          : true,
      sibling: true,
    }
  );

  // Create batch block
  const highlightsBatchBlks: Array<IBatchBlock> = [];
  for (let h of firstCutArr) {
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
    layerOneBlock.uuid,
    highlightsBatchBlks,
    {
      before: false,
      sibling: false,
    }
  );

  // Create extract highlights button and implement hack to render it
  createSecondCutBtn(layerOneBlock);
  await logseq.Editor.editBlock(layerOneBlock.uuid, { pos: 1 });
  await logseq.Editor.exitEditingMode();

  // Open summary block in right sidebar
  logseq.Editor.openInRightSidebar(layerOneBlock.uuid);
};
