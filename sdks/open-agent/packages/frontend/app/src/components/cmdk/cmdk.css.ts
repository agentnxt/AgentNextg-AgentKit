import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

import { text } from '@/lib/utils';

export const groupLabel = style({
  width: '100%',
  height: 28,
  padding: '8px 16px 8px 8px',
  ...text(12, 20, 500),
  color: cssVarV2.text.tertiary,
});

export const item = style({
  height: 48,

  selectors: {
    '&[data-active="true"]': {
      backgroundColor: cssVarV2('layer/background/hoverOverlay'),
    },
    '&:hover': {
      backgroundColor: cssVarV2('layer/background/hoverOverlay'),
    },
  },
});
