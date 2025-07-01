import React from 'react';
import { AiFillCloseSquare } from 'react-icons/ai';
import { RiEditBoxFill } from 'react-icons/ri';
import './interface.css';

function Todo({ todos, completeTodo, removeTodo, setEdit }) {
  return todos.map(todo => (
    <div className={todo.status ? 'todo-row' : 'todo-row complete'} key={todo._id}>
      <div onClick={() => completeTodo(todo._id)}>
        {todo.name?.th || 'ไม่มีข้อมูล'}
      </div>
      <div className='icons'>
        <AiFillCloseSquare
          onClick={() => {
            if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรม "${todo.name?.th}" นี้?`)) {
              removeTodo(todo._id);
            }
          }}
          className='delete-icon'
          style={{ color: 'red' }}
        />

        <RiEditBoxFill
          onClick={() => {
            if (todo.status) {
              setEdit({ id: todo._id, value: todo.name?.th || '' });
            } else {
              alert('ไม่สามารถแก้ไขกิจกรรมที่ทำเสร็จแล้วได้');
            }
          }}
          className='edit-icon'
          style={{ opacity: todo.status ? 1 : 0.3, cursor: todo.status ? 'pointer' : 'not-allowed' }}
        />
      </div>
    </div>
  ));
}

export default Todo;
