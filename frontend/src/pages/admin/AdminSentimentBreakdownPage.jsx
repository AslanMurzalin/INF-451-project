import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import feedbackService from '../../services/feedback';
import './AdminSentimentBreakdownPage.css';

export function AdminSentimentBreakdownPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'services' | 'surveys'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [viewMode, setViewMode] = useState('both'); // 'both' | 'chart' | 'table'

  async function fetchBreakdown(category) {
    try {
      setLoading(true);
      setError('');
      const res = await feedbackService.getSentimentBreakdown(category);
      setData(res);
    } catch (err) {
      console.error('Failed to load sentiment breakdown:', err);
      setError('Failed to fetch sentiment breakdown from server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBreakdown(activeTab);
  }, [activeTab]);

  if (!isAdmin) {
    return (
      <div className="sentiment-restricted-box">
        <div className="restricted-card">
          <div className="restricted-icon">🔒</div>
          <h2>ACCESS RESTRICTED</h2>
          <p>
            Only users with the <strong>ADMIN</strong> role have permission to access the AI Sentiment Breakdown and Category Satisfaction Analytics.
          </p>
          <div className="restricted-user-role">
            Current logged in role: <code>{user?.role || 'Guest'}</code>
          </div>
        </div>
      </div>
    );
  }

  const items = (data?.items || []).filter(item => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.department_name && item.department_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="sentiment-breakdown-container">
      {/* Page Title & Subtitle */}
      <div className="breakdown-header">
        <div className="breakdown-subtitle">
          AI-POWERED SENTIMENT BREAKDOWN & CATEGORY BENCHMARKS (АНАЛИЗ ТОНАЛЬНОСТИ ПО КАТЕГОРИЯМ)
        </div>
        <p className="breakdown-description">
          Automated sentiment classification (Positive / Neutral / Negative) broken down across academic courses, campus services, and ad-hoc surveys. Percentages are strictly calculated from entries with completed AI scoring.
        </p>
      </div>

      {/* Category Selection Tabs & Controls */}
      <div className="breakdown-controls-bar">
        <div className="category-tabs-group">
          <button
            type="button"
            className={`category-tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            📚 COURSES ({activeTab === 'courses' && data ? data.total_categories : '...'})
          </button>
          <button
            type="button"
            className={`category-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            🏢 CAMPUS SERVICES ({activeTab === 'services' && data ? data.total_categories : '...'})
          </button>
          <button
            type="button"
            className={`category-tab-btn ${activeTab === 'surveys' ? 'active' : ''}`}
            onClick={() => setActiveTab('surveys')}
          >
            📋 AD-HOC SURVEYS ({activeTab === 'surveys' && data ? data.total_categories : '...'})
          </button>
        </div>

        <div className="breakdown-right-tools">
          <input
            type="text"
            className="breakdown-search-input"
            placeholder="Search category or department..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'both' ? 'active' : ''}`}
              onClick={() => setViewMode('both')}
            >
              ALL
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'chart' ? 'active' : ''}`}
              onClick={() => setViewMode('chart')}
            >
              CHARTS
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              TABLE
            </button>
          </div>
          <button
            type="button"
            className="refresh-btn"
            onClick={() => fetchBreakdown(activeTab)}
            title="Refresh analytics data"
          >
            ↻ REFRESH
          </button>
        </div>
      </div>

      {loading ? (
        <div className="breakdown-loading-box">
          <div className="loading-spinner"></div>
          <span>Computing AI sentiment distributions and aggregating category metrics...</span>
        </div>
      ) : error ? (
        <div className="breakdown-error-box">{error}</div>
      ) : (
        <>
          {/* Overview Metrics Cards */}
          <div className="breakdown-kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">TOTAL CATEGORIES</span>
              <div className="kpi-value">{data?.total_categories || 0}</div>
              <span className="kpi-sub">In {activeTab.toUpperCase()} catalogue</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">CATEGORIES WITH DATA</span>
              <div className="kpi-value">{data?.categories_with_data || 0}</div>
              <span className="kpi-sub">
                {(data?.total_categories || 0) - (data?.categories_with_data || 0)} without feedback ("No data")
              </span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">TOTAL ANALYZED ENTRIES</span>
              <div className="kpi-value">{data?.total_analyzed || 0}</div>
              <span className="kpi-sub">
                {data?.total_feedbacks || 0} total submissions (including pending)
              </span>
            </div>

            <div className="kpi-card highlight-card">
              <span className="kpi-label">INSTITUTIONAL SENTIMENT MIX</span>
              <div className="kpi-sentiment-breakdown">
                <span className="pill-pos">
                  {data?.overall_positive_percentage !== null ? `${data?.overall_positive_percentage}% POS` : 'N/A'}
                </span>
                <span className="pill-neu">
                  {data?.overall_neutral_percentage !== null ? `${data?.overall_neutral_percentage}% NEU` : 'N/A'}
                </span>
                <span className="pill-neg">
                  {data?.overall_negative_percentage !== null ? `${data?.overall_negative_percentage}% NEG` : 'N/A'}
                </span>
              </div>
              <span className="kpi-sub">Calculated only from scored entries</span>
            </div>
          </div>

          {/* Visual Stacked Sentiment Comparison Charts */}
          {(viewMode === 'both' || viewMode === 'chart') && (
            <div className="breakdown-charts-section">
              <div className="section-title-row">
                <h3 className="section-title">
                  SIDE-BY-SIDE SENTIMENT DISTRIBUTION ({activeTab.toUpperCase()})
                </h3>
                <div className="sentiment-legend">
                  <span className="legend-item"><span className="legend-color pos"></span> Positive</span>
                  <span className="legend-item"><span className="legend-color neu"></span> Neutral</span>
                  <span className="legend-item"><span className="legend-color neg"></span> Negative</span>
                  <span className="legend-item"><span className="legend-color nodata"></span> No Data</span>
                </div>
              </div>

              <div className="charts-cards-grid">
                {items.map((item) => (
                  <div key={item.id} className="chart-item-card">
                    <div className="chart-item-header">
                      <div className="chart-item-title" title={item.name}>{item.name}</div>
                      {item.department_name && (
                        <div className="chart-item-dept">{item.department_name}</div>
                      )}
                    </div>

                    {item.has_data ? (
                      <div className="chart-bar-container">
                        <div className="stacked-bar">
                          {item.positive_percentage > 0 && (
                            <div
                              className="bar-slice slice-pos"
                              style={{ width: `${item.positive_percentage}%` }}
                              title={`Positive: ${item.positive_percentage}% (${item.positive_count})`}
                            >
                              {item.positive_percentage >= 15 ? `${item.positive_percentage}%` : ''}
                            </div>
                          )}
                          {item.neutral_percentage > 0 && (
                            <div
                              className="bar-slice slice-neu"
                              style={{ width: `${item.neutral_percentage}%` }}
                              title={`Neutral: ${item.neutral_percentage}% (${item.neutral_count})`}
                            >
                              {item.neutral_percentage >= 15 ? `${item.neutral_percentage}%` : ''}
                            </div>
                          )}
                          {item.negative_percentage > 0 && (
                            <div
                              className="bar-slice slice-neg"
                              style={{ width: `${item.negative_percentage}%` }}
                              title={`Negative: ${item.negative_percentage}% (${item.negative_count})`}
                            >
                              {item.negative_percentage >= 15 ? `${item.negative_percentage}%` : ''}
                            </div>
                          )}
                        </div>

                        <div className="chart-metrics-row">
                          <span className="metric-text pos-text">
                            <strong>{item.positive_percentage}%</strong> Pos ({item.positive_count})
                          </span>
                          <span className="metric-text neu-text">
                            <strong>{item.neutral_percentage}%</strong> Neu ({item.neutral_count})
                          </span>
                          <span className="metric-text neg-text">
                            <strong>{item.negative_percentage}%</strong> Neg ({item.negative_count})
                          </span>
                        </div>
                        <div className="chart-count-sub">
                          {item.analyzed_feedbacks} of {item.total_feedbacks} submissions scored
                        </div>
                      </div>
                    ) : (
                      <div className="chart-empty-state">
                        <span className="no-data-tag">NO DATA</span>
                        <p className="no-data-msg">
                          No feedback data available for this {item.entity_type} yet.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Tabular Breakdown */}
          {(viewMode === 'both' || viewMode === 'table') && (
            <div className="breakdown-table-section">
              <div className="section-title-row">
                <h3 className="section-title">
                  DETAILED SATISFACTION BENCHMARK MATRIX
                </h3>
              </div>

              <div className="breakdown-table-wrapper">
                <table className="breakdown-data-table">
                  <thead>
                    <tr>
                      <th className="th-name">CATEGORY / TARGET NAME</th>
                      <th className="th-dept">DEPARTMENT / UNIT</th>
                      <th className="th-subs">TOTAL FEEDBACKS</th>
                      <th className="th-analyzed">ANALYZED</th>
                      <th className="th-pos">POSITIVE %</th>
                      <th className="th-neu">NEUTRAL %</th>
                      <th className="th-neg">NEGATIVE %</th>
                      <th className="th-status">HEALTH STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className={item.has_data ? '' : 'row-no-data'}>
                        <td className="td-name">
                          <strong>{item.name}</strong>
                        </td>
                        <td className="td-dept">{item.department_name || '—'}</td>
                        <td className="td-subs">{item.total_feedbacks}</td>
                        <td className="td-analyzed">{item.analyzed_feedbacks}</td>

                        {item.has_data ? (
                          <>
                            <td className="td-pos">
                              <span className="pos-badge">{item.positive_percentage}%</span>
                            </td>
                            <td className="td-neu">
                              <span className="neu-badge">{item.neutral_percentage}%</span>
                            </td>
                            <td className="td-neg">
                              <span className="neg-badge">{item.negative_percentage}%</span>
                            </td>
                            <td className="td-status">
                              {item.positive_percentage >= 70 ? (
                                <span className="status-pill status-high">★ EXCELLENT</span>
                              ) : item.negative_percentage >= 40 ? (
                                <span className="status-pill status-crit">⚠ ATTENTION NEEDED</span>
                              ) : (
                                <span className="status-pill status-mid">● SATISFACTORY</span>
                              )}
                            </td>
                          </>
                        ) : (
                          <>
                            <td colSpan="3" className="td-nodata-cell">
                              <span className="no-data-badge">No data</span>
                            </td>
                            <td className="td-status">
                              <span className="status-pill status-none">PENDING REVIEWS</span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminSentimentBreakdownPage;

