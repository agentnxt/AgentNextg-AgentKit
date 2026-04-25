import { ScrollableContainer } from '@afk/component';
import { useCallback, useEffect, useState } from 'react';

import { TodoListResult } from '@/pages/chats/renderers/todo-list-result';

import { scrollMask } from './todo-list-preview.css';

const mockTodos = {
  id: 'mock-id',
  list: [
    { id: '1', title: 'Grammar chapter', status: 'done' },
    { id: '2', title: 'Learn 10 new words', status: 'done' },
    { id: '3', title: 'Oral practice', status: 'done' },
    { id: '4', title: 'Science chapter', status: 'done' },
    { id: '5', title: 'Search for videos in Japanese', status: 'in-progress' },
    { id: '6', title: 'Review one grammar point', status: 'in-progress' },
    { id: '7', title: 'Listen to 5 mins of Japanese', status: 'in-progress' },
    { id: '8', title: 'Take a short quiz', status: 'todo' },
    { id: '9', title: 'Review the grammar', status: 'todo' },
    { id: '10', title: 'Review the words', status: 'todo' },
  ],
};

export const TodoListPreview = () => {
  const [todos, setTodos] = useState(mockTodos);

  const updateTodos = useCallback(() => {
    setTodos(prev => {
      const notFinished = prev.list.filter(todo => todo.status !== 'done');
      if (notFinished.length === 0) {
        return mockTodos;
      }

      const randomIndex = Math.floor(Math.random() * notFinished.length);
      const randomTodo = notFinished[randomIndex];
      const id = randomTodo.id;

      const newTodoList = [];
      for (const todo of prev.list) {
        if (todo.id === id) {
          newTodoList.push({
            ...todo,
            status: todo.status === 'todo' ? 'in-progress' : 'done',
          });
        } else {
          newTodoList.push({ ...todo });
        }
      }

      return {
        ...prev,
        list: newTodoList,
      };
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateTodos();
    }, 2000);

    return () => clearInterval(interval);
  }, [updateTodos]);

  return (
    <div className="w-[500px] max-w-screen h-[340px] relative">
      <TodoListResult result={todos} />
    </div>
  );
};
