import { useEffect, useReducer, useMemo } from 'react';

const useTodosWithStorage = defaultValue => {
  const initialValue = () =>
    JSON.parse(localStorage.getItem('todos') || JSON.stringify(defaultValue));
  const [Todos, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'ADD_TODO':
        return [
          ...state,
          {
            content: action.content,
            id: Date.now(),
          },
        ];
      case 'DELETE_TODO':
        setTimeout(() => dispatch({ type: 'CLEANUP' }), 900);
        return state.map(item =>
          item.id !== action.id ? item : { ...item, delete: true }
        );
      case 'TOGGLE_TODO':
        return state.map(item =>
          action.id !== item.id ? item : { ...item, done: !item.done }
        );
      case 'CLEANUP':
        return state.filter(item => item.delete !== true);
      default:
        return state;
    }
  }, useMemo(initialValue, []));
  useEffect(
    () => {
      localStorage.setItem('todos', JSON.stringify(Todos));
    },
    [Todos]
  );
  return [Todos, dispatch];
};

export default useTodosWithStorage;
