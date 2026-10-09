import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import coursesService from '../services/courses';
import feedbackService from '../services/feedback';
import './MyCoursesPage.css';

export function MyCoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [evaluatedCourseIds, setEvaluatedCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [courseData, feedbacks] = await Promise.all([
          coursesService.getCourses(1, 20),
          feedbackService.getFeedbacks('COURSE_EVALUATION'),
        ]);

        const items = courseData?.items || [];
        setCourses(items);

        const evaluated = new Set();
        feedbacks.forEach(f => {
          if (f.targetId) evaluated.add(Number(f.targetId));
        });
        setEvaluatedCourseIds(evaluated);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses from backend. Showing available information.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleEvaluate = (course) => {
    navigate(`/feedback?type=course&courseId=${course.course_id}`);
  };

  return (
    <div className="courses-page-container">
      {/* Student Profile Card - structured grid matching Figma */}
      <div className="student-profile-table-wrapper">
        <table className="student-info-grid">
          <tbody>
            <tr>
              <td className="info-label">STUDENT [No.] :</td>
              <td className="info-value">
                {user?.userId ? `SIS-2026-${String(user.userId).padStart(4, '0')}` : 'SIS-2026-0042'}
              </td>
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
          <h2>ENROLLED COURSES & END-OF-SEMESTER EVALUATIONS</h2>
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
                  <th>ENROLLMENT</th>
                  <th>EVALUATION</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => {
                  const isEvaluated = evaluatedCourseIds.has(Number(course.course_id));
                  return (
                    <tr key={course.course_id}>
                      <td className="course-title-cell">{course.title}</td>
                      <td>{course.lecturer_name || 'Assigned Instructor'}</td>
                      <td>{course.department_name || 'Computer Science'}</td>
                      <td><span className="status-badge-active">ENROLLED</span></td>
                      <td>
                        {isEvaluated ? (
                          <span className="evaluation-done-tag">
                            ✓ EVALUATED
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="course-eval-btn"
                            onClick={() => handleEvaluate(course)}
                            title="Submit Course Evaluation"
                          >
                            EVALUATE
                          </button>
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
    </div>
  );
}

export default MyCoursesPage;
