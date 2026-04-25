import { type HTMLAttributes, useCallback, useRef } from 'react';

import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebar';

import { type SidedOptions, sidePick } from './side-pick';
import * as styles from './sidebar.css';

export type AppSidebarProps = SidedOptions<'inset', number> &
  HTMLAttributes<HTMLDivElement>;

const SIDEBAR_WIDTH_MIN = 180;
const SIDEBAR_WIDTH_MAX = 300;

export default function AppSidebar({
  inset,
  insetLeft,
  insetRight,
  insetTop,
  insetBottom,
  insetX,
  insetY,
  children,
  className,
  style,
  ...props
}: AppSidebarProps) {
  const insetOptions: SidedOptions<'inset', number> = {
    inset,
    insetLeft,
    insetRight,
    insetTop,
    insetBottom,
    insetX,
    insetY,
  };
  const pl = sidePick(insetOptions, 'left', 0);
  const pr = sidePick(insetOptions, 'right', 0);
  const pt = sidePick(insetOptions, 'top', 0);
  const pb = sidePick(insetOptions, 'bottom', 0);

  const containerRef = useRef<HTMLDivElement>(null);

  const { width, setWidth, open, setResizing } = useSidebarStore();

  const initailWidthRef = useRef(0);
  const initialClientXRef = useRef(0);
  const prevClientXRef = useRef(0);

  const onDragStart = useCallback(
    (clientX: number) => {
      initailWidthRef.current = containerRef.current?.offsetWidth ?? 0;
      initialClientXRef.current = clientX;
      containerRef.current?.classList.toggle(styles.resizing, true);
      setResizing(true);
    },
    [setResizing]
  );

  const onDragMove = useCallback((clientX: number) => {
    const delta = clientX - initialClientXRef.current;
    const newWidth = Math.max(
      SIDEBAR_WIDTH_MIN,
      Math.min(SIDEBAR_WIDTH_MAX, initailWidthRef.current + delta)
    );
    prevClientXRef.current = clientX;
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        '--sidebar-width',
        `${newWidth}px`
      );
    }
  }, []);

  const onDragEnd = useCallback(() => {
    const delta = prevClientXRef.current - initialClientXRef.current;
    const newWidth = Math.max(
      SIDEBAR_WIDTH_MIN,
      Math.min(SIDEBAR_WIDTH_MAX, initailWidthRef.current + delta)
    );
    containerRef.current?.classList.toggle(styles.resizing, false);
    setWidth(newWidth);
    setResizing(false);
  }, [setResizing, setWidth]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!open) return;

      e.preventDefault();
      e.stopPropagation();
      const { clientX } = e;
      onDragStart(clientX);

      const onMouseMove = (e: MouseEvent) => {
        onDragMove(e.clientX);
      };
      const onMouseUp = () => {
        onDragEnd();

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [onDragEnd, onDragMove, onDragStart, open]
  );

  return (
    <div
      ref={containerRef}
      className={cn('flex justify-end', styles.container)}
      style={{
        ['--sidebar-width' as string]: `${width}px`,
        width: open ? 'var(--sidebar-width)' : 0,
      }}
    >
      <div
        className={cn('relative shrink-0', className)}
        style={{
          ...style,
          paddingLeft: pl,
          paddingRight: pr,
          paddingTop: pt,
          paddingBottom: pb,
          width: 'var(--sidebar-width)',
        }}
        {...props}
      >
        {children}
        <div
          className={cn(
            'absolute flex cursor-col-resize justify-center',
            styles.resizeTrigger
          )}
          style={{
            top: pt,
            height: `calc(100% - ${pt}px - ${pb}px)`,
            right: -5,
            width: 10,
          }}
          onMouseDown={onMouseDown}
        >
          <div className={cn('h-full bg-primary', styles.resizeTriggerBar)} />
        </div>
      </div>
    </div>
  );
}
