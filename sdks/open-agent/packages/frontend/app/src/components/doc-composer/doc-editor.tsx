import { ViewportElementExtension } from '@blocksuite/affine/shared/services';
import type { Store } from '@blocksuite/affine/store';
import { useEffect, useMemo, useRef } from 'react';

import { editorEffects, LitDocEditor } from './adapters';
import type { PageEditor } from './page-editor';
import { getComposerViewManager } from './specs';

editorEffects();

const usePatchSpecs = (readonly: boolean) => {
  const patchedSpecs = useMemo(() => {
    const manager = getComposerViewManager();
    return manager
      .get(readonly ? 'preview-page' : 'page')
      .concat([ViewportElementExtension('.bs-editor-viewport')]);
  }, [readonly]);

  return patchedSpecs;
};

interface DocEditorProps {
  readonly?: boolean;
  doc: Store;
  // for performance, we only update the snapshot when the editor blurs
  onChange?: () => void;
}

export const DocEditor = ({ readonly, doc, onChange }: DocEditorProps) => {
  const editorRef = useRef<PageEditor>(null);
  const specs = usePatchSpecs(!!readonly);

  useEffect(() => {
    if (doc) {
      const subscription = doc.slots.blockUpdated.subscribe(() => {
        if (onChange) {
          onChange();
        }
      });
      return () => {
        subscription?.unsubscribe();
      };
    }
    return;
  }, [doc, onChange]);

  // use doc.id to force re-render when doc changes
  return (
    <div className="bs-editor-viewport">
      <LitDocEditor key={doc.id} ref={editorRef} specs={specs} doc={doc} />
    </div>
  );
};
