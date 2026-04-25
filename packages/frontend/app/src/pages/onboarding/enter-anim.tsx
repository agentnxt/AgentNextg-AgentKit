import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

export interface EnterAnimProps {
  items: ReactNode[];
  /**
   * The duration of each item's enter animation
   */
  duration?: number;
  /**
   * The gap between each item's enter animation
   */
  gap?: number;

  /**
   * The initial state of the animation
   */
  from?: Record<string, any>;

  onAnimationEnd?: () => void;
}

/**
 * A component that animates the entrance of its children.
 *
 * All <EnterAnimItem> will be animated in parallel.
 *
 * Usage:
 * ```tsx
 * <EnterAnimRoot
 *   duration={200}
 *   gap={150}
 *   items={[1, 2, 3]}
 * />
 */
export const EnterAnim = ({
  items,
  duration = 0.4,
  gap = 0.13,
  from = { x: 0, y: -10, opacity: 0, filter: 'blur(10px)' },
  onAnimationEnd,
}: EnterAnimProps) => {
  return items.map((child, index) => {
    return (
      <motion.div
        key={index}
        initial={from}
        animate={{
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
        }}
        transition={{
          duration,
          delay: index * gap,
        }}
        onAnimationComplete={() => {
          if (index === items.length - 1) {
            onAnimationEnd?.();
          }
        }}
      >
        {child}
      </motion.div>
    );
  });
};
