import { ArrowDownBigIcon } from '@blocksuite/icons/rc';
import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useImperativeHandle, useState } from 'react';

import { cn } from '@/lib/utils';

export interface DownArrowRef {
  hide: () => void;
  show: () => void;
}

export const DownArrow = forwardRef<
  DownArrowRef,
  { onClick: () => void; loading: boolean; offset?: number }
>(({ onClick, loading, offset = 24 }, ref) => {
  const [show, setShow] = useState(false);

  // impl ref
  useImperativeHandle(ref, () => ({
    hide: () => {
      setShow(false);
    },
    show: () => {
      setShow(true);
    },
  }));

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.8 }}
          transition={{ duration: 0.14 }}
          onClick={onClick}
          style={{ bottom: `${offset}px` }}
          className={cn(`absolute left-1/2 -translate-x-1/2 cursor-pointer`)}
        >
          <motion.div
            animate={
              loading
                ? {
                    y: [0, 14, 0],
                    boxShadow: [
                      '0px 4px 15px rgba(0,0,0,0.05)',
                      '0px 2px 6px rgba(0,0,0,0.2)',
                      '0px 4px 15px rgba(0,0,0,0.05)',
                    ],
                  }
                : undefined
            }
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
            className={cn(
              'size-9 rounded-full bg-white border',
              'flex items-center justify-center'
            )}
            style={{
              boxShadow: '0px 4px 15px rgba(0,0,0,0.05)',
            }}
          >
            <ArrowDownBigIcon className="text-[22px] text-icon-primary" />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
});
DownArrow.displayName = 'DownArrow';
