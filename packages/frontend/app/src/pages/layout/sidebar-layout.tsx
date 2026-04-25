import { IconButton } from '@afk/component';
import { SidebarIcon } from '@blocksuite/icons/rc';
import { useEffect, useState } from 'react';

import AppSidebar from '@/components/ui/sidebar/sidebar';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebar';

export const SidebarLayout = ({
  sidebar,
  children,
  className,
  id,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => {
  const {
    toggleSidebar,
    width,
    open: sidebarOpen,
    resizing,
  } = useSidebarStore();

  const [enableTransition, setEnableTransition] = useState(true);

  useEffect(() => {
    if (resizing) {
      setEnableTransition(false);
    } else {
      setTimeout(() => {
        setEnableTransition(true);
      }, 0);
    }
  }, [resizing]);

  return (
    <div
      className={cn('relative flex size-full justify-end', className)}
      id={id}
    >
      {/* sidebar */}
      <AppSidebar id="app-sidebar" className={cn('flex flex-col', className)}>
        {/* Head spacer */}
        <header className="w-full h-15 p-3 flex items-center">
          <img src="/logo.svg" alt="logo" className="w-6 h-6" />
        </header>
        <div className="flex-1 h-0">{sidebar}</div>
      </AppSidebar>

      {/* main content area */}
      <main className="w-0 flex-1 h-full flex gap-2 transition-all duration-300 ease-in-out">
        {children}
      </main>

      {/* actions */}
      <IconButton
        size="24"
        className="absolute"
        icon={<SidebarIcon />}
        style={{
          position: 'absolute',
          left: sidebarOpen ? width - 40 : 12,
          top: 16,
          transition: enableTransition ? 'all 0.2s ease' : 'none',
          opacity: resizing ? 0 : 1,
        }}
        onClick={toggleSidebar}
      />
    </div>
  );
};
