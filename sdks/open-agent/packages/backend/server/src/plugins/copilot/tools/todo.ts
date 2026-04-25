import { randomUUID } from 'node:crypto';

import { z } from 'zod';

import { Cache } from '../../../base';
import { createTool } from './utils';

type TodoList = {
  id: string;
  list: Array<{
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'processing' | 'completed';
  }>;
};

export const createTodoTool = (cache: Cache) => {
  return createTool(
    { toolName: 'create_todo' },
    {
      description:
        'Make a todo list for client, returns the todo list with a unique ID, this tool should only used when you are doing something that requires multiple steps, like writing a document or composing an email.',
      inputSchema: z.object({
        todo: z
          .object({
            title: z.string().describe('The title of the todo item'),
            description: z
              .string()
              .describe('The description of the todo item'),
          })
          .array(),
      }),
      execute: async ({ todo }): Promise<TodoList> => {
        const id = randomUUID();
        const list = todo.map(item => ({
          id: randomUUID(),
          status: 'pending' as const,
          ...item,
        }));
        const finalTodo: TodoList = { id, list };
        await cache.set(id, finalTodo);
        return finalTodo;
      },
    }
  );
};

export const createMarkTodoTool = (cache: Cache) => {
  return createTool(
    { toolName: 'mark_todo' },
    {
      description: 'Mark a todo item as processing or completed in a todo list',
      inputSchema: z.object({
        todoListId: z.string().describe('The ID of the todo list'),
        todoId: z
          .string()
          .describe('The ID of the todo item to mark as completed'),
        status: z
          .enum(['processing', 'completed'])
          .describe('The status to set for the todo item'),
      }),
      execute: async ({ todoListId, todoId, status }) => {
        const todoList = await cache.get<TodoList>(todoListId);
        if (!todoList) {
          return 'Todo list not found';
        }
        const item = todoList.list.find((t: any) => t.id === todoId);
        if (!item) {
          return 'Todo item not found';
        }
        item.status = status;
        await cache.set(todoListId, todoList);
        return { success: true, todoListId, item };
      },
    }
  );
};
