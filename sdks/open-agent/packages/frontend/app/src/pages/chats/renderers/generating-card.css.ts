import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const contentMaskLayer = style({
  position: 'relative',
  color: cssVarV2.text.tertiary,
  selectors: {
    '&::after': {
      content: '',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      position: 'absolute',
      background:
        'linear-gradient(to bottom, white 0%, transparent 50%, white 100%)',
      pointerEvents: 'none',
    },
  },
});
