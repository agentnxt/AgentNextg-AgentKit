import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

import { text } from '@/lib/utils';

export const hoverableItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  height: 30,
  padding: '0px 8px',
  color: cssVarV2('text/primary'),
  borderRadius: 8,
  ':hover': {
    backgroundColor: cssVarV2('layer/background/hoverOverlay'),
  },
});

export const hoverableIcon = style({
  width: 20,
  height: 20,
  fontSize: 20,
  flexShrink: 0,
  color: cssVarV2('icon/primary'),
});

export const hoverableLabel = style({
  width: 0,
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: 14,
});

export const sectionTitle = style({
  ...text(12, 20, 500),
  height: 20,
  borderRadius: 2,
  color: cssVarV2('text/tertiary'),
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  // cursor: 'pointer',
  // ':hover': {
  //   backgroundColor: cssVarV2('layer/background/hoverOverlay'),
  // },
});

export const listItem = style({
  height: 30,
  borderRadius: 4,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '0px 8px',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: cssVarV2('layer/background/hoverOverlay'),
  },
});
export const listItemIcon = style({
  width: 20,
  height: 20,
  fontSize: 20,
  flexShrink: 0,
  color: cssVarV2('icon/primary'),
});
export const listItemLabel = style({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: 14,
  userSelect: 'none',
});

export const activeItem = style({
  backgroundColor: cssVarV2('layer/background/hoverOverlay'),
});
