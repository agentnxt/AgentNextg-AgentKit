import { globalStyle, style } from '@vanilla-extract/css';

export const codeBlock = style({});

globalStyle(`${codeBlock} pre`, {
  margin: 0,
  padding: 16,
  fontSize: 12,
});
