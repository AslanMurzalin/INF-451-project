import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin';
import './AdminSourcesPage.css';

export function AdminSourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);

  // Modal Form State
  const [sourceName, setSourceName] = useState('');
  const [targetEntity, setTargetEntity] = useState('course');
  const [sourceDesc, setSourceDesc] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);

  // Criteria state (array of strings)
  const [criteriaList, setCriteriaList] = useState(['Overall Quality', 'Clarity & Helpfulness']);
  const [newCriterionInput, setNewCriterionInput] = useState('');

  // Custom Fields state (array of field objects)
  const [customFields, setCustomFields] = useState([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
  const [newFieldOptions, setNewFieldOptions] = useState('');

  const [submitting, setSubmitting] = useState(false);

  async function fetchSources() {
    try {
      setLoading(true);
      const data = await adminService.getFeedbackSources();
      setSources(data);
    } catch (err) {
      console.error('Failed to load feedback sources:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSources();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSource(null);
    setSourceName('');
    setTargetEntity('course');
    setSourceDesc('');
    setIsEnabled(true);
    setCriteriaList(['Overall Quality', 'Staff / Instructor Support']);
    setCustomFields([]);
    setShowModal(true);
  };

  const handleOpenEditModal = (src) => {
    setEditingSource(src);
    setSourceName(src.display_name);
    setTargetEntity(src.target_entity || 'course');
    setSourceDesc(src.description || '');
    setIsEnabled(src.is_enabled !== false);
    setCriteriaList(src.criteria || ['Overall Quality']);
    setCustomFields(src.custom_fields || []);
    setShowModal(true);
  };

  const handleAddCriterion = (e) => {
    e.preventDefault();
    if (!newCriterionInput.trim()) return;
    if (!criteriaList.includes(newCriterionInput.trim())) {
      setCriteriaList([...criteriaList, newCriterionInput.trim()]);
    }
    setNewCriterionInput('');
  };

  const handleRemoveCriterion = (index) => {
    setCriteriaList(criteriaList.filter((_, idx) => idx !== index));
  };

  const handleAddCustomField = (e) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;

    const fieldId = newFieldLabel.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const fieldObj = {
      id: fieldId,
      label: newFieldLabel.trim(),
      type: newFieldType,
      placeholder: newFieldPlaceholder.trim() || `Enter ${newFieldLabel.trim()}...`,
      options: newFieldType === 'select'
        ? newFieldOptions.split(',').map(o => o.trim()).filter(Boolean)
        : undefined,
      required: false,
    };

    setCustomFields([...customFields, fieldObj]);
    setNewFieldLabel('');
    setNewFieldPlaceholder('');
    setNewFieldOptions('');
  };

  const handleRemoveCustomField = (index) => {
    setCustomFields(customFields.filter((_, idx) => idx !== index));
  };

  const handleSaveSource = async (e) => {
    e.preventDefault();
    if (!sourceName.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        source_type: editingSource?.source_type || sourceName.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
        display_name: sourceName.toUpperCase().trim(),
        description: sourceDesc.trim() || 'Configured feedback source',
        target_entity: targetEntity,
        is_enabled: isEnabled,
        criteria: criteriaList.length > 0 ? criteriaList : ['Overall Quality'],
        custom_fields: customFields,
      };

      if (editingSource) {
        await adminService.updateFeedbackSource(editingSource.source_type, payload);
      } else {
        await adminService.addFeedbackSource(payload);
      }

      await fetchSources();
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save source:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (sourceType, e) => {
    e.stopPropagation();
    await adminService.toggleFeedbackSource(sourceType);
    await fetchSources();
  };

  const handleDelete = async (sourceType, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove feedback source "${sourceType}"?`)) {
      await adminService.deleteFeedbackSource(sourceType);
      await fetchSources();
    }
  };

  return (
    <div className="admin-sources-container">
      <div className="admin-sources-wrapper">
        <div className="sources-subtitle">
          DETAILED FEEDBACK SOURCES & DYNAMIC CRITERIA SCHEMA CONFIGURATION
        </div>

        <div className="sources-top-bar">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="add-source-btn"
          >
            + CREATE DETAILED FEEDBACK SOURCE
          </button>
        </div>

        {loading ? (
          <div className="sources-loading">Loading feedback sources...</div>
        ) : (
          <div className="sources-detailed-grid">
            {sources.map((src) => (
              <div
                key={src.source_type}
                className={`source-config-card ${!src.is_enabled ? 'disabled' : ''}`}
              >
                <div className="src-header-row">
                  <div className="src-title-area">
                    <span className="src-target-badge">{src.target_entity?.toUpperCase() || 'GENERAL'}</span>
                    <h4 className="src-display-name">{src.display_name}</h4>
                  </div>
                  <div className="src-status-toggle">
                    <button
                      type="button"
                      className={`status-chip ${src.is_enabled ? 'enabled' : 'disabled'}`}
                      onClick={(e) => handleToggle(src.source_type, e)}
                      title="Click to toggle enabled/disabled"
                    >
                      {src.is_enabled ? '● ACTIVE' : '○ DISABLED'}
                    </button>
                  </div>
                </div>

                <p className="src-description-text">{src.description}</p>

                {/* Criteria display */}
                <div className="src-meta-section">
                  <div className="src-sec-label">RATING CRITERIA ({src.criteria?.length || 0}):</div>
                  <div className="src-chips-wrap">
                    {(src.criteria || []).map((crit, idx) => (
                      <span key={idx} className="criteria-tag-chip">★ {crit}</span>
                    ))}
                  </div>
                </div>

                {/* Custom Fields display */}
                {src.custom_fields && src.custom_fields.length > 0 && (
                  <div className="src-meta-section">
                    <div className="src-sec-label">CUSTOM INPUT FIELDS ({src.custom_fields.length}):</div>
                    <div className="src-chips-wrap">
                      {src.custom_fields.map((f, idx) => (
                        <span key={idx} className="field-tag-chip">
                          [{f.type}] {f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="src-card-actions">
                  <button
                    type="button"
                    className="src-edit-btn"
                    onClick={() => handleOpenEditModal(src)}
                  >
                    EDIT SCHEMA
                  </button>
                  <button
                    type="button"
                    className="src-delete-btn"
                    onClick={(e) => handleDelete(src.source_type, e)}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detailed Modal for Adding / Editing Source */}
        {showModal && (
          <div className="modal-backdrop" onClick={() => setShowModal(false)}>
            <div className="modal-card detailed-source-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-row">
                <h3 className="modal-title">
                  {editingSource ? `EDIT SOURCE: ${editingSource.display_name}` : 'CREATE DETAILED FEEDBACK SOURCE'}
                </h3>
                <button
                  type="button"
                  className="modal-close-icon-btn"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveSource} className="modal-source-form">
                {/* 1. Basic Info */}
                <div className="form-two-col">
                  <div className="modal-form-group">
                    <label htmlFor="source-name">SOURCE NAME :</label>
                    <input
                      id="source-name"
                      type="text"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="e.g. LAB EQUIPMENT REVIEW"
                      required
                    />
                  </div>

                  <div className="modal-form-group">
                    <label htmlFor="target-entity-select">TARGET ENTITY TYPE :</label>
                    <select
                      id="target-entity-select"
                      value={targetEntity}
                      onChange={(e) => setTargetEntity(e.target.value)}
                    >
                      <option value="course">ACADEMIC COURSE</option>
                      <option value="service">CAMPUS FACILITY / SERVICE</option>
                      <option value="survey">INSTITUTIONAL SURVEY</option>
                      <option value="department">ACADEMIC DEPARTMENT</option>
                      <option value="general">GENERAL CAMPUS FEEDBACK</option>
                    </select>
                  </div>
                </div>

                <div className="modal-form-group">
                  <label htmlFor="source-desc">DESCRIPTION & STUDENT INSTRUCTIONS :</label>
                  <textarea
                    id="source-desc"
                    value={sourceDesc}
                    onChange={(e) => setSourceDesc(e.target.value)}
                    placeholder="Instructions shown to students when filling out this feedback source..."
                    rows="2"
                    required
                  />
                </div>

                {/* 2. Rating Criteria Builder */}
                <div className="builder-box">
                  <div className="builder-title">RATING CRITERIA (ЗВЁЗДОЧНЫЕ КРИТЕРИИ ОЦЕНКИ)</div>
                  <div className="builder-add-row">
                    <input
                      type="text"
                      value={newCriterionInput}
                      onChange={(e) => setNewCriterionInput(e.target.value)}
                      placeholder="e.g. Instructor Clarity, Cleanliness, Speed..."
                      className="builder-input"
                    />
                    <button
                      type="button"
                      onClick={handleAddCriterion}
                      className="builder-add-btn"
                    >
                      + ADD CRITERION
                    </button>
                  </div>

                  <div className="builder-chips-list">
                    {criteriaList.map((crit, idx) => (
                      <span key={idx} className="builder-chip">
                        ★ {crit}
                        <button
                          type="button"
                          onClick={() => handleRemoveCriterion(idx)}
                          className="chip-remove-btn"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Custom Fields Builder */}
                <div className="builder-box">
                  <div className="builder-title">CUSTOM QUESTIONS & INPUT FIELDS (ДОПОЛНИТЕЛЬНЫЕ ПОЛЯ)</div>
                  <div className="custom-fields-form-grid">
                    <input
                      type="text"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      placeholder="Field Question / Label (e.g. Room Number)"
                      className="builder-input"
                    />
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="builder-select"
                    >
                      <option value="text">Single-line Text</option>
                      <option value="textarea">Multi-line Text</option>
                      <option value="select">Dropdown Selection</option>
                    </select>
                    {newFieldType === 'select' && (
                      <input
                        type="text"
                        value={newFieldOptions}
                        onChange={(e) => setNewFieldOptions(e.target.value)}
                        placeholder="Comma-separated options (e.g. Option A, Option B)"
                        className="builder-input full-width"
                      />
                    )}
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      className="builder-add-btn"
                    >
                      + ADD FIELD
                    </button>
                  </div>

                  <div className="builder-fields-list">
                    {customFields.map((f, idx) => (
                      <div key={idx} className="field-preview-row">
                        <span className="fp-type">[{f.type.toUpperCase()}]</span>
                        <span className="fp-label">{f.label}</span>
                        {f.options && (
                          <span className="fp-opts">({f.options.join(', ')})</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(idx)}
                          className="chip-remove-btn"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="modal-cancel-btn"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="modal-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'SAVING...' : 'SAVE FEEDBACK SOURCE'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSourcesPage;
