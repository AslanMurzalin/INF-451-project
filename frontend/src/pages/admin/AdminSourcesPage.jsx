import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin';
import './AdminSourcesPage.css';

export function AdminSourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceDesc, setNewSourceDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
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
    fetchSources();
  }, []);

  const handleAddSource = async (e) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;

    try {
      setSubmitting(true);
      await adminService.addFeedbackSource({
        name: newSourceName.trim(),
        description: newSourceDesc.trim(),
      });
      const updated = await adminService.getFeedbackSources();
      setSources(updated);
      setNewSourceName('');
      setNewSourceDesc('');
      setShowModal(false);
    } catch (err) {
      console.error('Failed to add source:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-sources-container">
      <div className="admin-sources-wrapper">
        <div className="sources-subtitle">
          MANAGE THE TYPES OF FEEDBACK STUDENTS CAN SUBMIT
        </div>

        {loading ? (
          <div className="sources-loading">Loading feedback sources...</div>
        ) : (
          <div className="sources-action-layout">
            <div className="sources-list-stack">
              {sources.map((src, idx) => (
                <div key={idx} className="source-item-card">
                  {src.display_name}
                </div>
              ))}
            </div>

            <div className="sources-add-button-col">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="add-source-btn"
              >
                + ADD FEEDBACK SOURCE
              </button>
            </div>
          </div>
        )}

        {/* Modal for Adding Source */}
        {showModal && (
          <div className="modal-backdrop" onClick={() => setShowModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">ADD FEEDBACK SOURCE</h3>
              <form onSubmit={handleAddSource}>
                <div className="modal-form-group">
                  <label htmlFor="source-name">SOURCE NAME :</label>
                  <input
                    id="source-name"
                    type="text"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    placeholder="e.g. LAB REVIEW, EXAM FEEDBACK"
                    required
                  />
                </div>
                <div className="modal-form-group">
                  <label htmlFor="source-desc">DESCRIPTION :</label>
                  <textarea
                    id="source-desc"
                    value={newSourceDesc}
                    onChange={(e) => setNewSourceDesc(e.target.value)}
                    placeholder="Brief description of the feedback source..."
                    rows="3"
                  />
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
                    {submitting ? 'SAVING...' : 'SAVE SOURCE'}
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
