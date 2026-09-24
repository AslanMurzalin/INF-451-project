import React, { useState, useEffect } from 'react';
import feedbackService from '../services/feedback';
import './ViewFeedbackPage.css';

export function ViewFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeedbacks() {
      try {
        setLoading(true);
        const data = await feedbackService.getFeedbacks();
        setFeedbacks(data);
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeedbacks();
  }, []);

  return (
    <div className="view-feedback-container">
      {/* Subtitle matching Figma */}
      <div className="view-feedback-subtitle">
        HERE YOU CAN VIEW YOUR FEEDBACK DETAILS.
      </div>

      {loading ? (
        <div className="feedback-table-loading">Loading feedback details...</div>
      ) : feedbacks.length === 0 ? (
        <div className="feedback-table-empty">No feedback records found.</div>
      ) : (
        <div className="feedback-table-wrapper">
          <table className="feedback-data-table">
            <thead>
              <tr>
                <th className="th-id">ID</th>
                <th className="th-feedback">FEEDBACK</th>
                <th className="th-date">FEEDBACK DATE</th>
                <th className="th-status">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((item) => (
                <tr key={item.id}>
                  <td className="td-id">{item.id}</td>
                  <td className="td-feedback">
                    <div className="feedback-content-text">{item.feedback}</div>
                    {item.courseTitle && (
                      <div className="feedback-course-subtext">{item.courseTitle}</div>
                    )}
                  </td>
                  <td className="td-date">{item.feedbackDate}</td>
                  <td className={`td-status status-${item.status?.toLowerCase()}`}>
                    {item.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ViewFeedbackPage;
