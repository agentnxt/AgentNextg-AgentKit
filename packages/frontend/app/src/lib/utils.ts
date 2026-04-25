import type { CSSProperties } from "@vanilla-extract/css";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function text(
  size: number,
  lineHeight: number,
  fontWeight: number,
  options: {
    ellipsis?: boolean;
  } = {}
) {
  const style = {
    fontSize: size,
    lineHeight: `${lineHeight}px`,
    fontWeight: fontWeight,
  } as CSSProperties;
  if (options.ellipsis) {
    style.overflow = 'hidden';
    style.textOverflow = 'ellipsis';
    style.whiteSpace = 'nowrap';
  }
  return style;
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // fallback using copy command
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
