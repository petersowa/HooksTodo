import React, { useContext } from 'react';
import './App.css';

import useTodosWithStorage from './hooks/use-todos-with-storage';
import useKeyDown from './hooks/use-key-down';
// import useLocalStorage from './hooks/use-local-storage';
import useDocumentTitle from './hooks/use-document-title';
import { Spring, Transition } from 'react-spring';

const Styles = {
  done: state =>
    state
      ? {
          textDecoration: 'line-through',
        }
      : {},
};

const TodoContext = React.createContext();

export default function App() {
  // const [Todos, setTodo] = useLocalStorage('todos', [
  //   { id: 1, content: 'go to park', done: false, delete: false },
  //   { id: 2, content: 'buy a car', done: true, delete: false },
  //   { id: 3, content: 'help others', done: false, delete: false },
  // ]);
  const [Todos, actions] = useTodosWithStorage([
    { id: 1, content: 'go to park', done: false, delete: false },
    { id: 2, content: 'buy a car', done: true, delete: false },
    { id: 3, content: 'help others', done: false, delete: false },
  ]);

  // const [Columns, setColumns] = useLocalStorage('columns', [
  //   {
  //     id: 'todo',
  //     title: 'To Do',
  //     items: [
  //       { id: 1, content: 'go to park', done: false, delete: false },
  //       { id: 2, content: 'buy a car', done: true, delete: false },
  //       { id: 3, content: 'help others', done: false, delete: false },
  //     ],
  //   },
  //   { id: 'in_progress', title: 'In Progress', items: [] },
  //   { id: 'done', title: 'Done', items: [] },
  // ]);

  // const [ColumnOrder, setColumnOrder] = useLocalStorage('column_order', [
  //   'todo',
  //   'in_progress',
  //   'done',
  // ]);

  useDocumentTitle(`Todos, ${Todos.length || '0'}`);
  const [showAbout, setShowAbout] = useKeyDown('?', false);
  //const [showTime, setShowAbout] = useKeyDown('?', false);

  const handleSubmit = event => {
    event.preventDefault();
    const { value } = event.target.todoContent;
    if (value) {
      actions.addTodo(event.target.todoContent.value);
      //dispatch({ type: 'ADD_TODO', content: event.target.todoContent.value });
      event.target.todoContent.value = '';
    }
  };

  const handleDone = id => () => actions.toggleTodo(id);

  const handleDelete = id => () => actions.deleteTodo(id);

  console.log('render list');

  return (
    <TodoContext.Provider value={actions}>
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
    </TodoContext.Provider>
  );
}

const TodoItem = ({ item, handleDone, handleDelete, style }) => {
  console.log('render item');
  const actions = useContext(TodoContext);
  const onDragStart = (event, id) => {
    //console.log(id);
    event.dataTransfer.setData('application/todo-id', id);
  };
  return (
    <div
      style={style}
      draggable
      className="items"
      key={item.id}
      onDragStart={event => onDragStart(event, item.id)}
      onDragOver={event => {
        event.preventDefault();
        console.log(event.nativeEvent.offsetY);
        const id = event.dataTransfer.getData('application/todo-id');
        console.log(JSON.stringify(id, null, 2));
      }}
      onDrop={event => {
        event.preventDefault();
        const id = event.dataTransfer.getData('application/todo-id');
        actions.moveItem(id, item.id);
        //moveItem(id, item.id)
        //console.log(id, item.id);
      }}
    >
      <span style={Styles.done(item.done)}>{item.content}</span>
      <button onClick={handleDelete(item.id)}>
        <i className="fas fa-trash-alt" />
      </button>
      <button onClick={() => actions.toggleTodo(item.id)}>
        <i className="fas fa-check" />
      </button>
    </div>
  );
};

const TodoList = ({ items, handleDone, handleDelete }) => {
  return (
    <Transition
      items={items}
      keys={item => item.id}
      from={{ opacity: 0, maxHeight: 0 }}
      enter={{ opacity: 1, maxHeight: '3rem' }}
      leave={{ opacity: 0, maxHeight: 0 }}
    >
      {item => props => (
        <div style={props}>
          <TodoItem
            style={props}
            item={item}
            handleDone={handleDone}
            handleDelete={handleDelete}
          />
        </div>
      )}
    </Transition>
  );
};

// const Columns = ({ columns }) => {
//   return (
//     <div className="columns">
//       {columns.map(column => TodoList(column.items))}
//     </div>
//   );
// };
