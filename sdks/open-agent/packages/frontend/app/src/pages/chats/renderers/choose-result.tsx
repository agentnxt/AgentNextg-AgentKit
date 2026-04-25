import { Button, Checkbox } from '@afk/component';
import {
  SingleSelectCheckSolidIcon,
  SingleSelectUnIcon,
} from '@blocksuite/icons/rc';
import { cssVarV2 } from '@toeverything/theme/v2';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';

import { useChatMessages } from '@/components/chat/messages.context';
import { chatInputEmitter } from '@/components/chat-input';
import { cn } from '@/lib/utils';

import * as styles from './choose-result.css';

interface ChooseResultProps {
  result: {
    question: string;
    options: string[];
    multiSelect: boolean;
  };
}

export const ChooseResult = ({ result }: ChooseResultProps) => {
  const messages = useChatMessages();
  const userMessages = messages.filter(m => m.role === 'user');
  const answerMessage = userMessages.reverse().find(m => {
    return result.options.some(option => m.content.includes(option));
  });
  const answer = answerMessage ? answerMessage.content.split(', ') : [];

  const [selected, setSelected] = useState<string[]>(answer);

  const sendAnswer = () => {
    const answerString = selected.join(', ');
    chatInputEmitter.emit('send', answerString);
  };

  const toggleSelect = useCallback(
    (option: string) => {
      if (answer.length) {
        return;
      }
      setSelected(prev => {
        if (prev.includes(option)) {
          return prev.filter(o => o !== option);
        } else if (result.multiSelect) {
          return [...prev, option];
        } else {
          return [option];
        }
      });
    },
    [answer.length, result.multiSelect]
  );

  return (
    <div className={cn(styles.card, 'shadow-view not-prose')}>
      <div className="px-4 py-3">
        <div className="text-sm font-medium text-text-primary leading-5.5 mb-2">
          {result.question}
        </div>
        <ul className="flex flex-col gap-0.5">
          {result.options.map(option => {
            const answerSelected = answer.includes(option);
            const pendingSelected = selected.includes(option);
            return (
              <li
                className={cn(
                  'flex items-center gap-2 py-0.5',
                  !answer.length && 'cursor-pointer'
                )}
                key={option}
                onClick={() => toggleSelect(option)}
              >
                <div className="size-5 flex items-center justify-center">
                  {answer.length ? (
                    answerSelected ? (
                      <SingleSelectCheckSolidIcon className="text-xl text-status-success" />
                    ) : (
                      <SingleSelectUnIcon className="text-xl text-icon-tertiary" />
                    )
                  ) : // selectable
                  result.multiSelect ? (
                    <Checkbox checked={pendingSelected} />
                  ) : (
                    <div
                      className={cn(
                        'size-4 rounded-full text-icon-primary border flex items-center justify-center',
                        pendingSelected && 'border-status-success'
                      )}
                    >
                      {pendingSelected ? (
                        <motion.div
                          className="bg-status-success size-2 rounded-full"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.2 }}
                        ></motion.div>
                      ) : null}
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    'text-sm text-text-primary leading-5.5',
                    answer.length &&
                      !answerSelected &&
                      'text-text-placeholder line-through',
                    answer.length &&
                      answerSelected &&
                      'text-status-success font-medium',
                    !answer.length && 'text-icon-primary',
                    !answer.length &&
                      pendingSelected &&
                      'text-status-success font-medium'
                  )}
                >
                  {option}
                </div>
              </li>
            );
          })}
        </ul>
        {!answer.length ? (
          <footer className="flex justify-end">
            <Button
              style={{ backgroundColor: cssVarV2.status.success }}
              disabled={!selected.length}
              variant="primary"
              onClick={sendAnswer}
            >
              Confirm
            </Button>
          </footer>
        ) : null}
      </div>
    </div>
  );
};
