import React, { useState } from 'react';

const SummarySection = ({ summaries, onPreferSummary }) => {
  const [editingSummary, setEditingSummary] = useState(null);
  const [editedText, setEditedText] = useState('');

  const handlePreferClick = (summaryKey) => {
    setEditingSummary(summaryKey);
    setEditedText(summaries[summaryKey]);
  };

  const handleBack = () => {
    setEditingSummary(null);
    setEditedText('');
  };

  const handleEdit = () => {
    // Handle edit submission logic here
    console.log('Edited text:', editedText);
    setEditingSummary(null);
  };

  if (editingSummary) {
    return (
      <div className="editing-summary-container">
        <h2 className="summary-title">Summary</h2>
        <textarea
          className="summary-textarea"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
        />
        <div className="button-container">
          <button className="back-button" onClick={handleBack}>
            Back
          </button>
          <button className="edit-confirm-button" onClick={handleEdit}>
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="summary-options-title">Summary options</h2>
      <div className="summaries-container">
        <div className="summary-box">
          <h3>Summary 1</h3>
          <p>{summaries.summary1}</p>
          <button 
            className="prefer-button"
            onClick={() => handlePreferClick('summary1')}
          >
            I prefer this summary
          </button>
        </div>
        <div className="summary-box">
          <h3>Summary 2</h3>
          <p>{summaries.summary2}</p>
          <button 
            className="prefer-button"
            onClick={() => handlePreferClick('summary2')}
          >
            I prefer this summary
          </button>
        </div>
      </div>
    </>
  );
};

export default SummarySection;