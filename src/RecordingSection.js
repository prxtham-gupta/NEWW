import React from 'react';
import RecordSession from '../components/RecordSession';
import UploadSession from '/UploadSession';

const RecordingSection = ({
  currentTab,
  setCurrentTab,
  isSessionSaved
}) => {
  if (isSessionSaved) {
    return null;
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${currentTab === 'record' ? 'active' : ''}`}
          onClick={() => setCurrentTab('record')}
        >
          Record session
        </button>
        <button
          className={`tab-button ${currentTab === 'upload' ? 'active' : ''}`}
          onClick={() => setCurrentTab('upload')}
        >
          Upload session
        </button>
      </div>

      {/* Content */}
      {currentTab === 'record' ? (
        <RecordSession />
      ) : (
        <UploadSession />
      )}
    </div>
  );
};

export default RecordingSection;