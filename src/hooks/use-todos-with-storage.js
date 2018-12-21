import { useEffect, useReducer, useMemo } from 'react';

const useTodosWithStorage = defaultValue => {
  // Get initial value
  const initialValue = () =>
    JSON.parse(localStorage.getItem('todos') || JSON.stringify(defaultValue));

  // Setup reducer
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
      case 'ORDER_TODO':
        const { id, pos } = action;
        const moveItem = state.find(item => item.id === id);
        return state
          .filter(item => id !== item.id)
          .map((item, index) => (pos !== index ? item : moveItem));
      case 'CLEANUP':
        return state.filter(item => item.delete !== true);
      default:
        return state;
    }
  }, useMemo(initialValue, []));

  const addTodo = content => dispatch({ type: 'ADD_TODO', content });
  const toggleTodo = id => dispatch({ type: 'TOGGLE_TODO', id });
  const deleteTodo = id => dispatch({ type: 'DELETE_TODO', id });
  const orderTodos = (id, pos) => dispatch({ type: 'ORDER_TODO', id, pos });
  //const cleanup = () => dispatch({ type: 'CLEANUP' });
  const actions = { addTodo, toggleTodo, deleteTodo, orderTodos };

  // Save changes to local storage
  useEffect(
    () => {
      localStorage.setItem('todos', JSON.stringify(Todos));
    },
    [Todos]
  );
  return [Todos, actions];
};

export default useTodosWithStorage;
