import React, { useState, useEffect, useRef } from 'react';
import './interface.css';

function TodoForm(props) {
  const initialNameTh = props.edit?.value || '';

  const [nameTh, setNameTh] = useState(initialNameTh);
  const [nameEn, setNameEn] = useState(initialNameTh);
  const [descTh, setDescTh] = useState('');
  const [descEn, setDescEn] = useState('');
  const [assigneeTh, setAssigneeTh] = useState('');
  const [assigneeEn, setAssigneeEn] = useState('');
  const [date, setDate] = useState('');            // YYYY-MM-DD
  const [dateComplete, setDateComplete] = useState('');
  // ✅ ไม่ต้องมี checkbox/สถานะที่ฟอร์ม — default false
  const [subtasks, setSubtasks] = useState([{ th: '', en: '' }]);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    if (props.edit?.value) {
      setNameTh(props.edit.value);
      setNameEn(props.edit.value);
    }
  }, [props.edit]);

  const addSubtask = () => setSubtasks(prev => [...prev, { th: '', en: '' }]);
  const removeSubtask = (index) => setSubtasks(prev => prev.filter((_, i) => i !== index));

  const updateSubtask = (index, field, value) => {
    setSubtasks(prev => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mainName = (nameTh || '').trim();
    if (!mainName) return;

    const fullPayload = {
      name: { th: nameTh.trim(), en: (nameEn || '').trim() },
      description: { th: (descTh || '').trim(), en: (descEn || '').trim() },
      assignee: { th: (assigneeTh || '').trim(), en: (assigneeEn || '').trim() },
      date: date || null,
      datecomplete: dateComplete || null,
      subtasks: (subtasks || [])
        .filter(s => s.th?.trim() || s.en?.trim())
        .map(s => ({
          title: { th: (s.th || '').trim(), en: (s.en || '').trim() },
          done: false,
        })),
    };

    props.onSubmit({ text: mainName, payload: fullPayload });

    // reset form
    setNameTh(''); setNameEn('');
    setDescTh(''); setDescEn('');
    setAssigneeTh(''); setAssigneeEn('');
    setDate(''); setDateComplete('');
    setSubtasks([{ th: '', en: '' }]);
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      {props.edit?.value && (
        <div style={{ color: '#00ffff', marginBottom: 10 }}>
          กำลังแก้ไขกิจกรรม: {props.edit.value}
        </div>
      )}

      {/* Name */}
      <div className="field-grid" style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder={props.edit ? 'แก้ไขชื่อกิจกรรม (ภาษาไทย)' : 'ชื่อกิจกรรม (ภาษาไทย)'}
          value={nameTh}
          onChange={(e) => setNameTh(e.target.value)}
          ref={inputRef}
          className={props.edit ? 'todo-input edit' : 'todo-input'}
          autoComplete="off"
        />
        <input
          type="text"
          placeholder="ชื่อกิจกรรม (English)"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className={props.edit ? 'todo-input edit' : 'todo-input'}
          autoComplete="off"
        />
      </div>

      {/* Description */}
      <div className="field-grid" style={{ marginBottom: 12 }}>
        <textarea
          placeholder="รายละเอียด (ภาษาไทย)"
          value={descTh}
          onChange={(e) => setDescTh(e.target.value)}
          className={props.edit ? 'todo-input edit' : 'todo-input'}
          rows={3}
        />
        <textarea
          placeholder="รายละเอียด (English)"
          value={descEn}
          onChange={(e) => setDescEn(e.target.value)}
          className={props.edit ? 'todo-input edit' : 'todo-input'}
          rows={3}
        />
      </div>

      {/* Assignee */}
      <div className="field-grid" style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="ผู้รับผิดชอบ (ภาษาไทย)"
          value={assigneeTh}
          onChange={(e) => setAssigneeTh(e.target.value)}
          className={props.edit ? 'todo-input edit' : 'todo-input'}
          autoComplete="off"
        />
        <input
          type="text"
          placeholder="Assignee (English)"
          value={assigneeEn}
          onChange={(e) => setAssigneeEn(e.target.value)}
          className={props.edit ? 'todo-input edit' : 'todo-input'}
          autoComplete="off"
        />
      </div>

      {/* Dates */}
      <div className="row" style={{ marginBottom: 12 }}>
        <div className="col">
          <label style={{ display: 'block', marginBottom: 6, fontSize: 12, opacity: 0.8 }}>วันที่เริ่ม (date)</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={props.edit ? 'todo-input edit' : 'todo-input'} />
        </div>
        <div className="col">
          <label style={{ display: 'block', marginBottom: 6, fontSize: 12, opacity: 0.8 }}>วันที่เสร็จ (datecomplete)</label>
          <input type="date" value={dateComplete} onChange={(e) => setDateComplete(e.target.value)} className={props.edit ? 'todo-input edit' : 'todo-input'} />
        </div>
      </div>

      {/* Subtasks */}
      <div className="subtasks" style={{ marginBottom: 12 }}>
        <div className="subtasks-header">
          <span className="section-title">งานย่อย (Subtasks)</span>
          <button type="button" onClick={addSubtask} className="todo-button">+ เพิ่ม Subtask</button>
        </div>

        <div className="subtasks-list">
          {subtasks.map((s, idx) => (
            <div key={idx} className="subtask-row" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
              <input
                type="text"
                placeholder="หัวข้องานย่อย (ไทย)"
                value={s.th}
                onChange={(e) => updateSubtask(idx, 'th', e.target.value)}
                className="todo-input"
                autoComplete="off"
              />
              <input
                type="text"
                placeholder="Subtask title (EN)"
                value={s.en}
                onChange={(e) => updateSubtask(idx, 'en', e.target.value)}
                className="todo-input"
                autoComplete="off"
              />
              <button type="button" onClick={() => removeSubtask(idx)} className="todo-button" style={{ background:'#cc3344' }}>
                ลบ
              </button>
            </div>
          ))}
        </div>
      </div>

      <button className={props.edit ? 'todo-button edit' : 'todo-button'}>
        {props.edit ? 'แก้ไข' : 'เพิ่มกิจกรรม'}
      </button>
    </form>
  );
}

export default TodoForm;
