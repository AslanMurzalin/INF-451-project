import React, { useState, useEffect } from 'react';
import feedbackService from '../services/feedback';
import { StarIcon } from '../assets/icons';
import './CourseSummaryModal.css';

export function CourseSummaryModal({ course, onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadSummary() {
      if (!course?.course_id) return;
      try {
        setLoading(true);
        setError('');
        const data = await feedbackService.getCourseSummary(course.course_id);
        if (isMounted) {
          setSummary(data);
        }
      } catch (err) {
        if (isMounted) {
          const detail = err.response?.data?.detail || err.message;
          if (detail && detail.includes('Not enough feedback to summarize')) {
            setError('Not enough feedback to summarize');
          } else {
            setError(detail || 'Failed to generate AI course summary.');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSummary();
    return () => {
      isMounted = false;
    };
  }, [course]);

  return (
    <div className="summary-modal-overlay" onClick={onClose}>
      <div className="summary-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="summary-modal-header">
          <div className="summary-header-info">
            <div className="ai-badge-pill">
              <span className="sparkle">✨</span> AI-GENERATED SUMMARY (US5.2)
            </div>
            <h2>{course?.title || 'Course Summary'}</h2>
            <div className="summary-meta-line">
              {course?.department_name && <span>Dept: {course.department_name}</span>}
              {course?.lecturer_name && <span>• Lecturer: {course.lecturer_name}</span>}
            </div>
          </div>
          <button className="summary-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="summary-modal-body">
          {loading ? (
            <div className="summary-loading-container">
              <div className="ai-pulse-spinner"></div>
              <h3>Analyzing Course Feedback with AI...</h3>
              <p className="loading-progress-msg">
                Evaluating student sentiments, extracting key themes, and synthesizing positive points and problem areas.
              </p>
            </div>
          ) : error ? (
            <div className="summary-empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>{error}</h3>
              <p>
                {error.includes('Not enough feedback to summarize')
                  ? 'There are currently no student feedback submissions for this course. AI summaries will be available once student evaluations are submitted.'
                  : 'An error occurred while generating the AI summary.'}
              </p>
            </div>
          ) : summary ? (
            <div className="summary-results-container">
              {/* Quick Metrics Bar */}
              <div className="summary-stats-bar">
                <div className="stat-item">
                  <span className="stat-label">TOTAL FEEDBACKS</span>
                  <span className="stat-val">{summary.total_feedbacks}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">AVERAGE RATING</span>
                  <span className="stat-val rating-val">
                    <StarIcon size={16} filled={true} color="#f59e0b" />
                    {summary.average_rating ? `${summary.average_rating} / 5.0` : 'N/A'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">SENTIMENT MIX</span>
                  <span className="stat-val pill-mix">
                    <span className="pos">+{summary.positive_count} Pos</span>
                    <span className="neu">~{summary.neutral_count} Neu</span>
                    <span className="neg">-{summary.negative_count} Neg</span>
                  </span>
                </div>
              </div>

              {/* Executive Overview Gist */}
              <div className="summary-overview-box">
                <div className="overview-title">OVERVIEW & EXECUTIVE GIST</div>
                <p className="overview-text">{summary.overview}</p>
              </div>

              {/* Two-Column Findings */}
              <div className="findings-two-col">
                {/* Positive Points */}
                <div className="finding-col col-positive">
                  <div className="col-header">
                    <span className="col-icon">✅</span>
                    <h4>MAIN POSITIVE POINTS</h4>
                  </div>
                  <ul className="finding-list">
                    {summary.positive_points?.map((pt, idx) => (
                      <li key={idx} className="finding-item positive">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Problem Areas */}
                <div className="finding-col col-negative">
                  <div className="col-header">
                    <span className="col-icon">⚠️</span>
                    <h4>MAIN PROBLEMS & ACTION AREAS</h4>
                  </div>
                  <ul className="finding-list">
                    {summary.negative_points?.map((pt, idx) => (
                      <li key={idx} className="finding-item negative">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer AI Disclaimer */}
              <div className="ai-watermark-footer">
                <span>🤖 Generated by AI NLP Summarizer based strictly on verified course feedback.</span>
                <span>Timestamp: {new Date(summary.generated_at).toLocaleString()}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="summary-modal-footer">
          <button className="summary-done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseSummaryModal;
