import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";

const findBold = (content: string) => {
  const rxBlockRef = new RegExp(`(?<=\\*\\*)(\\S.*?)(?=\\*\\*)`, `g`);
  return content.match(rxBlockRef);
};
const findHighlights = (content: string) => {
  const rxBlockRef = new RegExp(`(?<=\\=\\=)(\\S.*?)(?=\\=\\=)`, `g`);
  return content.match(rxBlockRef);
};

// first cut is bold
// second cut is highlights

export const recurseFirstCut = async (
  arr: BlockEntity[],
  highlightsArr: { highlights: string[]; id: string }[]
) => {
  for (let b of arr) {
    const payload = {
      highlights: findBold(b.content),
      id: b.uuid,
    };
    if (payload.highlights !== null) {
      highlightsArr.push(payload);
      if (!b.properties.id) {
        await logseq.Editor.upsertBlockProperty(b.uuid, "id", b.uuid);
      }
    }
    if (b.children.length > 0) {
      recurseFirstCut(b.children as BlockEntity[], highlightsArr);
    } else {
      continue;
    }
  }
};

export const recurseSecondCut = async (
  arr: BlockEntity[],
  highlightsArr: { highlights: string[]; id: string }[]
) => {
  for (let b of arr) {
    const payload = {
      highlights: findHighlights(b.content),
      id: b.uuid,
    };
    if (payload.highlights !== null) {
      highlightsArr.push(payload);
      if (!b.properties.id) {
        await logseq.Editor.upsertBlockProperty(b.uuid, "id", b.uuid);
      }
    }
    if (b.children.length > 0) {
      recurseSecondCut(b.children as BlockEntity[], highlightsArr);
    } else {
      continue;
    }
  }
};
