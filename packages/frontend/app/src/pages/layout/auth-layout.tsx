import { cn } from '@/lib/utils';

import * as styles from './auth-layout.css';

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={cn(styles.root, 'bg-layer-background-secondary')}>
      {children}
    </div>
  );
};
