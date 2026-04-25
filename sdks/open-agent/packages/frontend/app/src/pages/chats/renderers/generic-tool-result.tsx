import { IconButton } from '@afk/component';
import { ExpandCloseIcon, ExpandFullIcon } from '@blocksuite/icons/rc';
import { cssVarV2 } from '@toeverything/theme/v2';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import * as styles from './generic-tool-result.css';
import { toolResult } from './tool.css';

export const GenericToolResult = ({
  icon,
  title,
  children,
  count,
  actions,
  onCollapseChange,
  className,
  style,
  ...props
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  count?: number;
  actions?: React.ReactNode;
  onCollapseChange?: (collapsed: boolean) => void;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>) => {
  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
    onCollapseChange?.(!collapsed);
  };

  return (
    <div
      className={cn(
        toolResult,
        'border rounded-2xl overflow-hidden',
        className,
        props.onClick ? 'hover:bg-hover cursor-pointer' : ''
      )}
      style={{
        boxShadow: `0px 1px 5px 0px rgba(0, 0, 0, 0.05)`,
        ...style,
      }}
      data-collapsed={collapsed}
      {...props}
    >
      <header
        className={cn(
          styles.header,
          'flex items-center gap-2 h-14 px-4 border-b'
        )}
      >
        {icon ? (
          <div className="size-5 shrink-0 text-xl flex items-center justify-center text-icon-primary">
            {icon}
          </div>
        ) : null}
        <div className="w-0 flex-1 text-sm font-medium text-text-primary truncate">
          {title}
          {count ? (
            <span
              className="ml-1 font-normal"
              style={{
                color: cssVarV2.text.tertiary,
              }}
            >
              {count}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {children ? (
            <IconButton
              onClick={toggleCollapsed}
              icon={collapsed ? <ExpandFullIcon /> : <ExpandCloseIcon />}
            />
          ) : null}
        </div>
      </header>
      {/* {children ? (
        <main data-collapsed={collapsed} className={cn(styles.contentWrapper)}>
          <div className={'overflow-hidden'}>{children}</div>
        </main>
      ) : null} */}
      {children ? (
        <AnimatePresence>
          {collapsed ? null : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ damping: 10, stiffness: 100, mass: 0.5 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      ) : null}
    </div>
  );
};
