import React, { useState, useEffect } from 'react';
import feedbackService from '../../services/feedback';
import { StarIcon } from '../../assets/icons';
import './AdminTopicsPage.css';

export function AdminTopicsPage() {
  const [topicsData, setTopicsData] = useState({ total_topics: 0, total_entries_tagged: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [minCount, setMinCount] = useState(2); // US5.1 Constraint: defaults to >= 2
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicDetail, setTopicDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState('');

  const fetchTopics = async (count = minCount) => {
    try {
      setLoading(true);
      const data = await feedbackService.getTopics(count);
      setTopicsData(data);
    } catch (err) {
      console.error('Failed to load topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics(minCount);
  }, [minCount]);

  const handleSelectTopic = async (topic) => {
    setSelectedTopic(topic);
    try {
      setLoadingDetail(true);
      const detail = await feedbackService.getTopicDetail(topic.topic_id);
      setTopicDetail(detail);
    } catch (err) {
      console.error('Failed to load topic detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedTopic(null);
    setTopicDetail(null);
  };

  const handleReindex = async () => {
    try {
      setReindexing(true);
      setFeedbackNotice('Re-indexing AI topics across all feedbacks...');
      await feedbackService.reindexTopics();
      await fetchTopics(minCount);
      setFeedbackNotice('AI topic detection successfully re-indexed!');
      setTimeout(() => setFeedbackNotice(''), 4000);
    } catch (err) {
      setFeedbackNotice('Failed to reindex topics. Please check backend service.');
    } finally {
      setReindexing(false);
    }
  };

  // Identify top negative recurring issue
  const topIssue = topicsData.items.find((t) => t.predominant_sentiment === 'negative' || t.negative_count > 0);

  return (
    <div className="admin-topics-container">
      {/* Header Banner */}
      <div className="topics-header-banner">
        <div className="topics-title-area">
          <div className="topics-tag-pill">SPRINT 5 — AI TOPIC DETECTION (US5.1)</div>
          <h1>AI Topic Detection & Recurring Issue Tracker</h1>
          <p>
            Automatically analyzes feedback text to cluster recurring topics and common problems without manual reading.
          </p>
        </div>
        <div className="topics-header-actions">
          <button
            className="reindex-btn"
            onClick={handleReindex}
            disabled={reindexing}
            title="Re-run AI topic detection on all database submissions"
          >
            {reindexing ? 'Re-indexing AI...' : '⚡ Re-index Topics'}
          </button>
        </div>
      </div>

      {feedbackNotice && (
        <div className="topics-notice-banner">
          {feedbackNotice}
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="topics-kpi-grid">
        <div className="topic-kpi-card">
          <div className="kpi-label">RECURRING TOPICS DETECTED</div>
          <div className="kpi-value">{topicsData.total_topics}</div>
          <div className="kpi-hint">Topics with &gt; 1 occurrence (US5.1 Constraint)</div>
        </div>

        <div className="topic-kpi-card">
          <div className="kpi-label">TOTAL FEEDBACKS TAGGED</div>
          <div className="kpi-value">{topicsData.total_entries_tagged}</div>
          <div className="kpi-hint">Categorized into actionable themes</div>
        </div>

        <div className="topic-kpi-card highlight-negative">
          <div className="kpi-label">TOP RECURRING PROBLEM</div>
          <div className="kpi-value issue-name">{topIssue ? topIssue.name : 'None Detected'}</div>
          <div className="kpi-hint">
            {topIssue ? `${topIssue.negative_count} negative complaints reported` : 'No major negative spikes'}
          </div>
        </div>
      </div>

      {/* Controls Bar: Min Occurrence filter */}
      <div className="topics-controls-bar">
        <div className="filter-label-group">
          <span className="control-title">OCCURRENCE THRESHOLD:</span>
          <button
            className={`threshold-btn ${minCount === 2 ? 'active' : ''}`}
            onClick={() => setMinCount(2)}
          >
            Recurring Only (&gt; 1 entry)
          </button>
          <button
            className={`threshold-btn ${minCount === 1 ? 'active' : ''}`}
            onClick={() => setMinCount(1)}
          >
            All Detected (&gt;= 1 entry)
          </button>
        </div>

        <div className="topics-constraint-note">
          <span className="info-icon">ℹ️</span>
          <span>US5.1 Constraint: In recurring mode, topics appear only if mentioned across multiple entries.</span>
        </div>
      </div>

      {/* Topics Grid */}
      {loading ? (
        <div className="topics-loading-state">
          <div className="spinner"></div>
          <p>Analyzing text and clustering recurring feedback topics with AI...</p>
        </div>
      ) : topicsData.items.length === 0 ? (
        <div className="topics-empty-state">
          <h3>No recurring topics found</h3>
          <p>
            {minCount > 1
              ? 'No topics currently meet the recurrence threshold (> 1 feedback entry). Switch to "All Detected" or submit more feedback.'
              : 'No feedback entries have been processed for topic detection yet.'}
          </p>
        </div>
      ) : (
        <div className="topics-grid">
          {topicsData.items.map((topic) => {
            const isNegative = topic.predominant_sentiment === 'negative';
            const isPositive = topic.predominant_sentiment === 'positive';

            return (
              <div
                key={topic.topic_id}
                className={`topic-card ${isNegative ? 'card-issue' : isPositive ? 'card-strength' : 'card-neutral'}`}
                onClick={() => handleSelectTopic(topic)}
              >
                <div className="topic-card-header">
                  <span className={`sentiment-badge ${topic.predominant_sentiment}`}>
                    {isNegative ? '⚠️ PROBLEM AREA' : isPositive ? '⭐ KEY STRENGTH' : 'ℹ️ COMMON TOPIC'}
                  </span>
                  <span className="entries-count-badge">
                    {topic.entry_count} {topic.entry_count === 1 ? 'entry' : 'entries'}
                  </span>
                </div>

                <h3 className="topic-card-title">{topic.name}</h3>

                <div className="topic-metrics">
                  <div className="metric-row">
                    <span className="metric-title">Average Relevance:</span>
                    <span className="metric-val">{Math.round((topic.relevance_score || 0.8) * 100)}%</span>
                  </div>
                  <div className="relevance-bar-track">
                    <div
                      className="relevance-bar-fill"
                      style={{ width: `${Math.round((topic.relevance_score || 0.8) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="sentiment-mini-breakdown">
                  <span className="mini-pill pill-pos">+{topic.positive_count} Pos</span>
                  <span className="mini-pill pill-neu">~{topic.neutral_count} Neu</span>
                  <span className="mini-pill pill-neg">-{topic.negative_count} Neg</span>
                </div>

                <button className="topic-drilldown-btn">
                  View {topic.entry_count} Related Entries &rarr;
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Drill-down Modal (Scenario 2: Open the entries of a topic) */}
      {selectedTopic && (
        <div className="topic-modal-overlay" onClick={handleCloseModal}>
          <div className="topic-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="topic-modal-header">
              <div>
                <div className="modal-eyebrow">TOPIC DRILL-DOWN (US5.1 SCENARIO 2)</div>
                <h2>{selectedTopic.name}</h2>
                <div className="modal-subtitle">
                  Showing all {selectedTopic.entry_count} feedback submissions tagged with this topic
                </div>
              </div>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                &times;
              </button>
            </div>

            <div className="topic-modal-body">
              {loadingDetail ? (
                <div className="modal-loading-state">
                  <div className="spinner"></div>
                  <p>Loading related feedback entries...</p>
                </div>
              ) : !topicDetail || topicDetail.feedbacks.length === 0 ? (
                <div className="modal-empty-state">No entries found for this topic.</div>
              ) : (
                <div className="modal-feedbacks-list">
                  {topicDetail.feedbacks.map((fb) => (
                    <div key={fb.feedback_id} className="modal-feedback-item">
                      <div className="feedback-item-header">
                        <div className="item-target">
                          <span className="target-pill">{fb.source_type}</span>
                          <span className="target-name">{fb.target_name || 'Campus Resource'}</span>
                        </div>
                        <div className="item-badges">
                          {fb.rating && (
                            <span className="rating-pill">
                              <StarIcon size={13} filled={true} color="#ffb703" /> {fb.rating}/5
                            </span>
                          )}
                          <span className={`sentiment-pill ${fb.sentiment_label?.toLowerCase() || 'pending'}`}>
                            {fb.sentiment_label || 'Sentiment Pending'}
                          </span>
                        </div>
                      </div>

                      <p className="feedback-item-text">"{fb.raw_text}"</p>

                      <div className="feedback-item-footer">
                        <span className="footer-author">
                          {fb.is_anonymous ? '👤 Anonymous Student' : '👤 Student Submission'}
                        </span>
                        <span className="footer-date">
                          {new Date(fb.submitted_at).toLocaleDateString()}
                        </span>
                        <span className="footer-score">
                          Topic Relevance: {Math.round(fb.relevance_score * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="topic-modal-footer">
              <button className="modal-done-btn" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTopicsPage;
