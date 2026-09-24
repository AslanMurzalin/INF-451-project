import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SisLogo } from '../assets/icons';
import './Header.css';

export function Header({ title }) {
  const { user } = useAuth();
  const location = useLocation();

  const isAdmin = user?.role === 'admin' || location.pathname.startsWith('/admin');
  const systemTitle = isAdmin ? 'ADMIN INFORMATION SYSTEM' : 'STUDENT INFORMATION SYSTEM';

  return (
    <header className="sis-header">
      <div className="sis-header-top">
        <div className="sis-header-logo-container">
          <SisLogo size={58} />
        </div>
        <div className="sis-header-system-title">
          {systemTitle}
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
