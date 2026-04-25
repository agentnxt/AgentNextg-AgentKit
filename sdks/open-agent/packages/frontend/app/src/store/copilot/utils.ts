import type { StreamObject } from '@afk/graphql';
import type { ChatMessage, MarkTodoArgs, TodoListItem } from './types';

export interface AggregatedTodoItem {
  id: string;
  title: string;
  status: string;
  description?: string;
  sourceMessageId: string | null;
  listId?: string;
}

/**
 * Extracts all todo items from all messages in a chat session
 */
export function extractAllTodosFromMessages(
  messages: ChatMessage[]
): AggregatedTodoItem[] {
  const todos: Map<string, AggregatedTodoItem> = new Map();

  for (const message of messages) {
    if (!message.streamObjects) continue;

    for (const streamObj of message.streamObjects) {
      if (
        streamObj.type === 'tool-result' &&
        streamObj.toolName === 'todo_list'
      ) {
        const list = streamObj.result?.list as unknown as TodoListItem[];
        const listId = streamObj.result?.id;

        if (list && listId) {
          for (const item of list) {
            // init todos:
            todos.set(item.id, {
              id: item.id,
              title: item.title,
              status: item.status,
              description: item.description,
              sourceMessageId: message.id,
              listId,
            });
          }
        }
      }

      if (
        streamObj.type === 'tool-result' &&
        streamObj.toolName === 'mark_todo'
      ) {
        const args = streamObj.args as unknown as MarkTodoArgs;
        const todoId = args.todoId;

        const todo = todos.get(todoId);
        if (todo) {
          todo.status = args.status;
        }
      }
    }
  }

  return Array.from(todos.values());
}

/**
 * Groups todos by status for display
 */
export function groupTodosByStatus(todos: AggregatedTodoItem[]) {
  const grouped: Record<'inProgress' | 'todo' | 'done', AggregatedTodoItem[]> =
    {
      inProgress: [],
      todo: [],
      done: [],
    };

  for (const item of todos) {
    if (item.status === 'completed' || item.status === 'done') {
      grouped.done.push(item);
    } else if (item.status === 'in_progress' || item.status === 'in-progress') {
      grouped.inProgress.push(item);
    } else {
      grouped.todo.push(item);
    }
  }

  return grouped;
}

export function mergeStreamObjects(chunks: StreamObject[] = []) {
  return chunks.reduce((acc, curr) => {
    const prev = acc.at(-1);
    switch (curr.type) {
      case 'reasoning':
      case 'text-delta': {
        if (prev && prev.type === curr.type) {
          acc[acc.length - 1] = {
            ...prev,
            textDelta: (prev.textDelta ?? '') + (curr.textDelta ?? ''),
          };
        } else {
          acc.push(curr);
        }
        break;
      }
      case 'tool-incomplete-result': {
        // Find the corresponding tool-call and update it with streaming data
        const index = acc.findIndex(
          item =>
            item.type === 'tool-call' && item.toolCallId === curr.toolCallId
        );
        if (index !== -1) {
          const toolCall = acc[index];
          // Add or append streaming data to the tool call
          acc[index] = {
            ...toolCall,
            textDelta: (toolCall.textDelta ?? '') + (curr.data.textDelta ?? ''),
          };
        } else {
          // If no matching tool-call found, just add it
          acc.push(curr);
        }
        break;
      }
      case 'tool-result': {
        // Special handling for todo list updates
        // If the current chunk is a `mark_todo` result, merge it into a previous
        // todo-list related result (either the original `todo_list` creation
        // or an earlier merged `mark_todo`) that shares the same `todoListId`.
        if (
          curr.toolName === 'mark_todo' &&
          curr.result &&
          (curr.result as any).todoListId
        ) {
          const todoListId = (curr.result as any).todoListId;

          // Find the last todo-list related tool-result with the same list id.
          const index = acc.findIndex(item => {
            if (item.type !== 'tool-result') return false;
            if (!['todo_list', 'mark_todo'].includes((item as any).toolName))
              return false;
            // Previous todo_list result stores list id in `id` field, while subsequent
            // mark_todo results use `todoListId`. Support both for matching.
            const id =
              (item as any).result?.todoListId ?? (item as any).result?.id;
            return id && id === todoListId;
          });

          if (index !== -1) {
            const prevItem = acc[index] as StreamObject;

            // Create a new merged list by replacing / inserting the updated todo item.
            const updatedItem = (curr.result as any).item;
            const prevList: any[] = (prevItem as any).result?.list ?? [];

            const existingIdx = prevList.findIndex(
              t => t.id === updatedItem.id
            );

            const newList =
              existingIdx === -1
                ? [...prevList, updatedItem]
                : prevList.map((t, i) => (i === existingIdx ? updatedItem : t));

            acc[index] = {
              ...prevItem,
              result: {
                ...(prevItem as any).result,
                list: newList,
              },
            } as StreamObject;

            // Remove the original tool-call placeholder for this mark_todo call
            const callIdx = acc.findIndex(
              item =>
                item.type === 'tool-call' &&
                (item as any).toolCallId === curr.toolCallId &&
                (item as any).toolName === 'mark_todo'
            );
            if (callIdx !== -1) {
              acc.splice(callIdx, 1);
            }

            break; // Merged; do not push current chunk
          }
        }

        const index = acc.findIndex(
          item =>
            item.type === 'tool-call' &&
            item.toolCallId === curr.toolCallId &&
            item.toolName === curr.toolName
        );
        if (index !== -1) {
          acc[index] = curr;
        } else {
          acc.push(curr);
        }
        break;
      }
      default: {
        acc.push(curr);
        break;
      }
    }
    return acc;
  }, [] as StreamObject[]);
}
