import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";

export const callSettings = () => {
  const settings: SettingSchemaDesc[] = [
    {
      key: "layer1",
      type: "string",
      default: "> Layer 1",
      description:
        "Specifies the name of the Layer 1 block that your highlights would go under. Supports markdown.",
      title: "Name of Layer 1 block (bold text)",
    },
    {
      key: "layer2",
      type: "string",
      default: "> Layer 2",
      description:
        "Specifies the name of the Layer 2 block that your highlights would go under. Supports markdown.",
      title: "Name of Layer 2 block (highlighted text)",
    },
    {
      key: "highlightsRefChar",
      type: "string",
      default: "link",
      description:
        "Specifies the text or special character you want to use to click to go to the source block.",
      title: "Customise highlights link",
    },
  ];

  logseq.useSettingsSchema(settings);
};
