import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

import { text } from '@/lib/utils';

export const todoHeader = style({
  color: cssVarV2.text.secondary,
  ...text(14, 26, 400),
});

export const todoCard = style({
  height: 62,
  selectors: {
    '&[data-status="done"]': {},
  },
});

export const todoCardIcon = style({
  selectors: {
    [`${todoCard}[data-status="done"] &`]: {
      color: cssVarV2.icon.primary,
    },
    [`${todoCard}[data-status="todo"] &`]: {
      color: cssVarV2.icon.secondary,
    },
  },
});

export const todoCardContent = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'start',
  width: 0,
  flex: 1,
});
export const todoCardTitle = style({
  ...text(14, 22, 500),
  display: 'inline-block',
  position: 'relative',
  selectors: {
    [`${todoCard}[data-status="done"] &`]: {
      color: cssVarV2.text.tertiary,
      textDecoration: 'line-through',
    },
  },
});

export const todoCardSubTitleContainer = style({
  width: '100%',
  height: 22,
  overflow: 'hidden',
  transition: 'height 0.2s ease-in-out',
  selectors: {
    [`${todoCard}[data-status="done"] &`]: {
      display: 'none',
    },
  },
});
export const todoCardSubTitle = style({
  ...text(14, 22, 400),
  color: cssVarV2.text.tertiary,
});
