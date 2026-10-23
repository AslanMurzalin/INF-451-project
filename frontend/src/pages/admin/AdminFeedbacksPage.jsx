import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import feedbackService, { parseFeedbackDate } from '../../services/feedback';
import adminService from '../../services/admin';
import departmentsService from '../../services/departments';
import coursesService from '../../services/courses';
import { StarIcon } from '../../assets/icons';
import './AdminFeedbacksPage.css';

export function AdminFeedbacksPage() {
  const { user } = useAuth();

  const [feedbacks, setFeedbacks] = useState([]);
  const [sources, setSources] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [lecturerFilter, setLecturerFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Date Range Filters State
  const [datePreset, setDatePreset] = useState('ALL');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');

  // Lecturer quick toggle state
  const isLecturer = user?.role === 'lecturer';
  const [myCoursesOnly, setMyCoursesOnly] = useState(false);

  // Review / response modal
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('DONE');
  const [responseNote, setResponseNote] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      const [allFeedbacks, allSources, allDepts, allCoursesData] = await Promise.all([
        feedbackService.getFeedbacks(),
        adminService.getFeedbackSources(),
        departmentsService.getDepartments(),
        coursesService.getCourses(1, 50).catch(() => ({ items: [] })),
      ]);
      setFeedbacks(allFeedbacks);
      setSources(allSources);
      setDepartments(allDepts);
      setCourses(allCoursesData?.items || []);
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

  const handleResetFilters = () => {
    setTypeFilter('ALL');
    setDepartmentFilter('ALL');
    setStatusFilter('ALL');
    setRatingFilter('ALL');
    setLecturerFilter('ALL');
    setDatePreset('ALL');
    setCustomDateFrom('');
    setCustomDateTo('');
    setSearchTerm('');
    setMyCoursesOnly(false);
  };

  // Helper date matching function
  const checkDateMatch = (fbDateStr) => {
    if (datePreset === 'ALL' && !customDateFrom && !customDateTo) return true;
    const itemDate = parseFeedbackDate(fbDateStr);
    if (!itemDate) return true;

    const itemTime = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate(), 12, 0, 0).getTime();

    // Reference point: Oct 22, 2026
    const refNow = new Date(2026, 9, 22, 23, 59, 59, 999).getTime();

    if (datePreset === 'LAST_7_DAYS') {
      const sevenDaysAgo = refNow - 7 * 24 * 60 * 60 * 1000;
      return itemTime >= sevenDaysAgo && itemTime <= refNow;
    }

    if (datePreset === 'LAST_30_DAYS') {
      const thirtyDaysAgo = refNow - 30 * 24 * 60 * 60 * 1000;
      return itemTime >= thirtyDaysAgo && itemTime <= refNow;
    }

    if (datePreset === 'SEMESTER') {
      // Fall 2026 semester: Sep 01, 2026 - Dec 31, 2026
      const semStart = new Date(2026, 8, 1, 0, 0, 0).getTime();
      const semEnd = new Date(2026, 11, 31, 23, 59, 59).getTime();
      return itemTime >= semStart && itemTime <= semEnd;
    }

    if (datePreset === 'CUSTOM' || customDateFrom || customDateTo) {
      if (customDateFrom) {
        const fromD = parseFeedbackDate(customDateFrom);
        if (fromD && itemTime < fromD.setHours(0, 0, 0, 0)) return false;
      }
      if (customDateTo) {
        const toD = parseFeedbackDate(customDateTo);
        if (toD && itemTime > toD.setHours(23, 59, 59, 999)) return false;
      }
      return true;
    }

    return true;
  };

  // Unique lecturers extracted from feedbacks and courses
  const uniqueLecturers = useMemo(() => {
    const set = new Set();
    feedbacks.forEach(f => {
      if (f.lecturerName) set.add(f.lecturerName);
    });
    courses.forEach(c => {
      if (c.lecturer_name) set.add(c.lecturer_name);
    });
    return Array.from(set).filter(Boolean);
  }, [feedbacks, courses]);

  // Lecturer courses count
  const myCoursesCount = useMemo(() => {
    if (!isLecturer || !user) return 0;
    const lecturerName = user.fullName || '';
    return feedbacks.filter(f =>
      (f.lecturerName && f.lecturerName.toLowerCase().includes(lecturerName.toLowerCase())) ||
      (f.targetTitle && f.targetTitle.includes('INF451')) ||
      (f.targetTitle && f.targetTitle.includes('CS302'))
    ).length;
  }, [feedbacks, isLecturer, user]);

  // Filtered feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((fb) => {
      // 1. Lecturer 'My Courses Only' Filter
      if (myCoursesOnly && user) {
        const myName = (user.fullName || '').toLowerCase();
        const matchesMyCourse =
          (fb.lecturerName && fb.lecturerName.toLowerCase().includes(myName)) ||
          (fb.targetTitle && fb.targetTitle.includes('INF451')) ||
          (fb.targetTitle && fb.targetTitle.includes('CS302'));
        if (!matchesMyCourse) return false;
      }

      // 2. Type Filter
      if (typeFilter !== 'ALL' && fb.sourceType !== typeFilter) {
        return false;
      }

      // 3. Department Filter
      if (departmentFilter !== 'ALL') {
        const fbDept = (fb.department || '').toLowerCase();
        const targetDept = departmentFilter.toLowerCase();
        if (!fbDept.includes(targetDept) && !targetDept.includes(fbDept)) {
          return false;
        }
      }

      // 4. Status Filter
      if (statusFilter !== 'ALL' && fb.status !== statusFilter) {
        return false;
      }

      // 5. Rating Filter
      if (ratingFilter !== 'ALL') {
        const r = fb.rating || 5;
        if (ratingFilter === '5' && r !== 5) return false;
        if (ratingFilter === '4_PLUS' && r < 4) return false;
        if (ratingFilter === '3_MINUS' && r > 3) return false;
      }

      // 6. Lecturer Filter
      if (lecturerFilter !== 'ALL') {
        if (!fb.lecturerName || fb.lecturerName !== lecturerFilter) {
          return false;
        }
      }

      // 7. Date Range Filter
      if (!checkDateMatch(fb.feedbackDate)) {
        return false;
      }

      // 8. Keyword Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchSearch =
          (fb.feedback && fb.feedback.toLowerCase().includes(q)) ||
          (fb.targetTitle && fb.targetTitle.toLowerCase().includes(q)) ||
          (fb.department && fb.department.toLowerCase().includes(q)) ||
          (fb.lecturerName && fb.lecturerName.toLowerCase().includes(q)) ||
          (fb.studentName && fb.studentName.toLowerCase().includes(q)) ||
          (fb.studentEmail && fb.studentEmail.toLowerCase().includes(q)) ||
          (fb.responseNote && fb.responseNote.toLowerCase().includes(q)) ||
          (fb.category && fb.category.toLowerCase().includes(q));
        if (!matchSearch) return false;
      }

      return true;
    });
  }, [
    feedbacks,
    myCoursesOnly,
    user,
    typeFilter,
    departmentFilter,
    statusFilter,
    ratingFilter,
    lecturerFilter,
    datePreset,
    customDateFrom,
    customDateTo,
    searchTerm,
  ]);

  const isAnyFilterActive =
    typeFilter !== 'ALL' ||
    departmentFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    ratingFilter !== 'ALL' ||
    lecturerFilter !== 'ALL' ||
    datePreset !== 'ALL' ||
    customDateFrom !== '' ||
    customDateTo !== '' ||
    searchTerm !== '' ||
    myCoursesOnly;

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

      {/* Lecturer Context Banner */}
      {isLecturer && (
        <div className="lecturer-context-banner">
          <div className="lecturer-banner-info">
            <span className="lecturer-badge">LECTURER VIEW</span>
            <span className="lecturer-welcome">
              Welcome, <strong>{user?.fullName || 'Lecturer'}</strong> ({user?.email})
            </span>
            <span className="lecturer-stats">
              • <strong>{myCoursesCount}</strong> student evaluation(s) submitted for your courses
            </span>
          </div>
          <div className="lecturer-banner-actions">
            <button
              type="button"
              className={`lecturer-toggle-btn ${myCoursesOnly ? 'active' : ''}`}
              onClick={() => setMyCoursesOnly(!myCoursesOnly)}
            >
              {myCoursesOnly ? '✓ SHOWING MY COURSES ONLY' : 'FILTER MY COURSES ONLY'}
            </button>
          </div>
        </div>
      )}

      {/* Primary Filtering Toolbar */}
      <div className="admin-feedbacks-toolbar">
        {/* Source Type Filter */}
        <div className="toolbar-group">
          <label htmlFor="admin-type-filter">FEEDBACK TYPE :</label>
          <select
            id="admin-type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">ALL TYPES ({feedbacks.length})</option>
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

        {/* Department Filter */}
        <div className="toolbar-group">
          <label htmlFor="admin-dept-filter">DEPARTMENT :</label>
          <select
            id="admin-dept-filter"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">ALL DEPARTMENTS</option>
            {departments.map((dept) => {
              const count = feedbacks.filter((f) =>
                (f.department || '').toLowerCase().includes(dept.name.toLowerCase())
              ).length;
              return (
                <option key={dept.department_id || dept.name} value={dept.name}>
                  {dept.name} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Date Range Preset Filter */}
        <div className="toolbar-group">
          <label htmlFor="admin-date-preset">DATE RANGE :</label>
          <select
            id="admin-date-preset"
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">ALL DATES</option>
            <option value="LAST_7_DAYS">LAST 7 DAYS</option>
            <option value="LAST_30_DAYS">LAST 30 DAYS</option>
            <option value="SEMESTER">FALL 2026 SEMESTER</option>
            <option value="CUSTOM">CUSTOM DATE RANGE...</option>
          </select>
        </div>

        {/* Lecturer Filter */}
        <div className="toolbar-group">
          <label htmlFor="admin-lecturer-filter">LECTURER :</label>
          <select
            id="admin-lecturer-filter"
            value={lecturerFilter}
            onChange={(e) => setLecturerFilter(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">ALL LECTURERS</option>
            {uniqueLecturers.map((lec) => {
              const count = feedbacks.filter((f) => f.lecturerName === lec).length;
              return (
                <option key={lec} value={lec}>
                  {lec} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Status Filter */}
        <div className="toolbar-group">
          <label htmlFor="admin-status-filter">STATUS :</label>
          <select
            id="admin-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="SENT">SENT / NEW</option>
            <option value="IN_REVIEW">IN REVIEW</option>
            <option value="DONE">DONE / RESOLVED</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div className="toolbar-group">
          <label htmlFor="admin-rating-filter">RATING :</label>
          <select
            id="admin-rating-filter"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">ALL RATINGS</option>
            <option value="5">★ 5 Stars Only</option>
            <option value="4_PLUS">★ 4 Stars & Above</option>
            <option value="3_MINUS">★ 3 Stars or Below</option>
          </select>
        </div>

        {/* Search */}
        <div className="toolbar-search-group">
          <input
            type="text"
            placeholder="Search student, course, text, dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>
      </div>

      {/* Custom Date Pickers Row (visible when CUSTOM selected) */}
      {datePreset === 'CUSTOM' && (
        <div className="custom-date-toolbar-row">
          <div className="custom-date-group">
            <label htmlFor="custom-date-from">FROM DATE :</label>
            <input
              type="date"
              id="custom-date-from"
              value={customDateFrom}
              onChange={(e) => setCustomDateFrom(e.target.value)}
              className="admin-date-input"
            />
          </div>
          <div className="custom-date-group">
            <label htmlFor="custom-date-to">TO DATE :</label>
            <input
              type="date"
              id="custom-date-to"
              value={customDateTo}
              onChange={(e) => setCustomDateTo(e.target.value)}
              className="admin-date-input"
            />
          </div>
          {(customDateFrom || customDateTo) && (
            <button
              type="button"
              className="clear-dates-btn"
              onClick={() => {
                setCustomDateFrom('');
                setCustomDateTo('');
              }}
            >
              CLEAR DATES
            </button>
          )}
        </div>
      )}

      {/* Active Filter Summary and Reset Bar */}
      <div className="filter-summary-bar">
        <div className="filter-count-badge">
          SHOWING <strong>{filteredFeedbacks.length}</strong> OF <strong>{feedbacks.length}</strong> FEEDBACK SUBMISSIONS
        </div>

        {isAnyFilterActive && (
          <button
            type="button"
            className="reset-filters-btn"
            onClick={handleResetFilters}
            title="Reset all filters back to default"
          >
            ✕ RESET ALL FILTERS
          </button>
        )}
      </div>

      {/* Main Feedback Data Table */}
      {loading ? (
        <div className="admin-loading-box">Loading student feedback submissions...</div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="admin-empty-box">
          <p>No feedback submissions found matching current filters.</p>
          {isAnyFilterActive && (
            <button
              type="button"
              className="empty-reset-btn"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="admin-feedbacks-table-wrapper">
          <table className="admin-feedbacks-data-table">
            <thead>
              <tr>
                <th className="th-id">ID</th>
                <th className="th-type">TYPE</th>
                <th className="th-target">TARGET ENTITY & DEPARTMENT</th>
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
                  title="Click to view full details and respond"
                >
                  <td className="td-id">{item.id}</td>
                  <td className="td-type">{getSourceBadge(item.sourceType)}</td>
                  <td className="td-target">
                    <div className="target-name">{item.targetTitle || 'General Feedback'}</div>
                    {item.department && (
                      <div className="target-dept-tag">
                        [{item.department}]
                      </div>
                    )}
                    {item.lecturerName && (
                      <div className="target-lecturer-tag">
                        Instructor: <strong>{item.lecturerName}</strong>
                      </div>
                    )}
                    {item.category && <div className="target-sub">Category: {item.category}</div>}
                  </td>
                  <td className="td-student">
                    {item.isAnonymous ? (
                      <span className="anon-label">Anonymous Student</span>
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
                      <div className="has-response-badge">✓ Official Response Added</div>
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
                      title="Review feedback and post official response"
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
                ADMIN / LECTURER REVIEW FOR FEEDBACK #{selectedFeedback.id}
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
                        {selectedFeedback.sourceDisplayName || selectedFeedback.sourceType}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="rev-label">TARGET ENTITY :</td>
                    <td className="rev-value font-bold">{selectedFeedback.targetTitle}</td>
                  </tr>
                  {selectedFeedback.department && (
                    <tr>
                      <td className="rev-label">DEPARTMENT :</td>
                      <td className="rev-value">
                        <span className="modal-dept-chip">{selectedFeedback.department}</span>
                      </td>
                    </tr>
                  )}
                  {selectedFeedback.lecturerName && (
                    <tr>
                      <td className="rev-label">ASSIGNED INSTRUCTOR :</td>
                      <td className="rev-value font-bold">{selectedFeedback.lecturerName}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="rev-label">SUBMITTED BY :</td>
                    <td className="rev-value">
                      {selectedFeedback.isAnonymous
                        ? 'Anonymous Student (Identity protected)'
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
                    <td className="rev-label">SUBMISSION DATE :</td>
                    <td className="rev-value">{selectedFeedback.feedbackDate}</td>
                  </tr>
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
                  <label htmlFor="modal-response-text">OFFICIAL ADMINISTRATIVE / INSTRUCTOR RESPONSE :</label>
                  <textarea
                    id="modal-response-text"
                    rows="3"
                    value={responseNote}
                    onChange={(e) => setResponseNote(e.target.value)}
                    placeholder="Enter an official note or action summary (this will be visible to students in their feedback view)..."
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
