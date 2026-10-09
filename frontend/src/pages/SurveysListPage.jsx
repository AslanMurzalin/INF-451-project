import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import surveysService from '../services/surveys';
import feedbackService from '../services/feedback';
import './SurveysListPage.css';

export function SurveysListPage() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [completedSurveyIds, setCompletedSurveyIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [surveysData, feedbacks] = await Promise.all([
          surveysService.getSurveys(1, 50),
          feedbackService.getFeedbacks('SURVEY'),
        ]);

        setSurveys(surveysData?.items || []);

        const completed = new Set();
        feedbacks.forEach(f => {
          if (f.targetId) completed.add(Number(f.targetId));
        });
        setCompletedSurveyIds(completed);
      } catch (err) {
        console.error('Error loading surveys:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFillSurvey = (surveyId) => {
    navigate(`/feedback?type=survey&surveyId=${surveyId}`);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Active';
    try {
      const d = new Date(isoStr);
      return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="surveys-page-container">
      <div className="surveys-page-subtitle">
        UNIVERSITY INITIATIVES & AD-HOC SURVEYS CAMPAIGNS
      </div>

      {loading ? (
        <div className="surveys-loading-state">Loading active surveys...</div>
      ) : surveys.length === 0 ? (
        <div className="surveys-empty-state">No active institutional surveys currently open.</div>
      ) : (
        <div className="surveys-grid">
          {surveys.map((survey) => {
            const isCompleted = completedSurveyIds.has(Number(survey.survey_id));
            return (
              <div key={survey.survey_id} className="survey-card-box">
                <div className="survey-card-header">
                  <span className="survey-topic-tag">{survey.topic || 'CAMPUS INITIATIVE'}</span>
                  <span className="survey-status-tag">ACTIVE CAMPAIGN</span>
                </div>

                <h3 className="survey-title">{survey.title}</h3>
                <p className="survey-desc">{survey.description}</p>

                <div className="survey-meta-row">
                  <div className="survey-meta-item">
                    <span className="meta-label">DEADLINE:</span>
                    <span className="meta-val">{formatDate(survey.end_date)}</span>
                  </div>
                  <div className="survey-meta-item">
                    <span className="meta-label">TARGET:</span>
                    <span className="meta-val">{survey.target_audience || 'All Students'}</span>
                  </div>
                </div>

                <div className="survey-action-footer">
                  {isCompleted ? (
                    <span className="survey-completed-badge">
                      ✓ SUBMITTED / RECORDED
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="fill-survey-btn"
                      onClick={() => handleFillSurvey(survey.survey_id)}
                    >
                      TAKE SURVEY →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SurveysListPage;
