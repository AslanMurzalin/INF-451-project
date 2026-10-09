import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import './MainLayout.css';

export function MainLayout() {
  const location = useLocation();

  // Determine page title based on active path to match Figma
  const getPageTitle = (pathname) => {
    // Admin paths
    if (pathname.includes('/admin/dashboard')) return 'MAIN DASHBOARD';
    if (pathname.includes('/admin/feedbacks')) return 'STUDENT FEEDBACKS';
    if (pathname.includes('/admin/surveys-results')) return 'SURVEY RESULTS & ANALYTICS';
    if (pathname.includes('/admin/sources')) return 'FEEDBACK SOURCES';
    if (pathname.includes('/admin/courses-services')) return 'COURSES & SERVICES';
    if (pathname.includes('/admin/settings')) return 'APPLICATION SETTINGS';
    if (pathname === '/admin' || pathname === '/admin/') return ''; // Blank title on Admin Home page matching Figma

    // Student paths
    if (pathname.includes('/feedback/view')) return 'VIEW FEEDBACK';
    if (pathname.includes('/feedback')) return 'FEEDBACK';
    if (pathname.includes('/surveys')) return 'INSTITUTIONAL SURVEYS';
    if (pathname.includes('/services')) return 'CAMPUS SERVICES';
    if (pathname.includes('/courses')) return 'MY COURSES';
    if (pathname.includes('/settings')) return 'APPLICATION SETTINGS';

    return '';
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="sis-main-layout">
      <Header title={title} />
      <div className="sis-layout-body">
        <Sidebar />
        <main className="sis-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
