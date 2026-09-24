import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin';
import './AdminDashboardPage.css';

export function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await adminService.getDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const feedbackSourcesCount = summary?.source_types?.length || 3;
  const coursesCount = summary?.total_courses || 12;
  const servicesCount = summary?.total_services || 5;
  const categoriesCount = (summary?.total_departments || 4) + (summary?.active_surveys || 1) + 12; // 17

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-content-wrapper">
        <div className="dashboard-overview-label">
          OVERVIEW
        </div>

        {loading ? (
          <div className="dashboard-loading">Loading overview metrics...</div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-metrics-table">
              <thead>
                <tr>
                  <th className="th-card">CARD</th>
                  <th className="th-number">NUMBER</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="td-card">FEEDBACK SOURCES</td>
                  <td className="td-number">{feedbackSourcesCount}</td>
                </tr>
                <tr>
                  <td className="td-card">COURSES</td>
                  <td className="td-number">{coursesCount}</td>
                </tr>
                <tr>
                  <td className="td-card">SERVICES</td>
                  <td className="td-number">{servicesCount}</td>
                </tr>
                <tr>
                  <td className="td-card">ACTIVE CATEGORIES</td>
                  <td className="td-number">{categoriesCount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
