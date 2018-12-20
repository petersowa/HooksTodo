import React, { useState, useEffect } from 'react';
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

export default function App() {
  const [Todos, setTodo] = useLocalStorage('todos', [
    { id: 1, content: 'go to park', done: false, delete: false },
    { id: 2, content: 'buy a car', done: true, delete: false },
    { id: 3, content: 'help others', done: false, delete: false },
  ]);

  useDocumentTitle(`Todos, ${Todos.length}`);
  const [showAbout, setShowAbout] = useKeyDown('?', false);
  //const [showTime, setShowAbout] = useKeyDown('?', false);

  const handleSubmit = event => {
    event.preventDefault();
    const { value } = event.target.todoContent;
    if (value) {
      setTodo([
        { content: event.target.todoContent.value, id: Date.now() },
        ...Todos,
      ]);
      event.target.todoContent.value = '';
    }
  };

  const handleDone = id => () => {
    const updateTodo = Todos.find(item => item.id === id);
    updateTodo.done = !updateTodo.done;
    setTodo([...Todos]);
  };

  const handleDelete = id => {
    setTodo(
      Todos.map(item => (item.id !== id ? item : { ...item, delete: true }))
    );
  };

  const cleanupItems = () => {
    if (Todos.find(item => item.delete === true)) {
      setTodo(Todos.filter(item => item.delete !== true));
    }
  };

  console.log('render list');
  setTimeout(cleanupItems, 900);

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
