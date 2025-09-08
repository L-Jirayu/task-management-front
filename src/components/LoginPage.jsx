import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authApi';
import '../css/LoginPage.css';

export default function LoginPage({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const guardRef = useRef(false); // กันกดซ้ำ/StrictMode

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (guardRef.current) return;
    guardRef.current = true;

    if (!form.email.trim() || !form.password.trim()) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      guardRef.current = false;
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      guardRef.current = false;
      return;
    }

    setSubmitting(true);
    try {
      await loginUser(form);           // server จะ set cookie
      setIsAuthenticated(true);        // ✅ แจ้ง App ว่า auth แล้ว
      navigate('/todolist', { replace: true }); // ✅ ไปหน้าเดียวกับ App
    } catch (err) {
      console.error(err);
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setSubmitting(false);
      guardRef.current = false;
    }
  };

  return (
    <div className="login-container">
      <h2>เข้าสู่ระบบ</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required autoComplete="off" />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required autoComplete="off" />
        {error && <div className="form-error">{error}</div>}
        <button className="login-btn" type="submit" disabled={submitting}>
          {submitting ? 'กำลังเข้าสู่ระบบ…' : 'Login'}
        </button>
      </form>
      <p className="signup-redirect">
        ยังไม่มีบัญชี? <Link to="/signup">สมัครเลย</Link>
      </p>
    </div>
  );
}
