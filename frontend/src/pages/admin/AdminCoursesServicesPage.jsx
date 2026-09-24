import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin';
import './AdminCoursesServicesPage.css';

export function AdminCoursesServicesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await adminService.getCoursesAndServices();
        setItems(data);
      } catch (err) {
        console.error('Failed to load courses & services:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="admin-cs-container">
      <div className="admin-cs-wrapper">
        <div className="cs-subtitle">
          CONNECT FEEDBACK SOURCES TO SPECIFIC COURSES OR SERVICES
        </div>

        {loading ? (
          <div className="cs-loading">Loading courses and services...</div>
        ) : (
          <div className="cs-table-wrapper">
            <table className="cs-data-table">
              <thead>
                <tr>
                  <th className="th-cs-name">COURSE / SERVICE</th>
                  <th className="th-cs-type">FEEDBACK TYPE</th>
                  <th className="th-cs-status">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="td-cs-name">{item.name}</td>
                    <td className="td-cs-type">{item.feedbackType}</td>
                    <td className="td-cs-status">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCoursesServicesPage;
