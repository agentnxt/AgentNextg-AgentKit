import { style } from '@vanilla-extract/css';

export const container = style({
  transition: `width 0.2s cubic-bezier(.13,.67,.1,1)`,
});
export const resizing = style({
  transition: `none`,
});

export const resizeTrigger = style({});
export const resizeTriggerBar = style({
  opacity: 0,
  selectors: {
    [`${resizeTrigger}:hover &, &.resizing`]: {
      opacity: 1,
    },
  },
});
