import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const root = style({
  maxWidth: '400px',
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  borderRadius: 16,
  gap: 12,
  backgroundColor: cssVarV2('aI/applyBackground'),
  boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.05)',
  border: `1px solid ${cssVarV2('input/border/default')}`,
});

export const icon = style({
  width: 24,
  height: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const content = style({
  flex: 1,
  overflow: 'hidden',
});

export const title = style({
  fontWeight: 500,
  lineHeight: '24px',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  display: 'flex',
  justifyContent: 'flex-end',
});

export const subTitle = style({
  fontSize: 12,
  lineHeight: '24px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: cssVarV2('text/tertiary'),
});

export const skeletonBar0 = style({
  width: '80%',
  height: 12,
  backgroundColor: '#E7E7E7',
});

export const skeletonBar1 = style({
  width: '60%',
  height: 8,
  backgroundColor: '#E7E7E7',
});
