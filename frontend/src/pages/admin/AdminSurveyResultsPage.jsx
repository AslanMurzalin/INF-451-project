import React, { useState, useEffect } from 'react';
import surveysService from '../../services/surveys';
import feedbackService from '../../services/feedback';
import { StarIcon } from '../../assets/icons';
import './AdminSurveyResultsPage.css';

export function AdminSurveyResultsPage() {
  const [surveys, setSurveys] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [selectedSurveyModal, setSelectedSurveyModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSurveyData() {
      try {
        setLoading(true);
        const [surveysData, analyticsData] = await Promise.all([
          surveysService.getSurveys(1, 50),
          feedbackService.getSurveyAnalytics(),
        ]);

        setSurveys(surveysData?.items || []);
        setAnalytics(analyticsData || []);
      } catch (err) {
        console.error('Failed to load survey analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSurveyData();
  }, []);

  const getAnalyticsForSurvey = (surveyId, title) => {
    return analytics.find(
      (a) => a.surveyId === Number(surveyId) || a.surveyTitle === title
    ) || {
      surveyId,
      responsesCount: 0,
      averageRating: 0,
      ratingsBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      criteriaScores: {},
      responses: []
    };
  };

  return (
    <div className="admin-surveys-container">
      <div className="admin-surveys-subtitle">
        INSTITUTIONAL SURVEYS & AD-HOC CAMPAIGN RESULTS (РЕЗУЛЬТАТЫ ОПРОСОВ)
      </div>

      {loading ? (
        <div className="admin-surveys-loading">Loading survey results and analytics...</div>
      ) : (
        <div className="surveys-results-grid">
          {surveys.map((survey) => {
            const data = getAnalyticsForSurvey(survey.survey_id, survey.title);
            const total = data.responsesCount;
            const avg = data.averageRating || 0;

            return (
              <div key={survey.survey_id} className="survey-result-card">
                <div className="survey-card-head">
                  <span className="survey-topic-badge">{survey.topic || 'CAMPUS INITIATIVE'}</span>
                  <span className="survey-badge-active">ACTIVE CAMPAIGN</span>
                </div>

                <h3 className="survey-head-title">{survey.title}</h3>
                <p className="survey-head-desc">{survey.description}</p>

                {/* Metrics Row */}
                <div className="survey-metrics-box">
                  <div className="metric-box-item">
                    <span className="m-label">TOTAL RESPONSES</span>
                    <span className="m-val">{total}</span>
                  </div>
                  <div className="metric-box-item">
                    <span className="m-label">AVERAGE RATING</span>
                    <div className="m-val-stars">
                      <StarIcon size={14} filled={true} color="#f59e0b" />
                      <span>{avg > 0 ? `${avg} / 5` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Criteria breakdown */}
                {Object.keys(data.criteriaScores).length > 0 && (
                  <div className="criteria-averages-section">
                    <div className="crit-sec-title">CRITERIA SATISFACTION SCORES:</div>
                    <div className="crit-bars-stack">
                      {Object.entries(data.criteriaScores).map(([crit, score]) => (
                        <div key={crit} className="crit-bar-row">
                          <span className="crit-name">{crit}</span>
                          <div className="crit-progress-bg">
                            <div
                              className="crit-progress-fill"
                              style={{ width: `${(Number(score) / 5) * 100}%` }}
                            />
                          </div>
                          <span className="crit-score-num">{score} / 5</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="survey-card-footer">
                  <button
                    type="button"
                    className="view-responses-btn"
                    onClick={() => setSelectedSurveyModal({ survey, data })}
                  >
                    VIEW STUDENT RESPONSES ({total}) →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Responses Modal */}
      {selectedSurveyModal && (
        <div className="modal-backdrop" onClick={() => setSelectedSurveyModal(null)}>
          <div className="modal-card survey-responses-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3 className="modal-title">
                RESPONSES FOR: {selectedSurveyModal.survey.title}
              </h3>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setSelectedSurveyModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="survey-modal-body">
              {selectedSurveyModal.data.responses.length === 0 ? (
                <div className="no-responses-hint">No student responses submitted for this survey yet.</div>
              ) : (
                <div className="responses-list-stack">
                  {selectedSurveyModal.data.responses.map((resp) => (
                    <div key={resp.id} className="survey-response-item">
                      <div className="resp-header">
                        <span className="resp-student">
                          {resp.isAnonymous ? 'Anonymous Student' : `${resp.studentName} (${resp.studentEmail})`}
                        </span>
                        <div className="resp-meta">
                          <span className="resp-date">{resp.feedbackDate}</span>
                          <span className="resp-rating-badge">★ {resp.rating} / 5</span>
                        </div>
                      </div>

                      <div className="resp-feedback-text">
                        "{resp.feedback}"
                      </div>

                      {resp.customAnswers && Object.keys(resp.customAnswers).length > 0 && (
                        <div className="resp-custom-answers">
                          {Object.entries(resp.customAnswers).map(([k, v]) => (
                            <div key={k} className="resp-ca-item">
                              <strong>{k}:</strong> {v}
                            </div>
                          ))}
                        </div>
                      )}

                      {resp.responseNote && (
                        <div className="resp-official-note">
                          <strong>Admin Note:</strong> {resp.responseNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setSelectedSurveyModal(null)}
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

export default AdminSurveyResultsPage;
