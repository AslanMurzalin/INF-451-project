import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AvatarSilhouette } from '../assets/icons';
import './Sidebar.css';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'admin' || location.pathname.startsWith('/admin');
  const isHomeActive = isAdmin
    ? location.pathname === '/admin' || location.pathname === '/admin/'
    : location.pathname === '/courses';

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sis-sidebar">
      {/* Home Page Top Banner / Button */}
      <NavLink
        to={isAdmin ? '/admin' : '/courses'}
        className={`sis-sidebar-home-btn ${isHomeActive ? 'active' : ''}`}
      >
        HOME PAGE
      </NavLink>

      {/* Admin Home Avatar Icon (matches media_1790261533531.jpg) */}
      {isAdmin && isHomeActive && (
        <div className="sis-sidebar-avatar-wrapper">
          <AvatarSilhouette size={54} color="#000000" />
        </div>
      )}

      {/* Main Section Header */}
      <div className="sis-sidebar-section-title">
        MAIN SECTION
      </div>

      {/* Navigation List based on Role */}
      <nav className="sis-sidebar-nav">
        {isAdmin ? (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `sis-sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              DASHBOARD
            </NavLink>

            <NavLink
              to="/admin/sources"
              className={({ isActive }) => `sis-sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              FEEDBACK SOURCES
            </NavLink>

            <NavLink
              to="/admin/courses-services"
              className={({ isActive }) => `sis-sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              COURSES & SERVICES
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/courses"
              className={({ isActive }) => `sis-sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              MY COURSES
            </NavLink>

            <NavLink
              to="/feedback"
              end
              className={({ isActive }) => `sis-sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              GIVE FEEDBACK
            </NavLink>

            <NavLink
              to="/feedback/view"
              className={({ isActive }) => `sis-sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              VIEW MY FEEDBACK
            </NavLink>
          </>
        )}

        <button
          onClick={handleLogout}
          className="sis-sidebar-nav-item sis-sidebar-exit-btn"
          title="Log out"
        >
          EXIT
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
