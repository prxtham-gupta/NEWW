import React, { useContext, useEffect, useState } from 'react';
import UploadAndRecord from './components/UploadAndRecord';
import SummaryTranscriptAndAudio from './components/SummaryTranscriptAndAudio';
import './App.css'
import SessionContext from './context/SessionContext';

const SessionContent = ({
  currentTab,
  formatTime,
  isInSession,
  setIsInSession
}) => {
  const [patient,setPatient] = useState(null);
  const [audioFileUrl,setAudioFileUrl] = useState(null);
  const [transcript, setTranscript] = useState("");

  const [summaries, setSummaries] = useState({ summary1: "", summary2: "" });
  const context = useContext(SessionContext);
  const { selectedSessionId,allSessions} = context;
  console.log(selectedSessionId)

  useEffect(()=>{
    if(selectedSessionId!=null){
      setTranscript(allSessions[selectedSessionId]?.transcript);
      setSummaries({ summary1:allSessions[selectedSessionId]?.summary, summary2:allSessions[selectedSessionId]?.summary })
      setAudioFileUrl(allSessions[selectedSessionId]?.audioUrl)
      setIsInSession(false)
    }
  },[selectedSessionId])

  return (
    <div className='session-content'>
  
      {/* Main Content */}
      {!isInSession ? 
      <SummaryTranscriptAndAudio audioFileUrl={audioFileUrl} patient={patient} setSummaries={setSummaries} summaries={summaries} transcript={transcript} setTranscript={setTranscript} />  : 
      <UploadAndRecord setAudioFileUrl={setAudioFileUrl} setPatient={setPatient} currentTab={currentTab}  formatTime={formatTime} setIsInSession={setIsInSession} transcript={transcript} setTranscript={setTranscript} summaries={summaries} setSummaries={setSummaries} />}
    </div>
  );
};

export default SessionContent;