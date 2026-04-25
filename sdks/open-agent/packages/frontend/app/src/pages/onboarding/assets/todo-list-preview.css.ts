import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const scrollMask = style({
  vars: {
    '--bg': cssVarV2.layer.background.secondary,
  },
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 1,

  '::before': {
    content: '',
    width: '50px',
    height: '100%',
    position: 'absolute',
    left: 0,
    background: `linear-gradient(to right, var(--bg), transparent)`,
  },
  '::after': {
    content: '',
    width: '50px',
    height: '100%',
    position: 'absolute',
    right: 0,
    background: `linear-gradient(to left, var(--bg), transparent)`,
  },
});
