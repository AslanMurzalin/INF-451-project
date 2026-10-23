import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AvatarSilhouette } from '../assets/icons';
import './Sidebar.css';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'admin' || user?.role === 'lecturer' || location.pathname.startsWith('/admin');
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

      {/* Admin Home Avatar Icon */}
      {isAdmin && isHomeActive && (
        <div className="sis-sidebar-avatar-wrapper">
          <AvatarSilhouette size={54} color="currentColor" />
        </div>
      )}

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
              to="/admin/feedbacks"
              className={({ isActive }) => `sis-sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              ALL FEEDBACKS
            </NavLink>

            <NavLink
              to="/admin/surveys-results"
              className={({ isActive }) => `sis-sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              SURVEY RESULTS
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

            <NavLink
              to="/admin/settings"
              className={({ isActive }) => `sis-sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              SETTINGS
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
              to="/surveys"
              className={({ isActive }) => `sis-sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              ACTIVE SURVEYS
            </NavLink>

            <NavLink
              to="/services"
              className={({ isActive }) => `sis-sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              CAMPUS SERVICES
            </NavLink>

            <NavLink
              to="/feedback/view"
              className={({ isActive }) => `sis-sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              VIEW MY FEEDBACK
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) => `sis-sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              SETTINGS
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
