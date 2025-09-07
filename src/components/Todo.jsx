import React from 'react';
import { AiFillCloseSquare } from 'react-icons/ai';
import { RiEditBoxFill } from 'react-icons/ri';
import './interface.css';

const displayName = (nameObj) =>
  typeof nameObj === 'string' ? nameObj : (nameObj?.th || nameObj?.en || '');
const displayI18n = (obj) =>
  typeof obj === 'string' ? obj : (obj?.th || obj?.en || '');
const formatDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

function Todo({ todos, completeTodo, removeTodo, setEdit, toggleSubtask }) {
  if (!Array.isArray(todos)) return null;

  return todos.map((todo) => {
    const title = displayName(todo.name) || 'ไม่มีข้อมูล';
    const assignee = displayI18n(todo.assignee);
    const description = displayI18n(todo.description);
    const dateStart = formatDate(todo.date);
    const dateDone = formatDate(todo.datecomplete);

    // หมายเหตุ: โค้ดฝั่งคุณใช้ status=true = ยังไม่เสร็จ, status=false = เสร็จแล้ว
    const isActive = !!todo.status;

    // มี subtask ไหนยังไม่ติ้กบ้าง?
    const hasUndoneSubtask = (todo.subtasks || []).some((s) => !s?.done);

    // ปิดงานหลักได้ก็ต่อเมื่อ (กำลัง active) และ (ไม่มี subtask ค้าง)
    const canToggleMain = isActive ? !hasUndoneSubtask : true;

    const handleToggleMain = () => {
      if (!canToggleMain) return;
      // กดแล้วจะ toggle status จาก true -> false (เสร็จ) / false -> true (เปิดใหม่)
      completeTodo(todo._id);
    };

    return (
      <div className={isActive ? 'todo-row' : 'todo-row complete'} key={todo._id}>
        <div style={{ flex: 1, display: 'grid', gap: 6 }}>
          {/* งานหลัก */}
          <div
            onClick={handleToggleMain}
            title={
              canToggleMain
                ? 'คลิกเพื่อสลับสถานะเสร็จ/ไม่เสร็จ'
                : 'ต้องติ้กงานย่อยให้เสร็จทั้งหมดก่อน'
            }
            style={{
              fontWeight: 700,
              cursor: canToggleMain ? 'pointer' : 'not-allowed',
              opacity: canToggleMain ? 1 : 0.6,
              textDecoration: !isActive ? 'line-through' : 'none',
            }}
          >
            {title}
          </div>

          {description && <div style={{ fontSize: 14, opacity: 0.9 }}>{description}</div>}

          <div className="meta-line">
            {assignee && <span>ผู้รับผิดชอบ: {assignee}</span>}
            {dateStart && <span>เริ่ม: {dateStart}</span>}
            {dateDone && <span>เสร็จ: {dateDone}</span>}
          </div>

          {/* Subtasks */}
          {!!(todo.subtasks?.length) && (
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                งานย่อย:
                {hasUndoneSubtask && (
                  <span style={{ marginLeft: 8, fontWeight: 500, opacity: 0.9 }}>
                    (ยังไม่ติ้ก {todo.subtasks.filter((s) => !s?.done).length} งาน)
                  </span>
                )}
              </div>
              <ul>
                {todo.subtasks.map((s, idx) => {
                  const stTitle = displayI18n(s?.title) || `งานย่อย ${idx + 1}`;
                  const done = !!s?.done; // true = ติ้กแล้ว/เสร็จแล้ว

                  return (
                    <li key={idx} style={{ lineHeight: 1.5 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* ✅ ติ้ก = เสร็จแล้ว (done=true) / ไม่ติ้ก = ยังไม่เสร็จ */}
                        <input
                          type="checkbox"
                          checked={done}
                          title={done ? 'เสร็จแล้ว (ติ๊กไว้)' : 'ยังไม่เสร็จ (ติ๊กเพื่อเสร็จ)'}
                          onChange={(e) => {
                            const newDone = e.target.checked; // true=ติ้ก
                            toggleSubtask?.(todo._id, idx, newDone);
                          }}
                        />
                        {/* ✅ ตามสเป็คใหม่: done=true = มีขีด / done=false = ไม่มีขีด */}
                        <span style={{ textDecoration: done ? 'line-through' : 'none' }}>
                          {stTitle}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* ปุ่มลบ/แก้ไข */}
        <div className="icons" style={{ gap: 8 }}>
          <AiFillCloseSquare
            onClick={() => {
              if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรม "${title}" นี้?`)) {
                removeTodo(todo._id);
              }
            }}
            className="delete-icon"
            style={{ color: 'red', cursor: 'pointer' }}
            title="ลบ"
          />
          <RiEditBoxFill
            onClick={() => {
              if (isActive) setEdit({ id: todo._id, value: title });
              else alert('ไม่สามารถแก้ไขกิจกรรมที่ทำเสร็จแล้วได้');
            }}
            className="edit-icon"
            style={{ opacity: isActive ? 1 : 0.3, cursor: isActive ? 'pointer' : 'not-allowed' }}
            title={isActive ? 'แก้ไข' : 'แก้ไขไม่ได้ (เสร็จแล้ว)'}
          />
        </div>
      </div>
    );
  });
}

export default Todo;
