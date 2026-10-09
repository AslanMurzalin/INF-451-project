import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import adminService from '../services/admin';
import request from '../services/api';
import './SettingsPage.css';

export function SettingsPage() {
  const { user } = useAuth();
  const {
    theme,
    setTheme,
    scale,
    setScale,
    zoomIn,
    zoomOut,
    resetScale,
    presets,
    defaultSource,
    setDefaultSource,
  } = useTheme();

  const [availableSources, setAvailableSources] = useState([]);

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    async function loadSources() {
      try {
        const srcs = await adminService.getFeedbackSources();
        setAvailableSources(srcs);
      } catch (e) {
        console.error('Failed to load feedback sources in settings:', e);
      }
    }
    loadSources();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!fullName.trim()) {
      setProfileError('Full name cannot be empty.');
      return;
    }

    try {
      setProfileSaving(true);
      await request('/auth/me', {
        method: 'PUT',
        body: { full_name: fullName.trim() }
      });
      setProfileSuccess('Profile name successfully updated!');
    } catch (err) {
      console.warn('Backend update failed, updating local state:', err);
      const stored = localStorage.getItem('user_info');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.fullName = fullName.trim();
        localStorage.setItem('user_info', JSON.stringify(parsed));
      }
      setProfileSuccess('Profile name updated locally!');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      setPasswordSaving(true);
      await request('/auth/change-password', {
        method: 'POST',
        body: {
          current_password: currentPassword,
          new_password: newPassword
        }
      });
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.warn('Password change failed on backend:', err);
      setPasswordError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="settings-page-container">
      <div className="settings-page-subtitle">
        APPLICATION PREFERENCES & USER ACCOUNT INFORMATION (НАСТРОЙКИ СИСТЕМЫ)
      </div>

      <div className="settings-sections-wrapper">
        {/* Section 1: Dark / Light Theme & Appearance */}
        <div className="settings-card-box">
          <div className="settings-card-header">
            <h3>THEME & COLOR MODE (ЦВЕТОВАЯ ТЕМА)</h3>
          </div>
          <div className="settings-card-body">
            <p className="settings-desc-text">
              Select your preferred visual appearance mode. Dark theme reduces eye strain in low-light environments.
            </p>

            <div className="theme-toggle-row">
              <span className="setting-field-label">CURRENT THEME:</span>
              <div className="theme-buttons-group">
                <button
                  type="button"
                  className={`theme-mode-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  ☀️ LIGHT THEME (СВЕТЛАЯ)
                </button>
                <button
                  type="button"
                  className={`theme-mode-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  🌙 DARK THEME (ТЁМНАЯ)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: UI Scaling & Zoom */}
        <div className="settings-card-box">
          <div className="settings-card-header">
            <h3>INTERFACE SCALE & ZOOM (МАСШТАБ ИНТЕРФЕЙСА)</h3>
          </div>
          <div className="settings-card-body">
            <p className="settings-desc-text">
              Adjust the overall user interface scaling factor for improved readability and high-DPI display compatibility.
            </p>

            <div className="scale-stepper-row">
              <span className="scale-current-label">CURRENT SCALE:</span>
              <div className="scale-controls-group">
                <button
                  type="button"
                  className="scale-step-btn"
                  onClick={zoomOut}
                  title="Decrease UI scale"
                >
                  − ZOOM OUT
                </button>
                <span className="scale-display-badge">{scale}%</span>
                <button
                  type="button"
                  className="scale-step-btn"
                  onClick={zoomIn}
                  title="Increase UI scale"
                >
                  + ZOOM IN
                </button>
                <button
                  type="button"
                  className="scale-reset-btn"
                  onClick={resetScale}
                  title="Reset to 100%"
                >
                  RESET 100%
                </button>
              </div>
            </div>

            <div className="scale-presets-grid">
              <span className="scale-presets-label">QUICK PRESETS:</span>
              <div className="scale-preset-buttons">
                {presets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    className={`preset-btn ${scale === preset.value ? 'active' : ''}`}
                    onClick={() => setScale(preset.value)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            <div className="scale-preview-box">
              <div className="preview-label">LIVE PREVIEW OF SCALED COMPONENTS:</div>
              <div className="preview-content">
                <span className="sample-badge">SAMPLE BADGE</span>
                <span className="sample-text">SIS Information System Component Preview</span>
                <button type="button" className="sample-btn">SAMPLE BUTTON</button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Default Feedback Source Preference */}
        <div className="settings-card-box">
          <div className="settings-card-header">
            <h3>FEEDBACK SOURCES DEFAULTS (ИСТОЧНИКИ ОТЗЫВОВ ПО УМОЛЧАНИЮ)</h3>
          </div>
          <div className="settings-card-body">
            <p className="settings-desc-text">
              Configure which feedback source category is selected by default when opening "Give Feedback" and "View My Feedback".
            </p>

            <div className="default-source-form-row">
              <label htmlFor="default-src-select">DEFAULT ACTIVE SOURCE / FILTER :</label>
              <select
                id="default-src-select"
                value={defaultSource}
                onChange={(e) => setDefaultSource(e.target.value)}
                className="settings-input"
              >
                <option value="ALL">ALL SOURCES (SHOW ALL SUBMISSIONS)</option>
                {availableSources.map(s => (
                  <option key={s.source_type} value={s.source_type}>
                    {s.display_name} [{s.target_entity?.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Account Information */}
        <div className="settings-card-box">
          <div className="settings-card-header">
            <h3>ACCOUNT INFORMATION (ИНФОРМАЦИЯ ОБ АККАУНТЕ)</h3>
          </div>
          <div className="settings-card-body">
            <table className="account-info-grid">
              <tbody>
                <tr>
                  <td className="account-label">USER ID :</td>
                  <td className="account-value font-mono">
                    {user?.userId ? `SIS-2026-${String(user.userId).padStart(4, '0')}` : 'SIS-2026-0042'}
                  </td>
                </tr>
                <tr>
                  <td className="account-label">FULL NAME :</td>
                  <td className="account-value font-bold">{user?.fullName || 'Alice Johnson'}</td>
                </tr>
                <tr>
                  <td className="account-label">EMAIL ADDRESS :</td>
                  <td className="account-value">{user?.email || 'user@university.edu'}</td>
                </tr>
                <tr>
                  <td className="account-label">USER ROLE :</td>
                  <td className="account-value">
                    <span className="role-tag">{(user?.role || 'STUDENT').toUpperCase()}</span>
                  </td>
                </tr>
                <tr>
                  <td className="account-label">DEPARTMENT :</td>
                  <td className="account-value">Computer Science & Software Engineering</td>
                </tr>
                <tr>
                  <td className="account-label">SESSION STATUS :</td>
                  <td className="account-value status-active">AUTHENTICATED & ACTIVE</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Profile Update */}
        <div className="settings-card-box">
          <div className="settings-card-header">
            <h3>EDIT PROFILE DETAILS</h3>
          </div>
          <div className="settings-card-body">
            {profileSuccess && (
              <div className="settings-alert alert-success">{profileSuccess}</div>
            )}
            {profileError && (
              <div className="settings-alert alert-error">{profileError}</div>
            )}

            <form onSubmit={handleUpdateProfile} className="settings-form">
              <div className="settings-form-row">
                <label htmlFor="full-name-input">DISPLAY FULL NAME :</label>
                <input
                  id="full-name-input"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="settings-input"
                  placeholder="Enter full name..."
                  required
                />
              </div>
              <div className="settings-form-actions">
                <button
                  type="submit"
                  className="settings-save-btn"
                  disabled={profileSaving}
                >
                  {profileSaving ? 'SAVING...' : 'UPDATE NAME'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Section 6: Security & Password */}
        <div className="settings-card-box">
          <div className="settings-card-header">
            <h3>SECURITY & PASSWORD CHANGE</h3>
          </div>
          <div className="settings-card-body">
            {passwordSuccess && (
              <div className="settings-alert alert-success">{passwordSuccess}</div>
            )}
            {passwordError && (
              <div className="settings-alert alert-error">{passwordError}</div>
            )}

            <form onSubmit={handleChangePassword} className="settings-form">
              <div className="settings-form-row">
                <label htmlFor="current-pw-input">CURRENT PASSWORD :</label>
                <input
                  id="current-pw-input"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="settings-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="settings-form-row">
                <label htmlFor="new-pw-input">NEW PASSWORD :</label>
                <input
                  id="new-pw-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="settings-input"
                  placeholder="At least 6 characters..."
                  required
                />
              </div>

              <div className="settings-form-row">
                <label htmlFor="confirm-pw-input">CONFIRM PASSWORD :</label>
                <input
                  id="confirm-pw-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="settings-input"
                  placeholder="Confirm new password..."
                  required
                />
              </div>

              <div className="settings-form-actions">
                <button
                  type="submit"
                  className="settings-save-btn"
                  disabled={passwordSaving}
                >
                  {passwordSaving ? 'CHANGING...' : 'CHANGE PASSWORD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
