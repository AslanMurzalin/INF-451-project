import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminHomePage.css';

export function AdminHomePage() {
  const { user } = useAuth();

  const now = new Date();
  const formattedLastLogin = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="admin-home-container">
      <div className="admin-profile-table-wrapper">
        <table className="admin-profile-grid">
          <tbody>
            <tr>
              <td className="admin-info-label">NAME :</td>
              <td className="admin-info-value">{user?.fullName || 'System Administrator'}</td>
            </tr>
            <tr>
              <td className="admin-info-label">ROLE :</td>
              <td className="admin-info-value">{(user?.role || 'ADMIN').toUpperCase()}</td>
            </tr>
            <tr>
              <td className="admin-info-label">EMAIL :</td>
              <td className="admin-info-value">{user?.email || 'admin@university.edu'}</td>
            </tr>
            <tr>
              <td className="admin-info-label">DEPARTMENT :</td>
              <td className="admin-info-value">Computer Science & Engineering</td>
            </tr>
            <tr>
              <td className="admin-info-label">LAST LOGIN :</td>
              <td className="admin-info-value">{formattedLastLogin}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminHomePage;
