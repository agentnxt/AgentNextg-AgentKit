import { Loading } from '@afk/component';
import { cssVarV2 } from '@toeverything/theme/v2';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

export const GenericToolCalling = ({
  icon,
  title,
  displayTime = true,
}: {
  icon?: React.ReactNode;
  title: string;
  displayTime?: boolean;
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const elapsedTime =
    seconds > 60
      ? `${Math.floor(seconds / 60)}m ${seconds % 60}s`
      : `${seconds}s`;

  return (
    <div
      className={cn('h-14 flex items-center gap-2 border rounded-2xl px-4')}
      style={{
        boxShadow: `0px 1px 5px 0px rgba(0, 0, 0, 0.05)`,
      }}
    >
      <div className="size-5 shrink-0 text-xl flex items-center justify-center">
        {icon ?? <Loading />}
      </div>
      <div className="w-0 flex-1 text-sm font-medium text-text-primary">
        {title}
        {displayTime ? (
          <span
            className="ml-1 font-normal"
            style={{
              color: cssVarV2.text.tertiary,
            }}
          >
            {elapsedTime}
          </span>
        ) : null}
      </div>
    </div>
  );
};
