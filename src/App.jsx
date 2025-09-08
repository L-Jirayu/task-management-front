import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TodoList from './components/TodoList';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import { useEffect, useState } from 'react';
import { getUserProfile } from './api/authApi';

function PrivateRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    // เช็ค session จาก cookie
    getUserProfile()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setBooting(false));
  }, []);

  if (booting) return <div style={{ color: '#fff', padding: 24 }}>Loading…</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/app"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <div className="todo-app">
                <TodoList />
              </div>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </Router>
  );
}
