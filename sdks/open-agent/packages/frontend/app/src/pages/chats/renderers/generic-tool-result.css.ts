import { style } from '@vanilla-extract/css';

export const contentWrapper = style({
  overflow: 'hidden',
  display: 'grid',
  gridTemplateRows: '1fr',
  transition:
    'grid-template-rows 0.4s cubic-bezier(.07,.83,.46,1), opacity 0.4s ease',
  selectors: {
    '&[data-collapsed="true"]': {
      gridTemplateRows: '0fr',
      opacity: 0,
    },
  },
});

export const header = style({
  transition: 'border-color 0.4s ease',
  selectors: {
    '[data-collapsed="true"] &': {
      borderColor: 'transparent',
      transition: 'border-color 0.2s ease 0.4s',
    },
  },
});
