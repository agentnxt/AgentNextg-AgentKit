import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const card = style({
  vars: {
    '--border-width': '1.5px',
  },
  borderRadius: 16,
  position: 'relative',
  '::after': {
    content: '',
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
    padding: 'var(--border-width)',
    borderRadius: 'inherit',
    background: `linear-gradient(155deg, ${cssVarV2.status.success}  0%, ${cssVarV2.layer.insideBorder.border} 70%)`,
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) border-box',
    maskComposite: 'exclude',
    pointerEvents: 'none',
  },
});
