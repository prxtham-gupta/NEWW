import React, { useState } from 'react';
import './SessionPreferencesModal.css';

const SessionPreferencesModal = ({ isOpen, onClose, onSave }) => {
  const [preferences, setPreferences] = useState({
    summaryLength: '100 - 200 words',
    sessionModel: 'ChatGPT4'
  });

  const handleChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(preferences);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="preferences-modal-overlay">
      <div className="preferences-modal-content">
        <div className="preferences-modal-header">
          <h2>Session Preferences</h2>
          <button className="preferences-close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="preferences-form-group">
            <label>Summary length</label>
            <div className="preferences-select-wrapper">
              <select
                value={preferences.summaryLength}
                onChange={(e) => handleChange('summaryLength', e.target.value)}
                className="preferences-select"
              >
                <option value="50 - 100 words">50 - 100 words</option>
                <option value="100 - 200 words">100 - 200 words</option>
                <option value="200 - 300 words">200 - 300 words</option>
              </select>
              <span className="preferences-select-arrow">▼</span>
            </div>
          </div>

          <div className="preferences-form-group">
            <label>Select session models</label>
            <div className="preferences-select-wrapper">
              <select
                value={preferences.sessionModel}
                onChange={(e) => handleChange('sessionModel', e.target.value)}
                className="preferences-select"
              >
                <option value="ChatGPT3.5">ChatGPT3.5</option>
                <option value="ChatGPT4">ChatGPT4</option>
                <option value="GPT4-Turbo">GPT4-Turbo</option>
              </select>
              <span className="preferences-select-arrow">▼</span>
            </div>
          </div>

          <div className="preferences-modal-footer">
            <button type="button" className="preferences-cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="preferences-save-button">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionPreferencesModal;