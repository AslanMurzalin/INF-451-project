import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import coursesService from '../services/courses';
import './MyCoursesPage.css';

export function MyCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const data = await coursesService.getCourses(1, 20);
        setCourses(data?.items || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses from backend. Showing available information.');
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  return (
    <div className="courses-page-container">
      {/* Student Profile Card - structured grid matching Figma */}
      <div className="student-profile-table-wrapper">
        <table className="student-info-grid">
          <tbody>
            <tr>
              <td className="info-label">STUDENT [No.] :</td>
              <td className="info-value">{user?.userId ? `SIS-2026-${String(user.userId).padStart(4, '0')}` : 'SIS-2026-0042'}</td>
            </tr>
            <tr>
              <td className="info-label">FULLNAME :</td>
              <td className="info-value">{user?.fullName || 'Alice Johnson'}</td>
            </tr>
            <tr>
              <td className="info-label">FULLNAME (NATIVE) :</td>
              <td className="info-value">{user?.fullName || 'Alice Johnson'}</td>
            </tr>
            <tr>
              <td className="info-label">BIRTH DATE :</td>
              <td className="info-value">15.08.2003</td>
            </tr>
            <tr>
              <td className="info-label">EMAIL :</td>
              <td className="info-value">{user?.email || 'alice.student@university.edu'}</td>
            </tr>
            <tr>
              <td className="info-label">ROLE :</td>
              <td className="info-value">{(user?.role || 'STUDENT').toUpperCase()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Course List Section */}
      <div className="enrolled-courses-section">
        <div className="enrolled-courses-header">
          <h2>ENROLLED COURSES</h2>
        </div>

        {loading ? (
          <div className="courses-status-state">Loading courses...</div>
        ) : error && courses.length === 0 ? (
          <div className="courses-status-state error">{error}</div>
        ) : courses.length === 0 ? (
          <div className="courses-status-state">No courses currently enrolled.</div>
        ) : (
          <div className="courses-table-wrapper">
            <table className="courses-data-table">
              <thead>
                <tr>
                  <th>CODE / TITLE</th>
                  <th>LECTURER</th>
                  <th>DEPARTMENT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.course_id}>
                    <td className="course-title-cell">{course.title}</td>
                    <td>{course.lecturer_name || 'Assigned Instructor'}</td>
                    <td>{course.department_name || 'Computer Science'}</td>
                    <td><span className="status-badge-active">ENROLLED</span></td>
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

export default MyCoursesPage;
