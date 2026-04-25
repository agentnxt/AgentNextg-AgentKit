import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

import { text } from '@/lib/utils';

export const library = style({
  ...text(18, 26, 600),
  color: '#000',
  letterSpacing: -0.24,
});

export const btn = style({
  color: cssVarV2.text.tertiary,
  selectors: {
    '&[data-active="true"]': {
      color: cssVarV2.text.primary,
      backgroundColor: cssVarV2('layer/background/hoverOverlay'),
    },
  },
});

export const dateGroupHeader = style({
  color: cssVarV2.text.secondary,
  padding: '0 12px',
  selectors: {
    '&:first-letter': {
      textTransform: 'uppercase',
    },
  },
});

export const listItem = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px',
  borderRadius: 8,
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      backgroundColor: cssVarV2('layer/background/hoverOverlay'),
    },
  },
});

export const listItemIcon = style({
  width: 20,
  height: 20,
  fontSize: 20,
  color: cssVarV2.icon.primary,
  marginRight: 12,
});

export const listItemTitle = style({
  ...text(14, 20, 500),
  color: cssVarV2.text.primary,
  width: 0,
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});
