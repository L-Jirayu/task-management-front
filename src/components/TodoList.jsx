import React, { useState, useEffect } from 'react';
import TodoForm from './TodoForm';
import Todo from './Todo';
import {
  getTodos,
  createTodo,
  updateTodo as updateTodoApi,
  deleteTodo,
} from '../api/todoApi';

import './interface.css';

function TodoList() {
  const [language, setLanguage] = useState('th');

  const [todos, setTodos] = useState([]);
  const [edit, setEdit] = useState({ id: null, value: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTodos()
      .then(data => {
        if (Array.isArray(data)) setTodos(data);
      })
      .catch(err => {
        alert('โหลดข้อมูลไม่สำเร็จ');
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const addTodo = async (todo) => {
    if (!todo.text || /^\s*$/.test(todo.text)) return;

    try {
      const newTodo = await createTodo({
        name: { th: todo.text, en: todo.text },
        status: true
      });

      setTodos(prevTodos => [newTodo, ...prevTodos]);
    } 
    catch (error) {
      alert('เกิดข้อผิดพลาดในการเพิ่มกิจกรรม');
      console.error(error);
    }
  };

  const updateTodo = async (id, newValue) => {
    if (!newValue.text || /^\s*$/.test(newValue.text)) return;

    const confirmEdit = window.confirm(`คุณยืนยันที่จะแก้ไขกิจกรรมเป็น "${newValue.text}" ใช่ไหม?`);
    if (!confirmEdit) return;

    const target = todos.find(item => item._id === id);
    if (!target) return;

    try {
      const updated = await updateTodoApi(id, {
        name: { th: newValue.text, en: newValue.text },
        status: target.status
      });

      setTodos(prevTodos => prevTodos.map(item => (item._id === id ? updated : item)));
      setEdit({ id: null, value: '' });
    } 
    catch (error) {
      alert('เกิดข้อผิดพลาดในการอัปเดตกิจกรรม');
      console.error(error);
    }
  };

  const removeTodo = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(item => item._id !== id));
    } 
    catch (error) {
      alert('เกิดข้อผิดพลาดในการลบกิจกรรม');
      console.error(error);
    }
  };

  const completeTodo = async (id) => {
    const target = todos.find(item => item._id === id);
    if (!target) return;

    try {
      const updated = await updateTodoApi(id, {
        name: target.name,
        status: !target.status,
      });

      setTodos(prev => prev.map(item => item._id === id ? updated : item));
    } 
    catch (error) {
      alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะกิจกรรม');
      console.error(error);
    }
  };

  return (
    <div>
      <h1>TodoList Website</h1>
      <h2>คลิกที่ข้อความ เมื่อคุณทำกิจกรรมนั้นเสร็จสิ้น</h2>

      {edit.id ? (
        <TodoForm edit={edit} onSubmit={(value) => updateTodo(edit.id, value)} />
      ) : (
        <TodoForm onSubmit={addTodo} />
      )}

      {isLoading ? (
        <p style={{ color: '#00ffff' }}>กำลังโหลดข้อมูล...</p>
      ) : todos.length === 0 ? (
        <p style={{ color: '#aaa' }}>ยังไม่มีกิจกรรมในระบบ</p>
      ) : (
        <Todo
          todos={todos}
          completeTodo={completeTodo}
          removeTodo={removeTodo}
          setEdit={setEdit}
        />
      )}
    </div>
  );
}

export default TodoList;