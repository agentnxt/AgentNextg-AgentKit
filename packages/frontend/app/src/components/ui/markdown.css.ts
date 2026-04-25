import { globalStyle, style } from '@vanilla-extract/css';

export const markdownBlock = style({});

globalStyle(`${markdownBlock} li > p`, {
  marginBottom: 0,
});
globalStyle(
  `${markdownBlock} p:not(:last-child), ${markdownBlock} ul:not(:last-child), ${markdownBlock} :where(p):not(:where([class~='not-prose'], [class~='not-prose'] *))`,
  {
    marginBottom: 12,
    marginTop: 12,
  }
);
globalStyle(`${markdownBlock} pre:has(.custom-code-block)`, {
  padding: 0,
  backgroundColor: 'transparent',
  margin: 0,
});
