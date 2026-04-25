type Side = 'top' | 'right' | 'bottom' | 'left' | 'x' | 'y' | 'all';

/**
 * e.g.
 * SidePick<'padding'> = 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'
 * SidePick<'margin'> = 'marginTop' | 'marginRight' | 'marginBottom' | 'marginLeft'
 */
type SidedProps<T extends string> =
  | `${T}`
  | `${T}Top`
  | `${T}Right`
  | `${T}Bottom`
  | `${T}Left`
  | `${T}X`
  | `${T}Y`;

export type SidedOptions<T extends string, V> = {
  [key in SidedProps<T>]?: V;
};

function sidedOptions2sideOptions<T extends string, V>(
  options: SidedOptions<T, V>
): {
  [key in Side]: V;
} {
  return Object.fromEntries(
    Object.entries(options).map(([key, value]) => {
      const side = (key
        .match(/[Tt]op|[Rr]ight|[Bb]ottom|[Ll]eft$/)?.[0]
        ?.toLowerCase() ?? 'all') as Side;
      return [side, value];
    })
  ) as {
    [key in Side]: V;
  };
}

export function sidePick<T extends string, V>(
  options: SidedOptions<T, V>,
  side: 'top' | 'right' | 'bottom' | 'left',
  defaultValue: V
): V {
  const sideOptions = sidedOptions2sideOptions(options);
  if (side === 'top') {
    return sideOptions.top ?? sideOptions.y ?? sideOptions.all ?? defaultValue;
  }
  if (side === 'right') {
    return (
      sideOptions.right ?? sideOptions.x ?? sideOptions.all ?? defaultValue
    );
  }
  if (side === 'bottom') {
    return (
      sideOptions.bottom ?? sideOptions.y ?? sideOptions.all ?? defaultValue
    );
  }
  if (side === 'left') {
    return sideOptions.left ?? sideOptions.x ?? sideOptions.all ?? defaultValue;
  }
  return sideOptions.all ?? defaultValue;
}
