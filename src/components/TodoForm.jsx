import React, { useState, useEffect, useRef } from 'react';
import './interface.css';

function TodoForm(props) {
  const [input, setInput] = useState(props.edit ? props.edit.value : '');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, [props.edit]);

  const handleChange = (e) => setInput(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    props.onSubmit({ text: input.trim() });
    setInput('');
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      {props.edit && props.edit.value && (
        <div style={{ color: '#00ffff', marginBottom: '10px' }}>
          กำลังแก้ไขกิจกรรม: {props.edit.value}
        </div>
      )}

      <input
        type="text"
        placeholder={props.edit ? 'แก้ไขกิจกรรมที่คุณทำ' : 'เพิ่มกิจกรรมที่คุณทำ'}
        value={input}
        name="text"
        className={props.edit ? 'todo-input edit' : 'todo-input'}
        onChange={handleChange}
        ref={inputRef}
        autoComplete="off"
      />

      <button className={props.edit ? 'todo-button edit' : 'todo-button'}>
        {props.edit ? 'แก้ไข' : 'เพิ่มกิจกรรม'}
      </button>
    </form>
  );
}

export default TodoForm;