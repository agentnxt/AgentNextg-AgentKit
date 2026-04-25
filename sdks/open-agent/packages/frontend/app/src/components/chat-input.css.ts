import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

import { text } from '@/lib/utils';

export const container = style({
  boxShadow: '0px 2px 3px rgba(0,0,0,0.05)',
});

export const modelSelector = style({
  color: cssVarV2.icon.primary,
});
export const send = style({
  backgroundColor: cssVarV2.button.primary,
  borderRadius: '50%',
  width: 28,
  height: 28,
  cursor: 'pointer',

  selectors: {
    '&[data-disabled]': {
      backgroundColor: cssVarV2.button.disable,
    },
  },
});
export const abort = style({
  backgroundColor: 'black',
  borderRadius: '50%',
  width: 28,
  height: 28,
  cursor: 'pointer',
});

export const groupLabel = style({
  ...text(12, 20, 500),
  color: cssVarV2.text.tertiary,
  padding: '0px 4px',
  height: 20,
  marginTop: 8,
});

export const contextPreview = style({
  height: 40,
  border: `0.5px solid ${cssVarV2.layer.insideBorder.border}`,
  background: cssVarV2.layer.background.secondary,
  padding: '0px 6px',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  borderRadius: 8,
  maxWidth: 250,
});
export const contextPreviewIcon = style({
  width: 24,
  height: 24,
  fontSize: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: cssVarV2.icon.primary,
});
export const contextPreviewTitle = style({
  ...text(14, 20, 500),
  flex: 1,
  color: '#000',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});
