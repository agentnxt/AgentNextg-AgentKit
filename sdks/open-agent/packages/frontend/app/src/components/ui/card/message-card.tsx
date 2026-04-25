import { Loading } from '@afk/component';

import { cn } from '@/lib/utils';

import * as styles from './message-card.css';

interface MessageCardProps {
  status: 'success' | 'done' | 'loading' | 'loading-placeholder';
  icon?: React.ReactNode;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  className?: string;
}

const MessageSkeleton = () => {
  return (
    <>
      <div className={styles.skeletonBar0}></div>
      <div className={styles.skeletonBar1}></div>
    </>
  );
};

export const MessageCard = ({
  status,
  icon,
  title,
  subTitle,
  className,
}: MessageCardProps) => {
  const isLoading = status === 'loading' || status === 'loading-placeholder';
  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.icon}>
        {isLoading ? <Loading size={20} /> : icon}
      </div>
      <div className={styles.content}>
        {status === 'loading-placeholder' ? (
          <MessageSkeleton />
        ) : (
          <>
            {title && <div className={styles.title}>{title}</div>}
            {subTitle && <div className={styles.subTitle}>{subTitle}</div>}
          </>
        )}
      </div>
    </div>
  );
};
