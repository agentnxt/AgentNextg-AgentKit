import { style } from '@vanilla-extract/css';

export const root = style({
  width: '100%',
  height: '100%',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const logo = style({
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  top: 36,
  width: 36,
  height: 36,
});

export const centerContent = style({});
