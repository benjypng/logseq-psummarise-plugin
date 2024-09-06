import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin'

export const settings: SettingSchemaDesc[] = [
  {
    key: 'layer1',
    type: 'string',
    default: '> Layer 1',
    description:
      'Specifies the name of the Layer 1 block that your highlights would go under. Supports markdown.',
    title: 'Name of Layer 1 block',
  },
  {
    key: 'layer1Highlights',
    type: 'enum',
    enumPicker: 'radio',
    enumChoices: ['==Highlights==', '**Bold**'],
    default: '**Bold**',
    description:
      'Indicate whether you use bold or highlights for your 1st layer.',
    title: 'Layer 1 Highlight Method',
  },
  {
    key: 'layer2',
    type: 'string',
    default: '> Layer 2',
    description:
      'Specifies the name of the Layer 2 block that your highlights would go under. Supports markdown.',
    title: 'Name of Layer 2 block',
  },
  {
    key: 'layer2Highlights',
    type: 'enum',
    enumPicker: 'radio',
    enumChoices: ['==Highlights==', '**Bold**'],
    default: '==Highlights==',
    description:
      'Indicate whether you use bold or highlights for your 2nd layer.',
    title: 'Layer 2 Highlight Method',
  },
  {
    key: 'highlightsRefChar',
    type: 'string',
    default: '*',
    description:
      'Specifies the text or special character you want to use to click to go to the source block.',
    title: 'Customise highlights link',
  },
]
