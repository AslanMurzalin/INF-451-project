import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import feedbackService from '../services/feedback';
import adminService from '../services/admin';
import { StarIcon } from '../assets/icons';
import './ViewFeedbackPage.css';

export function ViewFeedbackPage() {
  const navigate = useNavigate();
  const { defaultSource } = useTheme();

  const [feedbacks, setFeedbacks] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(defaultSource || 'ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  async function loadFeedbacks() {
    try {
      setLoading(true);
      const [allFeedbacks, allSources] = await Promise.all([
        feedbackService.getFeedbacks(),
        adminService.getFeedbackSources(),
      ]);
      setFeedbacks(allFeedbacks);
      setSources(allSources);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this feedback submission?')) {
      await feedbackService.deleteFeedback(id);
      if (selectedFeedback?.id === id) {
        setSelectedFeedback(null);
      }
      await loadFeedbacks();
    }
  };

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter((item) => {
    const matchesFilter =
      activeFilter === 'ALL' || item.sourceType === activeFilter;

    const query = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      (item.feedback && item.feedback.toLowerCase().includes(query)) ||
      (item.targetTitle && item.targetTitle.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query)) ||
      (item.courseTitle && item.courseTitle.toLowerCase().includes(query));

    return matchesFilter && matchesSearch;
  });

  const getSourceTypeBadge = (type) => {
    switch (type) {
      case 'COURSE_EVALUATION':
        return <span className="source-badge badge-course">COURSE</span>;
      case 'SURVEY':
        return <span className="source-badge badge-survey">SURVEY</span>;
      case 'SERVICE_REVIEW':
        return <span className="source-badge badge-service">SERVICE</span>;
      default:
        return <span className="source-badge badge-custom">{type?.replace(/_/g, ' ')}</span>;
    }
  };

  return (
    <div className="view-feedback-container">
      <div className="view-feedback-subtitle">
        HERE YOU CAN VIEW YOUR FEEDBACK DETAILS (МОИ ОТПРАВЛЕННЫЕ ОТЗЫВЫ)
      </div>

      {/* Control bar: Dynamic Source filter tabs & search */}
      <div className="view-feedback-controls">
        <div className="feedback-filter-tabs">
          <button
            type="button"
            className={`filter-tab-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            ALL ({feedbacks.length})
          </button>
          {sources.map((src) => {
            const count = feedbacks.filter(f => f.sourceType === src.source_type).length;
            return (
              <button
                key={src.source_type}
                type="button"
                className={`filter-tab-btn ${activeFilter === src.source_type ? 'active' : ''}`}
                onClick={() => setActiveFilter(src.source_type)}
              >
                {src.display_name} ({count})
              </button>
            );
          })}
        </div>

        <div className="controls-right-actions">
          <input
            type="text"
            className="feedback-search-input"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="button"
            className="feedback-new-btn"
            onClick={() => navigate('/feedback')}
          >
            + WRITE FEEDBACK
          </button>
        </div>
      </div>

      {loading ? (
        <div className="feedback-table-loading">Loading feedback details...</div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="feedback-table-empty">
          No feedback records found matching your filters.
        </div>
      ) : (
        <div className="feedback-table-wrapper">
          <table className="feedback-data-table">
            <thead>
              <tr>
                <th className="th-id">ID</th>
                <th className="th-type">TYPE</th>
                <th className="th-feedback">FEEDBACK & TARGET</th>
                <th className="th-rating">RATING</th>
                <th className="th-date">DATE</th>
                <th className="th-status">STATUS</th>
                <th className="th-actions">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((item) => {
                const displayTitle = item.targetTitle || item.courseTitle || 'General Feedback';
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedFeedback(item)}
                    className="feedback-clickable-row"
                    title="Click to view details"
                  >
                    <td className="td-id">{item.id}</td>
                    <td className="td-type">
                      {getSourceTypeBadge(item.sourceType)}
                    </td>
                    <td className="td-feedback">
                      <div className="feedback-target-title">{displayTitle}</div>
                      <div className="feedback-content-text">{item.feedback}</div>
                      {item.isAnonymous && (
                        <span className="anonymous-tag">[Submitted Anonymously]</span>
                      )}
                      {item.responseNote && (
                        <div className="official-reply-indicator">
                          ✓ Official Response Added
                        </div>
                      )}
                    </td>
                    <td className="td-rating">
                      <div className="table-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            size={12}
                            filled={star <= (item.rating || 5)}
                            color="#f59e0b"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="td-date">{item.feedbackDate}</td>
                    <td className={`td-status status-${item.status?.toLowerCase()}`}>
                      {item.status}
                    </td>
                    <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="feedback-row-action-btn view-btn"
                        onClick={() => setSelectedFeedback(item)}
                        title="View full details"
                      >
                        VIEW
                      </button>
                      <button
                        type="button"
                        className="feedback-row-action-btn delete-btn"
                        onClick={(e) => handleDelete(item.id, e)}
                        title="Delete feedback"
                      >
                        DEL
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for viewing detailed feedback */}
      {selectedFeedback && (
        <div className="modal-backdrop" onClick={() => setSelectedFeedback(null)}>
          <div className="modal-card feedback-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3 className="modal-title">FEEDBACK SUBMISSION #{selectedFeedback.id}</h3>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setSelectedFeedback(null)}
              >
                ✕
              </button>
            </div>

            <div className="detail-modal-body">
              <table className="detail-info-grid">
                <tbody>
                  <tr>
                    <td className="detail-label">FEEDBACK TYPE :</td>
                    <td className="detail-value">
                      {getSourceTypeBadge(selectedFeedback.sourceType)}
                      <span style={{ marginLeft: 8, fontWeight: 700 }}>
                        {selectedFeedback.sourceDisplayName || selectedFeedback.sourceType?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="detail-label">TARGET :</td>
                    <td className="detail-value font-bold">
                      {selectedFeedback.targetTitle || selectedFeedback.courseTitle || 'General Feedback'}
                    </td>
                  </tr>
                  {selectedFeedback.category && (
                    <tr>
                      <td className="detail-label">CATEGORY :</td>
                      <td className="detail-value">{selectedFeedback.category}</td>
                    </tr>
                  )}
                  {selectedFeedback.semester && (
                    <tr>
                      <td className="detail-label">SEMESTER :</td>
                      <td className="detail-value">{selectedFeedback.semester}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="detail-label">OVERALL RATING :</td>
                    <td className="detail-value">
                      <div className="table-stars" style={{ display: 'inline-flex', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            size={16}
                            filled={star <= (selectedFeedback.rating || 5)}
                            color="#f59e0b"
                          />
                        ))}
                      </div>
                      <span style={{ marginLeft: 8, fontWeight: 700 }}>
                        {selectedFeedback.rating || 5} / 5
                      </span>
                    </td>
                  </tr>
                  {selectedFeedback.criteria && Object.keys(selectedFeedback.criteria).length > 0 && (
                    <tr>
                      <td className="detail-label">CRITERIA SCORES :</td>
                      <td className="detail-value">
                        <div className="criteria-badges-list">
                          {Object.entries(selectedFeedback.criteria).map(([k, v]) => (
                            <span key={k} className="criteria-chip">
                              {k}: <strong>{v}/5</strong>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                  {selectedFeedback.customAnswers && Object.keys(selectedFeedback.customAnswers).length > 0 && (
                    <tr>
                      <td className="detail-label">CUSTOM DETAILS :</td>
                      <td className="detail-value">
                        {Object.entries(selectedFeedback.customAnswers).map(([k, v]) => (
                          <div key={k} style={{ marginBottom: 4 }}>
                            <strong>{k}:</strong> {v}
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="detail-label">SUBMISSION DATE :</td>
                    <td className="detail-value">{selectedFeedback.feedbackDate}</td>
                  </tr>
                  <tr>
                    <td className="detail-label">PRIVACY :</td>
                    <td className="detail-value">
                      {selectedFeedback.isAnonymous
                        ? 'Anonymous Submission (identity hidden)'
                        : 'Verified Student Submission'}
                    </td>
                  </tr>
                  <tr>
                    <td className="detail-label">STATUS :</td>
                    <td className={`detail-value status-${selectedFeedback.status?.toLowerCase()}`}>
                      {selectedFeedback.status}
                    </td>
                  </tr>
                  <tr>
                    <td className="detail-label">COMMENTS :</td>
                    <td className="detail-value feedback-full-text">
                      {selectedFeedback.feedback}
                    </td>
                  </tr>
                  {selectedFeedback.responseNote && (
                    <tr>
                      <td className="detail-label response-note-label">OFFICIAL ADMIN RESPONSE :</td>
                      <td className="detail-value response-note-value">
                        {selectedFeedback.responseNote}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setSelectedFeedback(null)}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewFeedbackPage;
