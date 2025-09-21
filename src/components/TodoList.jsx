import React, { useState, useEffect } from 'react';
import TodoForm from './TodoForm';
import Todo from './Todo';
import { getTodos, createTodo, updateTodo as updateTodoApi, deleteTodo } from '../api/todoApi';
import { logoutUser } from '../api/authApi'; // <-- ใช้ตัวนี้สำหรับ logout
import './interface.css';

function TodoList() {
  const [language, setLanguage] = useState('th');
  const [todos, setTodos] = useState([]);
  const [edit, setEdit] = useState({ id: null, value: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  /* ---------- Logout ---------- */
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/';
  };

  /* ---------- Helpers: I18n normalizers ---------- */
  const ensureI18nObject = (val, fallback = '') => {
    if (!val) return { th: fallback, en: fallback };
    if (typeof val === 'string') return { th: val, en: val };
    return { th: val.th ?? fallback, en: val.en ?? fallback };
  };
  const ensureNameObject = (name, fallback = '') => ensureI18nObject(name, fallback);

  const normalizeSubtasks = (subs) =>
    (subs || []).map((s) => ({
      title: ensureI18nObject(s?.title, ''),
      done: !!s?.done,
    }));

  const buildPatchBodyFromTarget = (target, overrides = {}) => ({
    name: ensureNameObject(overrides.name ?? target.name, ''),
    status: overrides.status ?? target.status,
    description: ensureI18nObject(overrides.description ?? target.description, ''),
    assignee: ensureI18nObject(overrides.assignee ?? target.assignee, ''),
    date: overrides.date ?? target.date,
    datecomplete: overrides.datecomplete ?? target.datecomplete,
    subtasks: normalizeSubtasks(overrides.subtasks ?? target.subtasks),
  });

  /* ---------- Fetch ---------- */
  const fetchTodos = async (query = '') => {
    setIsLoading(true);
    try {
      const data = await getTodos({ language, name: query });
      setTodos(Array.isArray(data) ? data : []);
    } catch (err) {
      alert('โหลดข้อมูลไม่สำเร็จ');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTodos(searchText); }, [language, searchText]);
  const handleSearchChange = (e) => setSearchText(e.target.value);

  /* ---------- CREATE ---------- */
  const addTodo = async (formValue) => {
    const payload = formValue?.payload
      ? { ...formValue.payload, status: true }
      : { name: { th: formValue.text, en: formValue.text }, status: true };

    try {
      const newTodo = await createTodo(payload);
      setTodos(prev => [newTodo, ...prev]);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเพิ่มกิจกรรม');
    }
  };

  /* ---------- UPDATE (edit text/fields) ---------- */
  const updateTodo = async (id, newValue) => {
    const text = newValue?.text?.trim();
    if (!text && !newValue?.payload) return;
    if (!window.confirm(`คุณยืนยันที่จะแก้ไขกิจกรรมเป็น "${text || '(fields updated)'}" ใช่ไหม?`)) return;

    const target = todos.find(item => item._id === id);
    if (!target) return;

    const body = newValue?.payload
      ? buildPatchBodyFromTarget(target, { ...newValue.payload, status: target.status })
      : buildPatchBodyFromTarget(target, { name: { th: text, en: text }, status: target.status });

    try {
      const updated = await updateTodoApi(id, body);
      setTodos(prev => prev.map(item => (item._id === id ? updated : item)));
      setEdit({ id: null, value: '' });
      setSearchText('');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการอัปเดตกิจกรรม');
    }
  };

  /* ---------- DELETE ---------- */
  const removeTodo = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบกิจกรรม');
    }
  };

  /* ---------- TOGGLE COMPLETE (main task) ---------- */
  const completeTodo = async (id) => {
    const target = todos.find(item => item._id === id);
    if (!target) return;

    const goingToComplete = !!target.status;
    if (goingToComplete) {
      const hasUndoneSubtask = (target.subtasks || []).some(st => !st?.done);
      if (hasUndoneSubtask) {
        alert('กรุณาทำงานย่อยให้เสร็จทั้งหมดก่อนปิดงานหลัก');
        return;
      }
    }

    const body = buildPatchBodyFromTarget(target, { status: !target.status });

    try {
      const updated = await updateTodoApi(id, body);
      setTodos(prev => prev.map(item => (item._id === id ? updated : item)));
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะกิจกรรม');
    }
  };

  /* ---------- TOGGLE SUBTASK ---------- */
  const toggleSubtask = async (todoId, index, newDone) => {
    const target = todos.find(t => t._id === todoId);
    if (!target) return;

    // optimistic UI
    setTodos(prev => prev.map(t => {
      if (t._id !== todoId) return t;
      const copy = { ...t, subtasks: [...(t.subtasks || [])] };
      copy.subtasks[index] = { ...copy.subtasks[index], done: newDone };
      return copy;
    }));

    const normalizedSubs = normalizeSubtasks(target.subtasks).map((s, i) =>
      i === index ? { ...s, done: newDone } : s
    );

    const body = buildPatchBodyFromTarget(target, { subtasks: normalizedSubs });

    try {
      const updated = await updateTodoApi(todoId, body);
      setTodos(prev => prev.map(item => (item._id === todoId ? updated : item)));
    } catch (err) {
      console.error(err);
      alert('อัปเดตสถานะงานย่อยไม่สำเร็จ');
      // rollback
      setTodos(prev => prev.map(t => {
        if (t._id !== todoId) return t;
        const copy = { ...t, subtasks: [...(t.subtasks || [])] };
        copy.subtasks[index] = { ...copy.subtasks[index], done: !newDone };
        return copy;
      }));
    }
  };

  return (
    <div>
      {/* Header + Logout */}
      <div className="app-header">
        <div className="header-titles">
          <h1>TodoList Website</h1>
          <h2>คลิกที่ข้อความ เมื่อคุณทำกิจกรรมนั้นเสร็จสิ้น</h2>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* สองคอลัมน์ */}
      <div className="app-grid">
        {/* Left: Form */}
        <div className="pane pane-left">
          {edit.id ? (
            <TodoForm edit={edit} onSubmit={(value) => updateTodo(edit.id, value)} />
          ) : (
            <TodoForm onSubmit={addTodo} />
          )}
        </div>

        {/* Right: Search + List */}
        <div className="pane pane-right">
          <div className="controls">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="language-select"
            >
              <option value="th">ภาษาไทย (th)</option>
              <option value="en">English (en)</option>
            </select>

            <input
              type="text"
              placeholder="ค้นหาตามชื่อ..."
              value={searchText}
              onChange={handleSearchChange}
              className="todo-input"
              style={{ maxWidth: 300 }}
            />
          </div>

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
              toggleSubtask={toggleSubtask}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default TodoList;
