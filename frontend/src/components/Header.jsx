import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SisLogo } from '../assets/icons';
import './Header.css';

export function Header({ title }) {
  const { user } = useAuth();
  const { scale, theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin' || location.pathname.startsWith('/admin');
  const systemTitle = isAdmin ? 'ADMIN INFORMATION SYSTEM' : 'STUDENT INFORMATION SYSTEM';

  const handleOpenSettings = () => {
    navigate(isAdmin ? '/admin/settings' : '/settings');
  };

  return (
    <header className="sis-header">
      <div className="sis-header-top">
        <div className="sis-header-logo-container">
          <SisLogo size={58} />
        </div>
        <div className="sis-header-system-title">
          {systemTitle}
        </div>
        <div className="sis-header-actions">
          <button
            type="button"
            className="sis-header-theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? '☀️ LIGHT' : '🌙 DARK'}
          </button>
          <button
            type="button"
            className="sis-header-settings-btn"
            onClick={handleOpenSettings}
            title="Open Application Settings & Account Information"
          >
            ⚙ SETTINGS ({scale}%)
          </button>
        </div>
      </div>
      {title && (
        <div className="sis-header-page-title">
          <h1>{title}</h1>
        </div>
      )}
    </header>
  );
}

export default Header;
