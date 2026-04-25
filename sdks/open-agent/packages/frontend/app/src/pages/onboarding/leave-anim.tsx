import { AnimatePresence, type HTMLMotionProps, motion } from 'framer-motion';

export interface LeaveAnimProps extends HTMLMotionProps<'div'> {
  show?: boolean;
  onAnimationEnd?: () => void;
}

export const LeaveAnim = ({
  show,
  onAnimationEnd,
  children,
  ...props
}: LeaveAnimProps) => {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
          transition={{ duration: 0.3 }}
          onAnimationComplete={() => {
            onAnimationEnd?.();
          }}
          {...props}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
