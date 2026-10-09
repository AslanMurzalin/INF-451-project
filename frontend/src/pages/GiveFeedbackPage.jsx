import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import coursesService from '../services/courses';
import surveysService from '../services/surveys';
import servicesService from '../services/services';
import feedbackService from '../services/feedback';
import adminService from '../services/admin';
import { StarIcon } from '../assets/icons';
import './GiveFeedbackPage.css';

export function GiveFeedbackPage() {
  const { user } = useAuth();
  const { defaultSource } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // All sources from admin service (dynamic)
  const [availableSources, setAvailableSources] = useState([]);
  const [activeSource, setActiveSource] = useState(null);
  const [showSourcePickerModal, setShowSourcePickerModal] = useState(false);

  // Entities Data
  const [courses, setCourses] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Selected Target IDs / Names
  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get('courseId') || '');
  const [selectedSurveyId, setSelectedSurveyId] = useState(searchParams.get('surveyId') || '');
  const [selectedServiceId, setSelectedServiceId] = useState(searchParams.get('serviceId') || '');
  const [customTargetTitle, setCustomTargetTitle] = useState('');

  // Ratings & Criteria Map: { [criterionName]: score (1-5) }
  const [overallRating, setOverallRating] = useState(5);
  const [criteriaScores, setCriteriaScores] = useState({});

  // Dynamic Custom Fields Answers Map: { [fieldId]: answerValue }
  const [customFieldAnswers, setCustomFieldAnswers] = useState({});

  // General Form Fields
  const [feedbackText, setFeedbackText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [semester, setSemester] = useState('Fall 2026');

  // UI state
  const [loadingSources, setLoadingSources] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Initial Data Load
  useEffect(() => {
    async function loadAll() {
      try {
        setLoadingSources(true);
        const [srcs, coursesData, surveysData, servicesData, categoriesData] = await Promise.all([
          adminService.getActiveFeedbackSources(),
          coursesService.getCourses(1, 50),
          surveysService.getSurveys(1, 50, 'active'),
          servicesService.getServices(1, 50),
          servicesService.getCategories(),
        ]);

        setAvailableSources(srcs);

        const cList = coursesData?.items || [];
        setCourses(cList);
        if (cList.length > 0 && !selectedCourseId) {
          setSelectedCourseId(cList[0].course_id);
        }

        const sList = surveysData?.items || [];
        setSurveys(sList);
        if (sList.length > 0 && !selectedSurveyId) {
          setSelectedSurveyId(sList[0].survey_id);
        }

        const srvList = servicesData?.items || [];
        setServices(srvList);
        if (srvList.length > 0 && !selectedServiceId) {
          setSelectedServiceId(srvList[0].service_id);
        }

        setServiceCategories(categoriesData || []);

        // Determine active source from query param, user default preference, or first available
        const queryType = searchParams.get('type');
        let initial = srcs[0];
        if (queryType) {
          const matched = srcs.find(
            s => s.source_type.toLowerCase() === queryType.toLowerCase() ||
                 s.target_entity.toLowerCase() === queryType.toLowerCase()
          );
          if (matched) initial = matched;
        } else if (defaultSource && defaultSource !== 'ALL') {
          const prefMatched = srcs.find(s => s.source_type === defaultSource);
          if (prefMatched) initial = prefMatched;
        }

        selectSource(initial);
      } catch (err) {
        console.error('Error fetching data sources:', err);
      } finally {
        setLoadingSources(false);
      }
    }
    loadAll();
  }, []);

  const selectSource = (source) => {
    if (!source) return;
    setActiveSource(source);

    // Initialize criteria scores (default 5 for each criterion defined)
    const initialCriteria = {};
    if (Array.isArray(source.criteria)) {
      source.criteria.forEach(c => {
        initialCriteria[c] = 5;
      });
    }
    setCriteriaScores(initialCriteria);

    // Initialize custom field answers
    const initialFields = {};
    if (Array.isArray(source.custom_fields)) {
      source.custom_fields.forEach(f => {
        if (f.type === 'select' && f.options?.length > 0) {
          initialFields[f.id] = f.options[0];
        } else {
          initialFields[f.id] = '';
        }
      });
    }
    setCustomFieldAnswers(initialFields);
    setShowSourcePickerModal(false);
    setErrorMessage('');
  };

  const handleCriterionScoreChange = (critName, score) => {
    setCriteriaScores(prev => ({ ...prev, [critName]: score }));
  };

  const handleCustomFieldChange = (fieldId, val) => {
    setCustomFieldAnswers(prev => ({ ...prev, [fieldId]: val }));
  };

  const filteredServices = selectedCategory === 'ALL'
    ? services
    : services.filter(s => s.category?.toLowerCase() === selectedCategory.toLowerCase());

  const currentCourse = courses.find(c => String(c.course_id) === String(selectedCourseId));
  const currentSurvey = surveys.find(s => String(s.survey_id) === String(selectedSurveyId));
  const currentService = services.find(s => String(s.service_id) === String(selectedServiceId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!feedbackText.trim()) {
      setErrorMessage('Please enter your feedback text.');
      return;
    }

    try {
      setSubmitting(true);

      let targetId = null;
      let targetTitle = '';
      let category = '';

      if (activeSource.target_entity === 'course') {
        targetId = selectedCourseId || courses[0]?.course_id;
        targetTitle = currentCourse ? currentCourse.title : (courses[0]?.title || 'Academic Course');
      } else if (activeSource.target_entity === 'survey') {
        targetId = selectedSurveyId || surveys[0]?.survey_id;
        targetTitle = currentSurvey ? currentSurvey.title : (surveys[0]?.title || 'Institutional Survey');
      } else if (activeSource.target_entity === 'service') {
        targetId = selectedServiceId || services[0]?.service_id;
        targetTitle = currentService ? currentService.name : (services[0]?.name || 'Campus Facility');
        category = currentService?.category || selectedCategory;
      } else {
        targetId = null;
        targetTitle = customTargetTitle.trim() || activeSource.display_name;
      }

      await feedbackService.submitFeedback({
        sourceType: activeSource.source_type,
        sourceDisplayName: activeSource.display_name,
        targetId,
        targetTitle,
        studentName: user?.fullName || 'Alice Johnson',
        studentEmail: user?.email || 'alice.student@university.edu',
        category,
        rating: overallRating,
        criteria: criteriaScores,
        customAnswers: customFieldAnswers,
        semester,
        text: feedbackText.trim(),
        isAnonymous,
      });

      setSuccessMessage('Feedback submitted and recorded successfully!');
      setFeedbackText('');

      setTimeout(() => {
        navigate('/feedback/view');
      }, 1000);
    } catch (err) {
      console.error('Submit feedback failed:', err);
      setErrorMessage('Failed to send feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarSelector = (value, onChange, label) => {
    return (
      <div className="feedback-star-picker" role="radiogroup" aria-label={label || 'Rating'}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= value ? 'active' : ''}`}
            onClick={() => onChange(star)}
            title={`${star} out of 5 stars`}
          >
            <StarIcon size={18} filled={star <= value} color="#f59e0b" />
          </button>
        ))}
        <span className="rating-numeric-hint">{value} / 5</span>
      </div>
    );
  };

  return (
    <div className="give-feedback-container">
      <div className="give-feedback-subtitle">
        HERE YOU CAN WRITE FEEDBACK ONLINE (ОТПРАВКА ОБРАТНОЙ СВЯЗИ)
      </div>

      {/* Dynamic Active Source Selector Box */}
      <div className="source-selection-card">
        <div className="source-selection-header">
          <div className="source-selection-main">
            <span className="source-entity-badge">
              {activeSource?.target_entity?.toUpperCase() || 'GENERAL'}
            </span>
            <span className="source-selected-title">
              {activeSource?.display_name || 'SELECT FEEDBACK SOURCE'}
            </span>
          </div>

          <button
            type="button"
            className="choose-source-modal-trigger-btn"
            onClick={() => setShowSourcePickerModal(true)}
            title="Browse and select any feedback source"
          >
            CHANGE SOURCE ▾
          </button>
        </div>

        {/* Dynamic inline select dropdown */}
        <div className="source-inline-dropdown-row">
          <label htmlFor="active-source-dropdown">ACTIVE SOURCE :</label>
          <select
            id="active-source-dropdown"
            value={activeSource?.source_type || ''}
            onChange={(e) => {
              const src = availableSources.find(s => s.source_type === e.target.value);
              if (src) selectSource(src);
            }}
            className="source-inline-select"
          >
            {availableSources.map(s => (
              <option key={s.source_type} value={s.source_type}>
                {s.display_name} [{s.target_entity?.toUpperCase()}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {successMessage && (
        <div className="feedback-alert feedback-alert-success">
          {successMessage} Redirecting to feedback list...
        </div>
      )}

      {errorMessage && (
        <div className="feedback-alert feedback-alert-error">
          {errorMessage}
        </div>
      )}

      {activeSource && (
        <form className="give-feedback-form" onSubmit={handleSubmit}>
          <div className="feedback-form-box">
            {/* Description row */}
            {activeSource.description && (
              <div className="feedback-form-row source-desc-row">
                <div className="feedback-label-cell">
                  <label>INSTRUCTIONS :</label>
                </div>
                <div className="feedback-input-cell info-description-text">
                  {activeSource.description}
                </div>
              </div>
            )}

            {/* Target Selector: Course */}
            {activeSource.target_entity === 'course' && (
              <>
                <div className="feedback-form-row">
                  <div className="feedback-label-cell">
                    <label htmlFor="course-select">SELECT COURSE :</label>
                  </div>
                  <div className="feedback-input-cell">
                    <select
                      id="course-select"
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="feedback-select"
                      required
                    >
                      {courses.map((course) => (
                        <option key={course.course_id} value={course.course_id}>
                          {course.title} {course.lecturer_name ? `(${course.lecturer_name})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="feedback-form-row">
                  <div className="feedback-label-cell">
                    <label htmlFor="semester-select">SEMESTER :</label>
                  </div>
                  <div className="feedback-input-cell">
                    <select
                      id="semester-select"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="feedback-select"
                    >
                      <option value="Fall 2026">Fall Semester 2026</option>
                      <option value="Spring 2026">Spring Semester 2026</option>
                      <option value="Summer 2026">Summer Term 2026</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Target Selector: Survey */}
            {activeSource.target_entity === 'survey' && (
              <div className="feedback-form-row">
                <div className="feedback-label-cell">
                  <label htmlFor="survey-select">SURVEY CAMPAIGN :</label>
                </div>
                <div className="feedback-input-cell">
                  <select
                    id="survey-select"
                    value={selectedSurveyId}
                    onChange={(e) => setSelectedSurveyId(e.target.value)}
                    className="feedback-select"
                    required
                  >
                    {surveys.map((s) => (
                      <option key={s.survey_id} value={s.survey_id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Target Selector: Campus Service */}
            {activeSource.target_entity === 'service' && (
              <>
                <div className="feedback-form-row">
                  <div className="feedback-label-cell">
                    <label htmlFor="service-cat-select">CATEGORY :</label>
                  </div>
                  <div className="feedback-input-cell">
                    <select
                      id="service-cat-select"
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        const matching = e.target.value === 'ALL'
                          ? services
                          : services.filter(s => s.category?.toLowerCase() === e.target.value.toLowerCase());
                        if (matching.length > 0) {
                          setSelectedServiceId(matching[0].service_id);
                        }
                      }}
                      className="feedback-select"
                    >
                      <option value="ALL">ALL CATEGORIES</option>
                      {serviceCategories.map((cat, idx) => (
                        <option key={idx} value={cat}>
                          {cat.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="feedback-form-row">
                  <div className="feedback-label-cell">
                    <label htmlFor="service-select">CAMPUS SERVICE :</label>
                  </div>
                  <div className="feedback-input-cell">
                    <select
                      id="service-select"
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="feedback-select"
                      required
                    >
                      {filteredServices.map((service) => (
                        <option key={service.service_id} value={service.service_id}>
                          {service.name} [{service.category}]
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Target Selector: General */}
            {(activeSource.target_entity === 'general' || activeSource.target_entity === 'department') && (
              <div className="feedback-form-row">
                <div className="feedback-label-cell">
                  <label htmlFor="custom-target-input">TARGET ENTITY / TOPIC :</label>
                </div>
                <div className="feedback-input-cell">
                  <input
                    id="custom-target-input"
                    type="text"
                    value={customTargetTitle}
                    onChange={(e) => setCustomTargetTitle(e.target.value)}
                    placeholder="e.g. CS Department, Main Campus Lawn, Library 3rd Floor"
                    className="feedback-select"
                    required
                  />
                </div>
              </div>
            )}

            {/* Overall Rating */}
            <div className="feedback-form-row rating-row">
              <div className="feedback-label-cell">
                <label>OVERALL RATING :</label>
              </div>
              <div className="feedback-input-cell">
                {renderStarSelector(overallRating, setOverallRating, 'Overall Rating')}
              </div>
            </div>

            {/* Dynamic Rating Criteria defined by Admin */}
            {activeSource.criteria && activeSource.criteria.map((critName) => (
              <div key={critName} className="feedback-form-row criteria-row">
                <div className="feedback-label-cell">
                  <label>{critName.toUpperCase()} :</label>
                </div>
                <div className="feedback-input-cell">
                  {renderStarSelector(
                    criteriaScores[critName] || 5,
                    (score) => handleCriterionScoreChange(critName, score),
                    critName
                  )}
                </div>
              </div>
            ))}

            {/* Dynamic Custom Fields defined by Admin */}
            {activeSource.custom_fields && activeSource.custom_fields.map((field) => (
              <div key={field.id} className="feedback-form-row custom-field-row">
                <div className="feedback-label-cell">
                  <label htmlFor={`cf-${field.id}`}>{field.label.toUpperCase()} :</label>
                </div>
                <div className="feedback-input-cell">
                  {field.type === 'select' ? (
                    <select
                      id={`cf-${field.id}`}
                      value={customFieldAnswers[field.id] || ''}
                      onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                      className="feedback-select"
                    >
                      {field.options?.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      id={`cf-${field.id}`}
                      rows="2"
                      value={customFieldAnswers[field.id] || ''}
                      onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder || ''}
                      className="feedback-textarea-small"
                    />
                  ) : (
                    <input
                      id={`cf-${field.id}`}
                      type="text"
                      value={customFieldAnswers[field.id] || ''}
                      onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder || ''}
                      className="feedback-select"
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Main Text Area */}
            <div className="feedback-form-row text-row">
              <div className="feedback-label-cell">
                <label htmlFor="feedback-text">COMMENTS / TEXT :</label>
              </div>
              <div className="feedback-input-cell">
                <textarea
                  id="feedback-text"
                  rows="8"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="feedback-textarea"
                  placeholder={`Write your detailed feedback and observations for ${activeSource.display_name}...`}
                  required
                />
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="feedback-form-row anonymous-row">
              <div className="feedback-label-cell">
                <label htmlFor="anon-checkbox">PRIVACY :</label>
              </div>
              <div className="feedback-input-cell checkbox-cell">
                <label className="anonymous-checkbox-label">
                  <input
                    type="checkbox"
                    id="anon-checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <span>Submit anonymously (student identity protected)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="feedback-submit-row">
            <button
              type="submit"
              className="feedback-send-btn"
              disabled={submitting}
            >
              {submitting ? 'SENDING...' : 'SEND FEEDBACK'}
            </button>
          </div>
        </form>
      )}

      {/* Feedback Source Picker Modal */}
      {showSourcePickerModal && (
        <div className="modal-backdrop" onClick={() => setShowSourcePickerModal(false)}>
          <div className="modal-card source-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3 className="modal-title">SELECT FEEDBACK SOURCE (ВЫБОР КАТЕГОРИИ ОТЗЫВА)</h3>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setShowSourcePickerModal(false)}
              >
                ✕
              </button>
            </div>

            <p className="picker-modal-subtitle">
              Choose from all university feedback sources and evaluation programs configured by administration:
            </p>

            <div className="picker-sources-list">
              {availableSources.map((src) => (
                <div
                  key={src.source_type}
                  className={`picker-source-item ${activeSource?.source_type === src.source_type ? 'active' : ''}`}
                  onClick={() => selectSource(src)}
                >
                  <div className="picker-item-top">
                    <span className="picker-entity-badge">{src.target_entity?.toUpperCase()}</span>
                    <span className="picker-item-name">{src.display_name}</span>
                  </div>
                  <p className="picker-item-desc">{src.description}</p>
                  <div className="picker-item-criteria">
                    <span className="criteria-count">
                      ★ {src.criteria?.length || 0} rating criteria
                    </span>
                    {src.custom_fields?.length > 0 && (
                      <span className="custom-fields-count">
                        • {src.custom_fields.length} dynamic custom fields
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setShowSourcePickerModal(false)}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GiveFeedbackPage;
