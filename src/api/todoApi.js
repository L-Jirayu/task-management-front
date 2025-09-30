// src/api/todoApi.js
const API_ORIGIN = 'https://minitaskmanage-back.onrender.com';
const BASE_URL = `${API_ORIGIN}/api/todolist`;

// สร้าง query string แบบยืดหยุ่น (ส่งเฉพาะพารามิเตอร์ที่มีจริง)
function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  return q.toString() ? `?${q.toString()}` : '';
}

// รองรับ data ได้ทั้งรูปแบบเก่าและใหม่ (จาก TodoForm รุ่นใหม่ที่แนบ payload)
function normalizeTodoPayload(data = {}) {
  // ถ้ามี data.payload แปลว่ามาจากฟอร์มใหม่ (full fields)
  if (data.payload) {
    const p = data.payload;
    return {
      name: p.name,                       // { th, en }
      description: p.description,         // { th, en }
      assignee: p.assignee,               // { th, en }
      status: data.status ?? true,        // ให้ caller กำหนดเอง ถ้าไม่ส่งมาก็ตั้ง true ตอนสร้าง
      date: p.date || undefined,          // YYYY-MM-DD
      datecomplete: p.datecomplete || undefined,
      subtasks: Array.isArray(p.subtasks) ? p.subtasks : [],
    };
  }

  // ถ้าเป็นรูปแบบเดิม (เช่นจากโค้ดที่มีอยู่)
  // คาดหวัง name:{th,en}, status และฟิลด์อื่นไม่บังคับ
  return {
    name: data.name,                      // { th, en }
    description: data.description,        // optional
    assignee: data.assignee,              // optional
    status: data.status,
    date: data.date,
    datecomplete: data.datecomplete,
    subtasks: Array.isArray(data.subtasks) ? data.subtasks : undefined,
  };
}

// ============ READ ============
/**
 * ดึงรายการ todo พร้อม query params ที่ยืดหยุ่น
 * @param {Object} params - { language, name, status, sortBy, order, page, limit, from, to }
 * ตัวอย่าง: getTodos({ language:'en', name:'asdf', status:false, sortBy:'name', order:'asc' })
 */
export async function getTodos(params = {}) {
  // ค่าเริ่มต้น: language = 'th' (ปรับได้ตามที่คุณใช้งาน)
  const query = buildQuery({ language: 'th', ...params });
  const res = await fetch(`${BASE_URL}${query}`, {
    // สำหรับ read จะ include หรือไม่ include ก็ได้
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`getTodos failed: ${res.status}`);
  return await res.json();
}

// ============ CREATE ============
export async function createTodo(data) {
  const payload = normalizeTodoPayload(data);

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // เผื่อใช้ Auth (JWT Cookie)
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`createTodo failed: ${res.status} ${msg}`);
  }
  return await res.json();
}

// ============ UPDATE ============
export async function updateTodo(id, data) {
  const payload = normalizeTodoPayload(data);

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // เผื่อใช้ Auth (JWT Cookie)
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`updateTodo failed: ${res.status} ${msg}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

// ============ DELETE ============
export async function deleteTodo(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include', // เผื่อใช้ Auth (JWT Cookie)
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`deleteTodo failed: ${res.status} ${msg}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}
