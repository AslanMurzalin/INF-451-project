import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin';
import CourseSummaryModal from '../../components/CourseSummaryModal';
import './AdminCoursesServicesPage.css';

export function AdminCoursesServicesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseForSummary, setSelectedCourseForSummary] = useState(null);

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

  const handleOpenSummary = (item) => {
    let numericCourseId = 1;
    if (item.course_id) {
      numericCourseId = Number(item.course_id);
    } else if (typeof item.id === 'string' && item.id.startsWith('course-')) {
      numericCourseId = parseInt(item.id.replace('course-', ''), 10) || 1;
    } else if (typeof item.id === 'number') {
      numericCourseId = item.id;
    }

    setSelectedCourseForSummary({
      course_id: numericCourseId,
      title: item.name,
      department_name: item.department || 'Academic Department',
      lecturer_name: item.lecturer || 'Faculty Lecturer',
    });
  };

  return (
    <div className="admin-cs-container">
      <div className="admin-cs-wrapper">
        <div className="cs-subtitle">
          CONNECT FEEDBACK SOURCES TO SPECIFIC COURSES OR SERVICES &amp; VIEW AI SUMMARIES (US5.2)
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
                  <th className="th-cs-actions">AI ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const isCourse = item.feedbackType?.toLowerCase().includes('course');
                  return (
                    <tr key={item.id || idx}>
                      <td className="td-cs-name">{item.name}</td>
                      <td className="td-cs-type">{item.feedbackType}</td>
                      <td className="td-cs-status">{item.status}</td>
                      <td className="td-cs-actions">
                        {isCourse ? (
                          <button
                            type="button"
                            className="cs-ai-summary-btn"
                            onClick={() => handleOpenSummary(item)}
                            title="Generate AI-powered summary of student feedback for this course (US5.2)"
                          >
                            ✨ AI Summary
                          </button>
                        ) : (
                          <span className="cs-na-text">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedCourseForSummary && (
        <CourseSummaryModal
          course={selectedCourseForSummary}
          onClose={() => setSelectedCourseForSummary(null)}
        />
      )}
    </div>
  );
}

export default AdminCoursesServicesPage;
