// src/components/LoginPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, getUserProfile } from '../api/authApi';
import '../css/LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ถ้ามี session แล้ว เด้งไปหน้า Interface
  useEffect(() => {
    (async () => {
      try {
        await getUserProfile();
        navigate('/interface', { replace: true });
      } catch {
        /* ไม่มี session ก็อยู่หน้า login ต่อไป */
      }
    })();
  }, [navigate]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }

    setSubmitting(true);
    try {
      await loginUser(form); // backend จะ set cookie access_token
      navigate('/interface', { replace: true });
    } catch (err) {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <h2>เข้าสู่ระบบ</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <input type="text" name="fakeusernameremembered" style={{ display: 'none' }} />
        <input type="password" name="fakepasswordremembered" style={{ display: 'none' }} />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="off"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="off"
        />

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
