import React, { useState, useEffect } from 'react';
import feedbackService from '../../services/feedback';
import adminService from '../../services/admin';
import { StarIcon } from '../../assets/icons';
import './AdminFeedbacksPage.css';

export function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected feedback for review / response modal
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('DONE');
  const [responseNote, setResponseNote] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      const [allFeedbacks, allSources] = await Promise.all([
        feedbackService.getFeedbacks(),
        adminService.getFeedbackSources(),
      ]);
      setFeedbacks(allFeedbacks);
      setSources(allSources);
    } catch (err) {
      console.error('Failed to load admin feedbacks:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenReviewModal = (fb) => {
    setSelectedFeedback(fb);
    setReviewStatus(fb.status || 'DONE');
    setResponseNote(fb.responseNote || '');
    setReviewSuccess('');
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;

    try {
      setSavingReview(true);
      await feedbackService.updateFeedbackStatus(
        selectedFeedback.id,
        reviewStatus,
        responseNote.trim()
      );
      setReviewSuccess('Feedback status and official response saved successfully!');
      await loadData();
      setTimeout(() => {
        setSelectedFeedback(null);
      }, 900);
    } catch (err) {
      console.error('Failed to save review:', err);
    } finally {
      setSavingReview(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete feedback submission #${id}?`)) {
      await feedbackService.deleteFeedback(id);
      if (selectedFeedback?.id === id) {
        setSelectedFeedback(null);
      }
      await loadData();
    }
  };

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesType = typeFilter === 'ALL' || fb.sourceType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || fb.status === statusFilter;

    const query = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      (fb.feedback && fb.feedback.toLowerCase().includes(query)) ||
      (fb.targetTitle && fb.targetTitle.toLowerCase().includes(query)) ||
      (fb.studentName && fb.studentName.toLowerCase().includes(query)) ||
      (fb.studentEmail && fb.studentEmail.toLowerCase().includes(query));

    return matchesType && matchesStatus && matchesSearch;
  });

  const getSourceBadge = (type) => {
    switch (type) {
      case 'COURSE_EVALUATION':
        return <span className="admin-src-badge badge-course">COURSE</span>;
      case 'SURVEY':
        return <span className="admin-src-badge badge-survey">SURVEY</span>;
      case 'SERVICE_REVIEW':
        return <span className="admin-src-badge badge-service">SERVICE</span>;
      default:
        return <span className="admin-src-badge badge-custom">{type?.replace(/_/g, ' ')}</span>;
    }
  };

  return (
    <div className="admin-feedbacks-container">
      <div className="admin-feedbacks-subtitle">
        STUDENT FEEDBACK & SUBMISSIONS REPOSITORY (УПРАВЛЕНИЕ И МОДЕРАЦИЯ ОТЗЫВОВ)
      </div>

      {/* Filter and Controls Toolbar */}
      <div className="admin-feedbacks-toolbar">
        {/* Source Type Filter */}
        <div className="toolbar-group">
          <label htmlFor="admin-type-filter">FEEDBACK TYPE:</label>
          <select
            id="admin-type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">ALL FEEDBACK TYPES ({feedbacks.length})</option>
            {sources.map((s) => {
              const count = feedbacks.filter((f) => f.sourceType === s.source_type).length;
              return (
                <option key={s.source_type} value={s.source_type}>
                  {s.display_name} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Status Filter */}
        <div className="toolbar-group">
          <label htmlFor="admin-status-filter">STATUS:</label>
          <select
            id="admin-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">ALL STATUSES ({feedbacks.length})</option>
            <option value="SENT">SENT / NEW ({feedbacks.filter(f => f.status === 'SENT').length})</option>
            <option value="IN_REVIEW">IN REVIEW ({feedbacks.filter(f => f.status === 'IN_REVIEW').length})</option>
            <option value="DONE">DONE / RESOLVED ({feedbacks.filter(f => f.status === 'DONE' || f.status === 'RESOLVED').length})</option>
          </select>
        </div>

        {/* Search */}
        <div className="toolbar-search-group">
          <input
            type="text"
            placeholder="Search student, target, keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-box">Loading submissions...</div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="admin-empty-box">No feedback submissions found matching current filters.</div>
      ) : (
        <div className="admin-feedbacks-table-wrapper">
          <table className="admin-feedbacks-data-table">
            <thead>
              <tr>
                <th className="th-id">ID</th>
                <th className="th-type">TYPE</th>
                <th className="th-target">TARGET ENTITY</th>
                <th className="th-student">STUDENT</th>
                <th className="th-rating">RATING</th>
                <th className="th-feedback">FEEDBACK PREVIEW</th>
                <th className="th-date">DATE</th>
                <th className="th-status">STATUS</th>
                <th className="th-actions">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleOpenReviewModal(item)}
                  className="admin-clickable-row"
                  title="Click to review / respond"
                >
                  <td className="td-id">{item.id}</td>
                  <td className="td-type">{getSourceBadge(item.sourceType)}</td>
                  <td className="td-target">
                    <div className="target-name">{item.targetTitle || 'General'}</div>
                    {item.category && <div className="target-sub">[{item.category}]</div>}
                  </td>
                  <td className="td-student">
                    {item.isAnonymous ? (
                      <span className="anon-label">Anonymous</span>
                    ) : (
                      <div>
                        <div className="student-name">{item.studentName}</div>
                        {item.studentEmail && <div className="student-email">{item.studentEmail}</div>}
                      </div>
                    )}
                  </td>
                  <td className="td-rating">
                    <div className="rating-stars-row">
                      <StarIcon size={12} filled={true} color="#f59e0b" />
                      <span className="rating-val">{item.rating || 5}/5</span>
                    </div>
                  </td>
                  <td className="td-feedback">
                    <div className="feedback-snippet">{item.feedback}</div>
                    {item.responseNote && (
                      <div className="has-response-badge">✓ Responded</div>
                    )}
                  </td>
                  <td className="td-date">{item.feedbackDate}</td>
                  <td className={`td-status status-${item.status?.toLowerCase()}`}>
                    {item.status}
                  </td>
                  <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="admin-action-btn review-btn"
                      onClick={() => handleOpenReviewModal(item)}
                      title="Review and Respond"
                    >
                      REVIEW
                    </button>
                    <button
                      type="button"
                      className="admin-action-btn del-btn"
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Delete entry"
                    >
                      DEL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review & Official Response Modal */}
      {selectedFeedback && (
        <div className="modal-backdrop" onClick={() => setSelectedFeedback(null)}>
          <div className="modal-card admin-review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3 className="modal-title">
                ADMIN REVIEW FOR FEEDBACK #{selectedFeedback.id}
              </h3>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setSelectedFeedback(null)}
              >
                ✕
              </button>
            </div>

            {reviewSuccess && (
              <div className="modal-alert alert-success">{reviewSuccess}</div>
            )}

            <div className="review-modal-content">
              <table className="review-info-grid">
                <tbody>
                  <tr>
                    <td className="rev-label">FEEDBACK TYPE :</td>
                    <td className="rev-value">
                      {getSourceBadge(selectedFeedback.sourceType)}
                      <span style={{ marginLeft: 8, fontWeight: 700 }}>
                        {selectedFeedback.sourceType}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="rev-label">TARGET ENTITY :</td>
                    <td className="rev-value font-bold">{selectedFeedback.targetTitle}</td>
                  </tr>
                  <tr>
                    <td className="rev-label">SUBMITTED BY :</td>
                    <td className="rev-value">
                      {selectedFeedback.isAnonymous
                        ? 'Anonymous Student (Privacy protected)'
                        : `${selectedFeedback.studentName || 'Student'} (${selectedFeedback.studentEmail || 'verified'})`}
                    </td>
                  </tr>
                  <tr>
                    <td className="rev-label">OVERALL RATING :</td>
                    <td className="rev-value">
                      <div style={{ display: 'inline-flex', gap: 2, verticalAlign: 'middle', marginRight: 6 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            size={15}
                            filled={star <= (selectedFeedback.rating || 5)}
                            color="#f59e0b"
                          />
                        ))}
                      </div>
                      <strong>{selectedFeedback.rating || 5} / 5</strong>
                    </td>
                  </tr>
                  {selectedFeedback.criteria && Object.keys(selectedFeedback.criteria).length > 0 && (
                    <tr>
                      <td className="rev-label">CRITERIA BREAKDOWN :</td>
                      <td className="rev-value">
                        <div className="criteria-list">
                          {Object.entries(selectedFeedback.criteria).map(([cName, score]) => (
                            <span key={cName} className="crit-chip">
                              {cName}: <strong>{score}/5</strong>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                  {selectedFeedback.customAnswers && Object.keys(selectedFeedback.customAnswers).length > 0 && (
                    <tr>
                      <td className="rev-label">CUSTOM FIELD ANSWERS :</td>
                      <td className="rev-value">
                        {Object.entries(selectedFeedback.customAnswers).map(([k, v]) => (
                          <div key={k} className="custom-answer-row">
                            <span className="ca-key">{k}:</span> <span className="ca-val">{v}</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="rev-label">STUDENT FEEDBACK :</td>
                    <td className="rev-value student-comments-box">
                      {selectedFeedback.feedback}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Action Form: Status & Administrative Response */}
              <form onSubmit={handleSaveReview} className="admin-review-form">
                <div className="review-form-row">
                  <label htmlFor="modal-status-select">UPDATE STATUS :</label>
                  <select
                    id="modal-status-select"
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="modal-select"
                  >
                    <option value="SENT">SENT (Pending Review)</option>
                    <option value="IN_REVIEW">IN_REVIEW (Under Investigation)</option>
                    <option value="DONE">DONE / RESOLVED (Action Taken)</option>
                  </select>
                </div>

                <div className="review-form-row">
                  <label htmlFor="modal-response-text">OFFICIAL ADMINISTRATIVE RESPONSE :</label>
                  <textarea
                    id="modal-response-text"
                    rows="3"
                    value={responseNote}
                    onChange={(e) => setResponseNote(e.target.value)}
                    placeholder="Enter an official note or action summary (this will be visible to the student)..."
                    className="modal-textarea"
                  />
                </div>

                <div className="modal-footer-actions">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setSelectedFeedback(null)}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="modal-save-btn"
                    disabled={savingReview}
                  >
                    {savingReview ? 'SAVING...' : 'SAVE & RESOLVE'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFeedbacksPage;
