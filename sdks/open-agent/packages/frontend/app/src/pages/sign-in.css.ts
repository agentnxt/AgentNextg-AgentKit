import { cssVarV2 } from '@toeverything/theme/v2';
import { globalStyle, style } from '@vanilla-extract/css';

import { text } from '@/lib/utils';

export const wrapper = style({
  width: '100%',
  maxWidth: 350,
  paddingLeft: 16,
  paddingRight: 16,
  minHeight: 405,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'center',
});

export const title = style({
  fontSize: 32,
  fontWeight: 600,
  lineHeight: '39px',
  letterSpacing: -0.32,
  color: '#000',
  textAlign: 'center',
});

export const hit = style({
  ...text(15, 24, 400),
  color: cssVarV2.text.secondary,
  textAlign: 'center',
  marginTop: 16,
});
export const hitEmail = style({
  color: cssVarV2.text.primary,
  fontWeight: 500,
});

export const item = style({
  height: 40,
  width: '100%',
  borderRadius: 8,
  border: `1px solid transparent`,
  fontWeight: 500,
  fontSize: 14,
  lineHeight: '22px',
});
export const input = style([
  item,
  {
    marginTop: 32,
  },
]);

export const submit = style([
  item,
  {
    backgroundColor: '#000',
    color: '#fff',
    cursor: 'pointer',
    selectors: {
      '&[aria-disabled="true"]': {
        backgroundColor: '#333',
        cursor: 'default',
      },
    },
  },
]);

export const or = style({
  display: 'flex',
  alignItems: 'center',
  margin: '12px 0px',
});
export const line = style({
  vars: {
    '--direction': 'to right',
  },
  height: 1,
  background: 'linear-gradient(var(--direction), #F5F5F5 0%, #B0B0B0 100%)',
  selectors: {
    '&.reverse': {
      vars: {
        '--direction': 'to left',
      },
    },
  },
});
export const orText = style({
  lineHeight: '22px',
  padding: '0px 8px',
  ...text(14, 22, 500),
  color: '#929292',
  flexShrink: 0,
});

export const oauthButton = style([
  item,
  {
    cursor: 'pointer',
    border: `1px solid ${cssVarV2.layer.insideBorder.border}`,
    ...text(14, 22, 500),
    color: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ':hover': {
      backgroundColor: cssVarV2('layer/background/hoverOverlay'),
    },
  },
]);

globalStyle(`${oauthButton} svg`, {
  fontSize: 24,
});

export const codeInput = style({});
globalStyle(`${codeInput} input`, {
  borderColor: `${cssVarV2.layer.insideBorder.border} !important`,
  fontFamily: 'inherit !important',
});
globalStyle(`${codeInput} input:focus`, {
  borderColor: `#000 !important`,
  caretColor: `#000 !important`,
});
