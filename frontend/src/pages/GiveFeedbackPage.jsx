import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import coursesService from '../services/courses';
import feedbackService from '../services/feedback';
import './GiveFeedbackPage.css';

export function GiveFeedbackPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await coursesService.getCourses(1, 50);
        const courseList = res?.items || [];
        setCourses(courseList);
        if (courseList.length > 0) {
          setSelectedCourseId(courseList[0].course_id);
        }
      } catch (err) {
        console.warn('Could not fetch backend courses, fallback to default course list:', err);
        const fallbackCourses = [
          { course_id: 1, title: 'INF451 - Advanced Software Architecture' },
          { course_id: 2, title: 'CS302 - Operating Systems & Distributed Architecture' },
          { course_id: 3, title: 'AI401 - Deep Learning & Natural Language Understanding' },
        ];
        setCourses(fallbackCourses);
        setSelectedCourseId(fallbackCourses[0].course_id);
      }
    }
    loadCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!feedbackText.trim()) {
      setErrorMessage('Please enter your feedback text.');
      return;
    }

    const currentCourse = courses.find((c) => String(c.course_id) === String(selectedCourseId));

    try {
      setSubmitting(true);
      await feedbackService.submitFeedback({
        courseId: selectedCourseId,
        courseTitle: currentCourse ? currentCourse.title : 'General Course',
        text: feedbackText.trim(),
      });

      setSuccessMessage('Feedback sent successfully!');
      setFeedbackText('');
      
      // Navigate to View Feedback after brief delay
      setTimeout(() => {
        navigate('/feedback/view');
      }, 1200);
    } catch (err) {
      console.error('Submit feedback failed:', err);
      setErrorMessage('Failed to send feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="give-feedback-container">
      {/* Subtitle matching Figma */}
      <div className="give-feedback-subtitle">
        HERE YOU CAN WRITE FEEDBACK ONLINE.
      </div>

      {successMessage && (
        <div className="feedback-alert feedback-alert-success">
          {successMessage} Redirecting to feedback list...
        </div>
      )}

      {errorMessage && (
        <div className="feedback-alert feedback-alert-error">
          {errorMessage}
        </div>
      )}

      <form className="give-feedback-form" onSubmit={handleSubmit}>
        {/* Bordered 2-column box */}
        <div className="feedback-form-box">
          <div className="feedback-form-row course-row">
            <div className="feedback-label-cell">
              <label htmlFor="course-select">SELECT COURSE :</label>
            </div>
            <div className="feedback-input-cell">
              <select
                id="course-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="feedback-select"
                required
              >
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="feedback-form-row text-row">
            <div className="feedback-label-cell">
              <label htmlFor="feedback-text">TEXT HERE :</label>
            </div>
            <div className="feedback-input-cell">
              <textarea
                id="feedback-text"
                rows="14"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="feedback-textarea"
                placeholder="Write your feedback..."
                required
              />
            </div>
          </div>
        </div>

        {/* SEND button bottom left */}
        <div className="feedback-submit-row">
          <button
            type="submit"
            className="feedback-send-btn"
            disabled={submitting}
          >
            {submitting ? 'SENDING...' : 'SEND'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default GiveFeedbackPage;
