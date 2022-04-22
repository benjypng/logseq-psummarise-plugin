import "@logseq/libs";
import { BlockEntity, IBatchBlock } from "@logseq/libs/dist/LSPlugin.user";
import { recurseFirstCut } from "./recursiveHighlights";
import { callSettings } from "./callSettings";
import { createSecondCutBtn } from "./createSecondCutBtn";

const uniqueIdentifier = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "");

const main = async () => {
  console.log("logseq-psummarise-plugin loaded");

  callSettings();

  logseq.provideModel({
    async extract() {
      ///////////////////
      //// FIRST CUT ////
      ///////////////////
      // Get matches
      const pageBT: BlockEntity[] =
        await logseq.Editor.getCurrentPageBlocksTree();
      const firstCutArr: { highlights: string[]; id: string }[] = [];

      recurseFirstCut(pageBT, firstCutArr);

      // Create heading block
      const layerOneBlock: BlockEntity = await logseq.Editor.insertBlock(
        pageBT[0].uuid,
        `${
          logseq.settings.layer1
        } {{renderer :secondCut_${uniqueIdentifier()}}}`,
        {
          before:
            pageBT[0].content.includes(":: ") &&
            !pageBT[0].content.includes("id:: ")
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
    },
  });

  logseq.App.registerUIItem("toolbar", {
    key: "logseq-psummarise-plugin",
    template: `<a data-on-click="extract" class="button"><i class="ti ti-underline"></i></a>`,
  });
};

logseq.ready(main).catch(console.error);
