import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserIcon, LockIcon } from '../assets/icons';
import './LoginPage.css';

export function LoginPage() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('alice.student@university.edu');
  const [password, setPassword] = useState('StudentPassword123!');
  const [activeRole, setActiveRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset zoom on login page to prevent squishing
  useEffect(() => {
    if (document.documentElement) {
      document.documentElement.style.zoom = '100%';
    }
  }, []);

  const handleRoleSelect = (role) => {
    setActiveRole(role);
    setError('');
    if (role === 'STUDENT') {
      setUsername('alice.student@university.edu');
      setPassword('StudentPassword123!');
    } else {
      setUsername('admin@university.edu');
      setPassword('AdminPassword123!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      const data = await login(username.trim(), password.trim());
      const destination = data.role === 'admin' ? '/admin' : '/courses';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-container ${theme === 'dark' ? 'login-dark' : ''}`}>
      {/* Left blue decorative wedge polygon matching Figma */}
      <div className="login-wedge"></div>

      {/* Main Login Form Area */}
      <div className="login-card-wrapper">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-title-box">
            <h1 className="login-title">LOGIN</h1>
            <div className="login-title-underline"></div>
          </div>

          {error && (
            <div className="login-error-alert" role="alert">
              {error}
            </div>
          )}

          <div className="login-input-group">
            <input
              type="text"
              id="username"
              name="username"
              className="login-input"
              placeholder="USERNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <div className="login-input-icon">
              <UserIcon size={20} color="currentColor" />
            </div>
          </div>

          <div className="login-input-group">
            <input
              type="password"
              id="password"
              name="password"
              className="login-input"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <div className="login-input-icon">
              <LockIcon size={20} color="currentColor" />
            </div>
          </div>

          <div className="login-forgot-row">
            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                alert('Contact system administrator at admin@university.edu to reset password.');
              }}
              className="login-forgot-link"
            >
              FORGOT PASSWORD?
            </a>
          </div>

          <div className="login-button-row">
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </div>
        </form>
      </div>

      {/* Right side role indicator matching Figma */}
      <div className="login-role-selector">
        <button
          type="button"
          onClick={() => handleRoleSelect('ADMIN')}
          className={`login-role-item ${activeRole === 'ADMIN' ? 'active' : ''}`}
        >
          ADMIN
        </button>
        <button
          type="button"
          onClick={() => handleRoleSelect('STUDENT')}
          className={`login-role-item ${activeRole === 'STUDENT' ? 'active' : ''}`}
        >
          STUDENT
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
