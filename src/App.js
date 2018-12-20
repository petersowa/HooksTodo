import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useMemo,
} from 'react';
import './App.css';

const useDocumentTitle = title => {
  useEffect(
    () => {
      document.title = title;
    },
    [title]
  );
};

const useKeyDown = (keyToMatch, defaultValue) => {
  const [match, setMatch] = useState(defaultValue);
  useEffect(() => {
    const handleKey = event => {
      const { key } = event;
      if (event.srcElement.localName !== 'input') {
        if (key === keyToMatch) {
          setMatch(true);
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, []);
  return [match, setMatch];
};

const useLocalStorage = (key, defaultValue) => {
  console.log(key, defaultValue);
  const initialValue = () => {
    const valueFromStorage = JSON.parse(
      localStorage.getItem(key) || JSON.stringify(defaultValue)
    );
    return valueFromStorage;
  };
  const [storage, setStorage] = useState(initialValue);
  useEffect(
    () => {
      localStorage.setItem(key, JSON.stringify(storage));
    },
    [storage]
  );
  return [storage, setStorage];
};

const Styles = {
  done: state =>
    state
      ? {
          textDecoration: 'line-through',
        }
      : {},
};

const Context = React.createContext();

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

export default function App() {
  // const [Todos, setTodo] = useLocalStorage('todos', [
  //   { id: 1, content: 'go to park', done: false, delete: false },
  //   { id: 2, content: 'buy a car', done: true, delete: false },
  //   { id: 3, content: 'help others', done: false, delete: false },
  // ]);
  const [Todos, dispatch] = useTodosWithStorage([
    { id: 1, content: 'go to park', done: false, delete: false },
    { id: 2, content: 'buy a car', done: true, delete: false },
    { id: 3, content: 'help others', done: false, delete: false },
  ]);

  const [Columns, setColumns] = useLocalStorage('columns', [
    { id: 'todo', title: 'To Do', items: [] },
    { id: 'in_progress', title: 'In Progress', items: [] },
    { id: 'done', title: 'Done', items: [] },
  ]);

  const [ColumnOrder, setColumnOrder] = useLocalStorage('column_order', [
    'todo',
    'in_progress',
    'done',
  ]);

  useDocumentTitle(`Todos, ${Todos.length || '0'}`);
  const [showAbout, setShowAbout] = useKeyDown('?', false);
  //const [showTime, setShowAbout] = useKeyDown('?', false);

  const handleSubmit = event => {
    event.preventDefault();
    const { value } = event.target.todoContent;
    if (value) {
      dispatch({ type: 'ADD_TODO', content: event.target.todoContent.value });
      event.target.todoContent.value = '';
    }
  };

  const handleDone = id => () => {
    dispatch({ type: 'TOGGLE_TODO', id });
  };

  const handleDelete = id => {
    dispatch({ type: 'DELETE_TODO', id });
  };

  console.log('render list');

  return (
    <React.Fragment>
      <h1>
        List of Todos
        <p>Test of using React Hooks for state management</p>
      </h1>

      <form onSubmit={handleSubmit} className="group">
        <input type="text" name="todoContent" />
        <button type="submit">
          <i className="fas fa-plus" />
        </button>
      </form>
      <TodoList
        items={Todos}
        handleDone={handleDone}
        handleDelete={handleDelete}
      />
      {showAbout && (
        <div onClick={() => setShowAbout(false)} className="about-dialog">
          <div className="modal-content">This is the about dialog.</div>
        </div>
      )}
    </React.Fragment>
  );
}

const TodoItem = ({ item, handleDone, handleDelete }) => {
  const deleteItem = id => () => {
    //setTimeout(() => handleDelete(id), 900);
    //console.log('call handle delete for ', id);
    handleDelete(id);
  };

  console.log('render item');
  return (
    <div className={!item.delete ? 'show' : 'hide'} key={item.id}>
      <span style={Styles.done(item.done)}>{item.content}</span>
      <button onClick={deleteItem(item.id)}>
        <i className="fas fa-trash-alt" />
      </button>
      <button onClick={handleDone(item.id)}>
        <i className="fas fa-check" />
      </button>
    </div>
  );
};

const TodoList = ({ items, handleDone, handleDelete }) => {
  return (
    <div>{items.map(item => TodoItem({ item, handleDone, handleDelete }))}</div>
  );
};

const Columns = ({ columns }) => {
  return (
    <div className="columns">
      {columns.map(column => TodoList(column.items))}
    </div>
  );
};
