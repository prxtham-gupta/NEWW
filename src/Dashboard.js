import React, { useState, useRef, useEffect, useContext } from 'react';
import OpenAI from 'openai';
import './App.css';
import SessionContent from './SessionContent';
import ProfileDropdown from './ProfileDropdown';
import SessionContext from './context/SessionContext';
import LeftSection from './components/LeftSection';



const Dashboard = () => {
  // State Management
  const [currentTab, setCurrentTab] = useState('record');
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [summaryTranscript, setSummaryTranscript] = useState(false);
  // const [user, setUser] = useState("");
  const [recordedFileURL, setRecordedFileUrl] = useState(null);
  const [recordedFile, setRecordedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  // New state for tracking if we're in a session
  const [isInSession, setIsInSession] = useState(true);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const context = useContext(SessionContext);
  const { selectedSessionId,setSelectedSessionId, user, setUser } = context;
  const [transcript, setTranscript] = useState("")
  const [summaries, setSummaries] = useState({ summary1: "", summary2: "" });

  // Helper Functions
  const getInitials = (fullName) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .join('');
  };
  const handleProfileUpdate = (updatedData) => {
    setUser(prevUser => ({
      ...prevUser,
      fullName: updatedData.name,
      title: updatedData.title
    }));
  };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  // Add handleStartNewSession function
  const handleStartNewSession = () => {
    setIsInSession(true);
    setCurrentTab('record');
    setSummaryTranscript(false);
    setUploadedFileUrl('');
    setAudioBlob(null);
    setSelectedFile(null);
    setPatientName('');
    setPronouns('');
    setTimer(0);
    setErrorMessage('');
    setUploadProgress(0);
    setSelectedSessionId(null)
  };


  



  return (
    <div className="dashboard">
      <div className="left-section-wrapper">
        <LeftSection />
      </div>
      <div className='right-section-wrapper'>
        <div className='dashboard-header'>
          {/* Top Row: Welcome and Profile */}
          <div className="dashboard-top">
            <div className="welcome-message-container">
              <div className="welcome-message">
                <h2>Welcome back, {user?.fullName || 'User'}!</h2>
              </div>
            </div>
            <ProfileDropdown
              user={user}
              onProfileUpdate={handleProfileUpdate}
            />
          </div>


          {/* Tabs */}
          <div className="dashboard-tabs">
            {isInSession ? (
              // Initial tabs for recording/uploading
              <>
                <div
                  className={`tab ${currentTab === 'record' ? 'active' : ''}`}
                  onClick={() => setCurrentTab('record')}
                >
                  Record session
                </div>
                <div
                  className={`tab ${currentTab === 'upload' ? 'active' : ''}`}
                  onClick={() => setCurrentTab('upload')}
                >
                  Upload session
                </div>
              </>
            ) : (
              // Create new session tab
              <div
                className="tab active"
                onClick={handleStartNewSession}
              >
                Create new session
              </div>
            )}
          </div>

        </div>

        <SessionContent
          currentTab={currentTab}
          formatTime={formatTime}
          isInSession={isInSession}
          setIsInSession={setIsInSession}
        />
      </div>
    </div>
  );
};

export default Dashboard;