import { Loading } from '@afk/component';
import {
  ArrowDownSmallIcon,
  SingleSelectCheckSolidIcon,
  SingleSelectUnIcon,
} from '@blocksuite/icons/rc';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { type StoreApi, useStore } from 'zustand';

import { cn } from '@/lib/utils';
import type { ChatSessionState } from '@/store/copilot/types';
import {
  extractAllTodosFromMessages,
  groupTodosByStatus,
} from '@/store/copilot/utils';

type CardStatus = 'done' | 'inProgress' | 'todo';

const statusToCardStatus = (status: string): CardStatus => {
  if (status === 'completed' || status === 'done') return 'done';
  if (
    status === 'in_progress' ||
    status === 'in-progress' ||
    status === 'processing'
  )
    return 'inProgress';
  return 'todo';
};

const getIcon = (status: CardStatus) => {
  switch (status) {
    case 'done':
      return <SingleSelectCheckSolidIcon />;
    case 'todo':
      return <SingleSelectUnIcon />;
    default:
      return <Loading size={24} />;
  }
};

interface AggregatedTodoListProps {
  store: StoreApi<ChatSessionState>;
}

export function AggregatedTodoList({ store }: AggregatedTodoListProps) {
  const messages = useStore(store, s => s.messages);

  const aggregatedTodos = useMemo(() => {
    // sort by status
    // progression > todo > done
    const todos = extractAllTodosFromMessages(messages);
    const grouped = groupTodosByStatus(todos);
    return [...grouped.inProgress, ...grouped.todo, ...grouped.done];
  }, [messages]);

  const [expanded, setExpanded] = useState(false);

  const groupedCounts = useMemo(() => {
    const todos = extractAllTodosFromMessages(messages);
    const grouped = groupTodosByStatus(todos);
    return {
      inProgress: grouped.inProgress.length,
      todo: grouped.todo.length,
      done: grouped.done.length,
    };
  }, [messages]);

  const totalTodos = aggregatedTodos.length;

  if (totalTodos === 0) {
    return null;
  }

  return (
    <motion.div
      layout
      transition={{ duration: 0.2 }}
      className="border border-b-0 rounded-t-2xl bg-gray-50/50 mx-4 cursor-pointer select-none"
      onClick={() => setExpanded(prev => !prev)}
    >
      {/* Header / Summary row */}
      <div className="max-w-[800px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="text-sm font-medium">
          {totalTodos} Todo Item{totalTodos > 1 ? 's' : ''}
        </div>
        <div className="flex-1" />
        {/* Simple counts display */}
        <div className="flex items-center gap-3 text-xs text-gray-600">
          {groupedCounts.inProgress > 0 && (
            <span>{groupedCounts.inProgress} In&nbsp;Progress</span>
          )}
          {groupedCounts.todo > 0 && <span>{groupedCounts.todo} Todo</span>}
          {groupedCounts.done > 0 && <span>{groupedCounts.done} Done</span>}
        </div>

        {/* Collapse icon */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-xl text-gray-500 ml-2"
        >
          <ArrowDownSmallIcon />
        </motion.div>
      </div>

      {/* Animated content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="max-w-[800px] mx-auto px-4 pb-3 flex flex-col gap-2 max-h-30 overflow-y-auto">
              {aggregatedTodos.map(todo => (
                <TodoListItem
                  key={todo.id}
                  status={statusToCardStatus(todo.status)}
                  title={todo.title}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const TodoListItem = ({
  status,
  title,
  subTitle,
}: {
  status: CardStatus;
  title: string;
  subTitle?: string;
}) => {
  const icon = getIcon(status);
  return (
    <div
      data-status={status}
      className={cn('h-5  flex items-center gap-3 text-sm')}
    >
      <div className={cn('shrink-0 text-2xl text-icon-secondary')}>{icon}</div>
      <div
        className={cn(
          'flex gap-1 text-text-primary',
          status === 'done' && `line-through text-text-placeholder`
        )}
      >
        <div className={cn('w-full truncate text-sm')}>{title}</div>
        {subTitle ? (
          <div className={cn('truncate text-xs')}>{subTitle}</div>
        ) : null}
      </div>
    </div>
  );
};
