import React, { useState } from 'react';
import { Download } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress'
import './SessionContent.css';

const AudioSection = ({ audioUrl }) => {
  const fileName = "6500.wav";
  const audioLength = "4:21";
  const currentTime = "1:06";
  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `session-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="audio">
      <div className="header">
        <h2 className="title">Audio</h2>
        <div className="wrapper">
          <span className="text">Recording</span>
          <audio controls src={audioUrl || null} className="player" />
          <button
            onClick={handleDownload}
            className="btn"
            aria-label="Download recording"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="icon"
            >
              <path
                d="M3 19H21V21H3V19ZM13 13.172L19.071 7.1L20.485 8.514L12 17L3.515 8.515L4.929 7.1L11 13.17V2H13V13.172Z"
                fill="#252626"
              />
            </svg>
            <span className="label"></span>
          </button>
        </div>
      </div>
    </div>

  );
};

const SessionContent = ({
  summaryTranscript,
  currentTab,
  isRecording,
  isProcessing,
  stopRecording,
  startRecording,
  formatTime,
  timer,
  handleFileChange,
  showPopup,
  handleSkip,
  patientName,
  setPatientName,
  pronouns,
  setPronouns,
  errorMessage,
  isLoading,
  handleSave,
  uploadProgress,
  transcript,
  summaries,
  uploadedFileUrl,
  setCurrentTab,
  isInSession,
  setTranscript,
  setSummaries,
  setIsProcessing,
}) => {
  const [editingSummary, setEditingSummary] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [summaryLength, setSummaryLength] = useState('100-200');
  const [sessionModel, setSessionModel] = useState('ChatGPT4');
  const [visitType, setVisitType] = useState('New patient');
  const [chosenSummary, setChosenSummary] = useState(null);
  const [processingError, setProcessingError] = useState(null);

  const handleStartNewSession = () => {
    setShowResults(false);
    setEditingSummary(null);
    setEditedText('');
    setIsEditingTranscript(false);
    setEditedTranscript('');
    // Reset any other necessary state
  };

  const handleSaveAndShowResults = async () => {
    await handleSave();
    setShowResults(true);
  };
  console.log(isLoading)

  if(isLoading){
    return <div >
        <CircularProgress color="secondary" size={100}/>
    </div>
  }

  const renderInitialView = () => (
    <div className="record-session-container">
      <div className="recording-content">
        {currentTab === 'record' ? (
          <>
            {!isRecording ? (
              <>
                <button
                  onClick={startRecording}
                  className="recording-button start"
                  disabled={isProcessing}
                >
                  <span className="button-icon">🎙️</span>
                  <span>Start Recording</span>
                </button>
                <h2 className="recording-title">Record session</h2>
                <p className="recording-description">
                  Streamline patient care with seamless<br />session recording
                </p>
              </>
            ) : (
              <>
                <button
                  onClick={stopRecording}
                  className="recording-button stop"
                  disabled={isProcessing}
                >
                  <span className="button-icon">⏸</span>
                  <span>Stop Recording</span>
                </button>
                <div className="timer-display">{formatTime(timer)}</div>
                <h2 className="recording-title">Recording...</h2>
                <p className="recording-description">
                  Stay on this screen while conversing<br />with your patient
                </p>
              </>
            )}
          </>
        ) : (
          <div className="upload-container">
            <div className="upload-icon">⬆️</div>
            <div className="upload-content">
              <p className="upload-title">Click or drag a file to upload</p>
              <p className="upload-subtitle">MP3, WAV, FLAC (max. 1GB)</p>
              <input
                type="file"
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="upload-button"
              >
                Select File
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderResultsView = () => (
    <div className="session-card">

      {/* Summary Options Section */}
      {(summaries?.summary1 || summaries?.summary2) && (
        <>
          {!editingSummary && (
            <>
              <h2 className="summary-options-title">
                {chosenSummary ? 'Selected Summary' : 'Summary Options'}
              </h2>
              <div className="summaries-container">
                {!chosenSummary ? (
                  // Show both summaries initially
                  <>
                    <div className="summary-box">
                      <h3>Summary 1</h3>
                      <p>{summaries.summary1}</p>
                      <button
                        className="prefer-button"
                        onClick={() => {
                          setChosenSummary('summary1');
                        }}
                      >
                        I prefer this summary
                      </button>
                    </div>
                    <div className="summary-box">
                      <h3>Summary 2</h3>
                      <p>{summaries.summary2}</p>
                      <button
                        className="prefer-button"
                        onClick={() => {
                          setChosenSummary('summary2');
                        }}
                      >
                        I prefer this summary
                      </button>
                    </div>
                  </>
                ) : (
                  // Show only the chosen summary
                  <div className="summary-boxx">
                    <h3>Selected Summary</h3>
                    <p>{summaries[chosenSummary]}</p>
                    <button
                      className="edit-button"
                      onClick={() => {
                        setEditingSummary(chosenSummary);
                        setEditedText(summaries[chosenSummary]);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="back-button"
                      onClick={() => setChosenSummary(null)}
                    >
                      Back
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {editingSummary && (
            <div className="editing-summary-container">
              <h2 className="summary-title">Edit Summary</h2>
              <textarea
                className="summary-textarea"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
              />
              <div className="button-container">
                <button
                  className="back-button"
                  onClick={() => {
                    setEditingSummary(null);
                    setEditedText('');
                  }}
                >
                  Back
                </button>
                <button
                  className="edit-confirm-button"
                  onClick={() => {
                    setSummaries({
                      ...summaries,
                      [editingSummary]: editedText
                    });
                    setEditingSummary(null);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Transcript Section */}
      <div className="transcript-section">
        <h2 className="transcript-title">Transcript</h2>
        <div className="transcript-box">
          {!isEditingTranscript ? (
            <>
              <p className="transcript-text">{transcript}</p>
              <button
                className="edit-button"
                onClick={() => {
                  setIsEditingTranscript(true);
                  setEditedTranscript(transcript);
                }}
              >
                Edit
              </button>
            </>
          ) : (
            <div className="editing-summary-container">
              <textarea
                className="summary-textarea"
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
              />
              <div className="button-container">
                <button
                  className="back-button"
                  onClick={() => {
                    setIsEditingTranscript(false);
                    setEditedTranscript('');
                  }}
                >
                  Back
                </button>
                <button
                  className="edit-confirm-button"
                  onClick={() => {
                    setTranscript(editedTranscript); // Update the main transcript
                    setIsEditingTranscript(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audio Section */}
      <AudioSection audioUrl={uploadedFileUrl} />
    </div>
  );

  return (
    <>
      {/* Patient Details Popup */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Manage Profile</h3>
              <button className="close-button" onClick={handleSkip}>×</button>
            </div>

            {currentStep === 1 ? (
              <>
                <h3 className="step-title">1. Patient details</h3>
                <div className="popup-form">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter patient name"
                      className="modern-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Pronouns</label>
                    <select
                      value={pronouns}
                      onChange={(e) => setPronouns(e.target.value)}
                      className="modern-select"
                    >
                      <option value="">Select pronouns</option>
                      <option value="He/Him">He/Him</option>
                      <option value="She/Her">She/Her</option>
                      <option value="They/Them">They/Them</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Visit type</label>
                    <select
                      value={visitType}
                      onChange={(e) => setVisitType(e.target.value)}
                      className="modern-select"
                    >
                      <option value="New patient">New patient</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Consultation">Consultation</option>
                    </select>
                  </div>
                </div>

                {errorMessage && (
                  <div className="popup-error">
                    {errorMessage}
                  </div>
                )}

                <div className="popup-footer">
                  <button
                    className="skip-button"
                    onClick={handleSkip}
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    className="save-button"
                    onClick={() => setCurrentStep(2)}
                    disabled={isProcessing}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="step-title">2. Session preferences</h3>
                <div className="popup-form">
                  <div className="form-group">
                    <label>Summary length</label>
                    <select
                      value={summaryLength}
                      onChange={(e) => setSummaryLength(e.target.value)}
                      className="modern-select"
                    >
                      <option value="50-100">50 - 100 words</option>
                      <option value="100-200">100 - 200 words</option>
                      <option value="200-300">200 - 300 words</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Select session models</label>
                    <select
                      value={sessionModel}
                      onChange={(e) => setSessionModel(e.target.value)}
                      className="modern-select"
                    >
                      <option value="ChatGPT4">ChatGPT4</option>
                      <option value="Google Gemini">Google Gemini</option>
                      <option value="ChatGPT4-0 Mini">ChatGPT4-0 Mini</option>
                    </select>
                  </div>
                </div>

                {errorMessage && (
                  <div className="popup-error">
                    {errorMessage}
                  </div>
                )}

                <div className="popup-footer">
                  <button
                    className="skip-button"
                    onClick={() => setCurrentStep(1)}
                    disabled={isProcessing}
                  >
                    Back
                  </button>
                  <button
                    className="save-button"
                    onClick={() => {
                      handleSaveAndShowResults({
                        summaryLength,
                        sessionModel,
                        visitType
                      });
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? `Processing ${uploadProgress}%` : 'Save'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      {isInSession && (transcript || uploadedFileUrl) ? renderResultsView() : renderInitialView()}
    </>
  );
};

export default SessionContent;