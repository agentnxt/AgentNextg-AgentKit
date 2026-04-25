import { AffineSchemas } from '@blocksuite/affine/schemas';
import {
  nanoid,
  Schema,
  type Store,
  Text,
  Transformer,
} from '@blocksuite/affine/store';
import { MarkdownAdapter } from '@blocksuite/affine-shared/adapters';
import { SimpleLayoutConverter } from '@blocksuite/affine-shared/adapters';
import { Container } from '@blocksuite/global/di';
import { Doc as YDoc } from 'yjs';

import { getStoreManager } from './store';
import { WorkspaceImpl } from './workspace';

const getTempWorkspace = () => {
  const collection = new WorkspaceImpl({
    rootDoc: new YDoc({ guid: 'markdownToDoc' + nanoid() }),
    blobSource: {
      name: 'cloud',
      readonly: true,
      get: async () => {
        // const record =
        //   await this.workspaceService.workspace.engine.blob.get(key);
        // return record ? new Blob([record.data], { type: record.mime }) : null;
        // TODO: implement this
        return null;
      },
      set() {
        return Promise.resolve('');
      },
      delete() {
        return Promise.resolve();
      },
      list() {
        return Promise.resolve([]);
      },
    },
  });
  collection.meta.initialize();
  return collection;
};

let _schema: Schema | null = null;

export function getAFFiNEWorkspaceSchema() {
  if (!_schema) {
    _schema = new Schema();

    _schema.register([...AffineSchemas]);
  }

  return _schema;
}

const getTransformer = () => {
  const collection = getTempWorkspace();
  const schema = getAFFiNEWorkspaceSchema();
  const transformer = new Transformer({
    schema,
    blobCRUD: collection.blobSync,
    docCRUD: {
      create: (id: string) => {
        const doc = collection.createDoc(id);
        return doc.getStore({ id });
      },
      get: (id: string) => collection.getDoc(id)?.getStore({ id }) ?? null,
      delete: (id: string) => collection.removeDoc(id),
    },
  });
  return transformer;
};

const getMarkdownAdapter = (transformer = getTransformer()) => {
  const extensions = getStoreManager().config.init().value.get('store');
  const container = new Container();
  extensions.forEach(ext => {
    ext.setup(container);
  });
  const mdAdapter = new MarkdownAdapter(transformer, container.provider());
  return mdAdapter;
};

const markDownToDoc = async (markdown: string): Promise<Store | undefined> => {
  try {
    // Use SimpleLayoutConverter to convert markdown to multiple note snapshots (supports splitting)
    const noteSnapshots =
      await SimpleLayoutConverter.markdownToMultipleSnapshots(markdown);

    // Create correct page structure with all notes as child blocks of page
    const pageSnapshot = {
      type: 'block' as const,
      id: nanoid(),
      flavour: 'affine:page',
      props: {
        title: {
          '$blocksuite:internal:text$': true,
          delta: [],
        },
      },
      children: noteSnapshots,
    };

    // Create DocSnapshot structure
    const docSnapshot = {
      type: 'page' as const,
      meta: {
        id: 'temp-doc-' + Date.now(),
        title: '',
        createDate: Date.now(),
        tags: [],
      },
      blocks: pageSnapshot,
    };

    // Use transformer to convert snapshot to Store
    const transformer = getTransformer();
    const doc = await transformer.snapshotToDoc(docSnapshot);

    if (!doc) {
      console.error('Failed to convert snapshot to doc');
    }
    return doc;
  } catch (error) {
    console.error('Failed to convert markdown to doc:', error);
    return undefined;
  }
};

const docToMarkdown = async (doc: Store) => {
  const transformer = getTransformer();
  const mdAdapter = getMarkdownAdapter(transformer);
  const markdown = await mdAdapter.fromDoc(doc);
  if (!markdown) {
    console.error('Failed to convert doc to markdown');
  }
  return markdown?.file ?? '';
};

const createStore = async (markdown?: string): Promise<Store | undefined> => {
  if (markdown !== undefined) {
    return markDownToDoc(markdown);
  } else {
    const collection = getTempWorkspace();
    if (!collection) {
      throw new Error('Temp workspace not found');
    }

    // Create a temporary doc with proper structure
    const doc = collection.createDoc();
    const store = doc.getStore();
    store.load(() => {
      // Add root page block with empty title
      const rootId = store.addBlock('affine:page', {
        title: new Text(''),
      });

      // Add note block
      const noteId = store.addBlock('affine:note', {}, rootId);

      // Add default paragraph block
      store.addBlock('affine:paragraph', {}, noteId);
    });

    // Reset history to prevent initial creation operations from being undone
    store.resetHistory();

    return store;
  }
};

export const snapshotHelper = {
  markDownToDoc,
  docToMarkdown,
  createStore,
};
