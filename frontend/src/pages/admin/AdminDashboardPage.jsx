import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/admin';
import feedbackService from '../../services/feedback';
import { StarIcon } from '../../assets/icons';
import './AdminDashboardPage.css';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sum, feedbacks] = await Promise.all([
          adminService.getDashboardSummary(),
          feedbackService.getFeedbacks(),
        ]);
        setSummary(sum);
        setRecentFeedbacks(feedbacks.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-content-wrapper">
        <div className="dashboard-overview-label">
          SYSTEM OVERVIEW & MANAGEMENT CONTROL (ГЛАВНАЯ ПАНЕЛЬ АДМИНИСТРАТОРА)
        </div>

        {loading ? (
          <div className="dashboard-loading">Loading overview metrics...</div>
        ) : (
          <>
            {/* Quick Action Shortcut Cards */}
            <div className="admin-shortcut-cards-grid">
              <div
                className="shortcut-card primary-card"
                onClick={() => navigate('/admin/feedbacks')}
              >
                <div className="card-top">
                  <span className="card-tag">SUBMISSIONS</span>
                  <span className="card-count">{summary?.total_feedbacks || 0}</span>
                </div>
                <h4 className="card-title">STUDENT FEEDBACKS</h4>
                <p className="card-desc">
                  {summary?.pending_feedbacks || 0} pending review • {summary?.resolved_feedbacks || 0} resolved
                </p>
                <span className="card-link-text">MANAGE SUBMISSIONS →</span>
              </div>

              <div
                className="shortcut-card"
                onClick={() => navigate('/admin/surveys-results')}
              >
                <div className="card-top">
                  <span className="card-tag">ANALYTICS</span>
                  <span className="card-count">{summary?.active_surveys || 4}</span>
                </div>
                <h4 className="card-title">SURVEY RESULTS</h4>
                <p className="card-desc">
                  Institutional surveys satisfaction metrics and student responses
                </p>
                <span className="card-link-text">VIEW SURVEY RESULTS →</span>
              </div>

              <div
                className="shortcut-card"
                onClick={() => navigate('/admin/sources')}
              >
                <div className="card-top">
                  <span className="card-tag">SCHEMA</span>
                  <span className="card-count">{summary?.total_sources || 4}</span>
                </div>
                <h4 className="card-title">FEEDBACK SOURCES</h4>
                <p className="card-desc">
                  Configure custom criteria, rating questions, and dynamic fields
                </p>
                <span className="card-link-text">CONFIGURE SOURCES →</span>
              </div>

              <div
                className="shortcut-card"
                onClick={() => navigate('/admin/courses-services')}
              >
                <div className="card-top">
                  <span className="card-tag">TARGETS</span>
                  <span className="card-count">{(summary?.total_courses || 12) + (summary?.total_services || 6)}</span>
                </div>
                <h4 className="card-title">COURSES & SERVICES</h4>
                <p className="card-desc">
                  Academic courses and campus facilities catalog linkage
                </p>
                <span className="card-link-text">VIEW LINKAGES →</span>
              </div>
            </div>

            {/* Metrics Breakdown Table */}
            <div className="dashboard-metrics-section">
              <h3 className="section-title">DETAILED METRIC TOTALS</h3>
              <div className="dashboard-table-wrapper">
                <table className="dashboard-metrics-table">
                  <thead>
                    <tr>
                      <th className="th-card">METRIC CATEGORY</th>
                      <th className="th-number">RECORD COUNT</th>
                      <th className="th-action">QUICK ACCESS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="td-card">TOTAL STUDENT FEEDBACK SUBMISSIONS</td>
                      <td className="td-number font-bold">{summary?.total_feedbacks || 0}</td>
                      <td>
                        <button
                          type="button"
                          className="table-link-btn"
                          onClick={() => navigate('/admin/feedbacks')}
                        >
                          OPEN →
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="td-card">PENDING FEEDBACK REVIEWS</td>
                      <td className="td-number pending-num font-bold">{summary?.pending_feedbacks || 0}</td>
                      <td>
                        <button
                          type="button"
                          className="table-link-btn"
                          onClick={() => navigate('/admin/feedbacks')}
                        >
                          REVIEW →
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="td-card">ACTIVE INSTITUTIONAL SURVEYS</td>
                      <td className="td-number">{summary?.active_surveys || 4}</td>
                      <td>
                        <button
                          type="button"
                          className="table-link-btn"
                          onClick={() => navigate('/admin/surveys-results')}
                        >
                          RESULTS →
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="td-card">CONFIGURED FEEDBACK SOURCES (SCHEMAS)</td>
                      <td className="td-number">{summary?.total_sources || 4}</td>
                      <td>
                        <button
                          type="button"
                          className="table-link-btn"
                          onClick={() => navigate('/admin/sources')}
                        >
                          EDIT →
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="td-card">COURSES CONFIGURED FOR EVALUATION</td>
                      <td className="td-number">{summary?.total_courses || 12}</td>
                      <td>
                        <button
                          type="button"
                          className="table-link-btn"
                          onClick={() => navigate('/admin/courses-services')}
                        >
                          VIEW →
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="td-card">CAMPUS SERVICES MONITORED</td>
                      <td className="td-number">{summary?.total_services || 6}</td>
                      <td>
                        <button
                          type="button"
                          className="table-link-btn"
                          onClick={() => navigate('/admin/courses-services')}
                        >
                          VIEW →
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Submissions Feed */}
            <div className="recent-feedbacks-section">
              <div className="section-head-row">
                <h3 className="section-title">RECENT STUDENT FEEDBACK ACTIVITY</h3>
                <button
                  type="button"
                  className="view-all-btn"
                  onClick={() => navigate('/admin/feedbacks')}
                >
                  VIEW ALL SUBMISSIONS ({summary?.total_feedbacks || 0}) →
                </button>
              </div>

              <div className="recent-table-wrapper">
                <table className="recent-data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>TYPE</th>
                      <th>TARGET</th>
                      <th>RATING</th>
                      <th>STUDENT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentFeedbacks.map((item) => (
                      <tr
                        key={item.id}
                        className="recent-row"
                        onClick={() => navigate('/admin/feedbacks')}
                      >
                        <td>{item.id}</td>
                        <td className="font-bold">{item.sourceType}</td>
                        <td>{item.targetTitle}</td>
                        <td>
                          <StarIcon size={12} filled={true} color="#f59e0b" /> {item.rating}/5
                        </td>
                        <td>{item.isAnonymous ? 'Anonymous' : item.studentName}</td>
                        <td className={`status-${item.status?.toLowerCase()}`}>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
