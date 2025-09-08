// src/components/SignupPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authApi';
import '../css/SignupPage.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    tel: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
    setOk('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim() || !form.confirmPassword.trim() || !form.name.trim() || !form.tel.trim()) {
      setError('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    if (!/^\d+$/.test(form.tel)) {
      setError('เบอร์โทรต้องเป็นตัวเลขเท่านั้น');
      return;
    }

    setSubmitting(true);
    try {
      await registerUser({
        email: form.email,
        password: form.password,
        name: form.name,
        tel: form.tel,
      });
      setOk('สมัครสมาชิกสำเร็จ! โปรดล็อกอิน');
      setTimeout(() => navigate('/', { replace: true }), 700);
    } catch {
      setError('สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>สมัครสมาชิก</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <input type="text" name="fakeusernameremembered" style={{ display: 'none' }} />
        <input type="password" name="fakepasswordremembered" style={{ display: 'none' }} />

        <div className="input-wrapper">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="new-email"
          />
        </div>

        <div className="input-wrapper">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="input-wrapper">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="input-wrapper">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="off"
          />
        </div>

        <div className="input-wrapper">
          <input
            type="tel"
            name="tel"
            placeholder="Tel"
            value={form.tel}
            onChange={handleChange}
            required
            autoComplete="off"
          />
        </div>

        {error && <div className="form-error">{error}</div>}
        {ok && <div className="form-ok">{ok}</div>}

        <button type="submit" className="signup-btn" disabled={submitting}>
          {submitting ? 'กำลังสมัคร…' : 'Signup'}
        </button>
      </form>

      <p className="login-link">
        มีบัญชีอยู่แล้ว? <Link to="/">เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}
