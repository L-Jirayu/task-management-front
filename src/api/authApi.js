// src/api/authApi.js
const API_ORIGIN = 'http://localhost:3000';

export async function registerUser(data) {
  const res = await fetch(`${API_ORIGIN}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Register failed');
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${API_ORIGIN}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // สำคัญ: ให้ cookie ไป-กลับ
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function logoutUser() {
  const res = await fetch(`${API_ORIGIN}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Logout failed');
  return res.json();
}

export async function getUserProfile() {
  const res = await fetch(`${API_ORIGIN}/users/profile`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Unauthorized or failed to fetch profile');
  return res.json();
}
