import React, { useState, useEffect } from 'react';
import TodoForm from './TodoForm';
import Todo from './Todo';
import { getTodos, createTodo, updateTodo as updateTodoApi, deleteTodo } from '../api/todoApi';
import './interface.css';

function TodoList() {
  const [language, setLanguage] = useState('th');
  const [todos, setTodos] = useState([]);
  const [edit, setEdit] = useState({ id: null, value: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const fetchTodos = async (query = '') => {
    setIsLoading(true);
    try {
      const data = await getTodos();
      const normalized = (Array.isArray(data) ? data : [])
        .filter(todo =>
          todo.name.th.toLowerCase().includes(query.toLowerCase()) ||
          todo.name.en.toLowerCase().includes(query.toLowerCase())
        )
        .map(todo => ({ ...todo, name: todo.name[language] || '' }));
      setTodos(normalized);
    } catch (err) {
      alert('โหลดข้อมูลไม่สำเร็จ');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTodos(searchText); }, [searchText, language]);

  const handleSearchChange = (e) => setSearchText(e.target.value);

  const addTodo = async (todo) => {
    if (!todo.text?.trim()) return;
    try {
      const newTodo = await createTodo({ name: { th: todo.text, en: todo.text }, status: true });
      setTodos(prev => [{ ...newTodo, name: newTodo.name[language] }, ...prev]);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเพิ่มกิจกรรม');
    }
  };

  const updateTodo = async (id, newValue) => {
    if (!newValue.text?.trim()) return;
    if (!window.confirm(`คุณยืนยันที่จะแก้ไขกิจกรรมเป็น "${newValue.text}" ใช่ไหม?`)) return;

    const target = todos.find(item => item._id === id);
    if (!target) return;

    try {
      const updated = await updateTodoApi(id, { name: { th: newValue.text, en: newValue.text }, status: target.status });
      setTodos(prev => prev.map(item => (item._id === id ? { ...updated, name: updated.name[language] } : item)));
      setEdit({ id: null, value: '' });
      setSearchText('');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการอัปเดตกิจกรรม');
    }
  };

  const removeTodo = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบกิจกรรม');
    }
  };

  const completeTodo = async (id) => {
    const target = todos.find(item => item._id === id);
    if (!target) return;
    try {
      const updated = await updateTodoApi(id, { name: { th: target.name, en: target.name }, status: !target.status });
      setTodos(prev => prev.map(item => (item._id === id ? { ...updated, name: updated.name[language] } : item)));
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะกิจกรรม');
    }
  };

  return (
    <div>
      <h1>TodoList Website</h1>
      <h2>คลิกที่ข้อความ เมื่อคุณทำกิจกรรมนั้นเสร็จสิ้น</h2>

      <input
        type="text"
        placeholder="ค้นหา todo ตามชื่อ..."
        value={searchText}
        onChange={handleSearchChange}
        style={{ padding: '8px', marginBottom: '12px', width: '300px' }}
      />

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
        <Todo todos={todos} completeTodo={completeTodo} removeTodo={removeTodo} setEdit={setEdit} />
      )}
    </div>
  );
}

export default TodoList;
