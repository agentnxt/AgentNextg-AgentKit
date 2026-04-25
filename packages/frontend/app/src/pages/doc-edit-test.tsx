import type { Store } from '@blocksuite/affine/store';
import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

import { DocEditor } from '@/components/doc-composer/doc-editor';
import { MarkdownText } from '@/components/ui/markdown';

import { snapshotHelper } from '../components/doc-composer/snapshot-helper';

const useTempDoc = (defaultMarkdown: string) => {
  const [doc, setDoc] = useState<Store | null>(null);
  useEffect(() => {
    snapshotHelper.createStore(defaultMarkdown).then(doc => {
      if (doc) {
        setDoc(doc);
      }
    });
    // oxlint-disable-next-line exhaustive-deps
  }, []);
  return doc;
};

export const DocEditTest = () => {
  const [markdown, setMarkdown] = useState(
    localStorage.getItem('test-markdown') ?? ''
  );
  const doc = useTempDoc(markdown);
  const updateMarkdown = useMemo(() => {
    const update = (doc: Store) => {
      snapshotHelper.docToMarkdown(doc).then(markdown => {
        setMarkdown(markdown);
        localStorage.setItem('test-markdown', markdown);
      });
    };
    return debounce(update, 1000);
  }, []);
  if (!doc) {
    return <div>Loading...</div>;
  }
  return (
    <div className="h-screen w-screen flex">
      <div className="flex-1 bg-amber-50">
        <DocEditor
          doc={doc}
          onChange={() => {
            updateMarkdown(doc);
          }}
        />
      </div>
      <div className="flex-1 bg-blue-200">
        <MarkdownText text={markdown} />
      </div>
    </div>
  );
};
