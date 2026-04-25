import { Loading, ScrollableContainer } from '@afk/component';
import {
  SingleSelectCheckSolidIcon,
  SingleSelectUnIcon,
} from '@blocksuite/icons/rc';
import { LayoutGroup, motion } from 'framer-motion';

import { cn } from '@/lib/utils';

import * as styles from './todo-list-result.css';

interface TodoItem {
  id: string;
  title: string;
  status: string;
  description?: string;
}

interface TodoListResultProps {
  /** Result object returned by the `todo_list` / `mark_todo` tool */
  result: {
    id?: string;
    list: TodoItem[];
  };
  className?: string;
}

const COLUMN_LABELS = {
  done: 'Done',
  inProgress: 'In progress',
  todo: 'Todo',
} as const;

type CardStatus = 'done' | 'in-progress' | 'todo';
const statusToCardStatus = (status: string): CardStatus => {
  switch (status) {
    case 'completed':
    case 'done':
      return 'done';
    case 'in_progress':
    case 'in-progress':
    case 'inProgress':
    case 'processing':
      return 'in-progress';
    case 'pending':
    case 'todo':
    default:
      return 'todo';
  }
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

const statusCategory = (status: string): keyof typeof COLUMN_LABELS => {
  switch (status) {
    case 'completed':
    case 'done':
      return 'done';
    case 'in_progress':
    case 'in-progress':
    case 'inProgress':
    case 'processing':
      return 'inProgress';
    case 'pending':
    case 'todo':
    default:
      return 'todo';
  }
};

export function TodoListResult({ result, className }: TodoListResultProps) {
  const grouped: Record<'done' | 'inProgress' | 'todo', TodoItem[]> = {
    done: [],
    inProgress: [],
    todo: [],
  };

  for (const item of result.list ?? []) {
    grouped[statusCategory(item.status)].push(item);
  }

  return (
    <LayoutGroup>
      <ScrollableContainer horizontal className={cn(className)}>
        {/* Horizontal scroll wrapper */}
        <div className="pb-2">
          {/* Track: flex on mobile, grid on medium+ */}
          <div className="flex md:grid md:grid-cols-3 gap-4 min-w-max pb-2 max-h-[800px]">
            {/** Render each column */}
            {(
              Object.keys(COLUMN_LABELS) as Array<keyof typeof COLUMN_LABELS>
            ).map(key => {
              const items = grouped[key];
              return (
                <div
                  key={key}
                  className="flex-shrink-0 flex flex-col gap-2 w-72"
                >
                  <h3 className={cn(styles.todoHeader)}>
                    {COLUMN_LABELS[key]}
                  </h3>
                  {items.length === 0
                    ? null
                    : items.map(item => (
                        <motion.div
                          key={item.id}
                          layout
                          layoutId={item.id}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                          }}
                        >
                          <TodoCard
                            status={statusToCardStatus(item.status)}
                            title={item.title}
                            subTitle={item.description}
                          />
                        </motion.div>
                      ))}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollableContainer>
    </LayoutGroup>
  );
}

const TodoCard = ({
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
      className={cn(
        styles.todoCard,
        'px-4 py-2 rounded-2xl border shadow-view flex items-center gap-3'
      )}
    >
      <div className={cn('size-6 text-2xl shrink-0', styles.todoCardIcon)}>
        {icon}
      </div>

      <div className={styles.todoCardContent}>
        <div className={cn(styles.todoCardTitle, 'w-full truncate')}>
          {title}
        </div>
        {subTitle ? (
          <div className={styles.todoCardSubTitleContainer}>
            <div className={cn(styles.todoCardSubTitle, 'truncate')}>
              {subTitle}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
