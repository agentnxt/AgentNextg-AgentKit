import {
  BlockModel,
  BlockSchemaExtension,
  defineBlockSchema,
} from '@blocksuite/store';

export const DividerBlockSchema = defineBlockSchema({
  flavour: 'affine:divider',
  metadata: {
    version: 1,
    role: 'content',
    parent: [
      'affine:note',
      'affine:database',
      'affine:paragraph',
      'affine:list',
      'affine:edgeless-text',
      'affine:callout',
      'affine:column',
    ],
    children: [],
  },
  toModel: () => new DividerBlockModel(),
});

type Props = {
  text: string;
};

export class DividerBlockModel extends BlockModel<Props> {}

export const DividerBlockSchemaExtension =
  BlockSchemaExtension(DividerBlockSchema);
