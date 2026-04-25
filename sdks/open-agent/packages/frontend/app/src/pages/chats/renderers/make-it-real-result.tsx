import { PageIcon } from '@blocksuite/icons/rc';

import { useOpenDocContext } from '@/contexts/doc-panel-context';

import { GenericToolResult } from './generic-tool-result';

interface MakeItRealResultProps {
  docId: string;
  title: string;
}

/**
 * Specialized UI component for displaying make_it_real tool results.
 * Shows the enhanced content as a clickable card that opens in the document panel.
 */
export function MakeItRealResult({ docId, title }: MakeItRealResultProps) {
  const { openDoc } = useOpenDocContext();

  const handleCardClick = () => {
    openDoc(docId);
  };

  return (
    <GenericToolResult
      icon={<PageIcon />}
      title={title}
      onClick={handleCardClick}
    />
  );
}
