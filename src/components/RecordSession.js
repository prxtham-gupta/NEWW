import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';
import '../App.css';

// Azure Storage configurations
const AZURE_STORAGE_URL = 'https://humbigenai.blob.core.windows.net/rawaudiofiles';
const CONTAINER_NAME = 'rawaudiofiles';
const SAS_TOKEN = 'sv=2022-11-02&ss=bfqt&srt=co&sp=rwdlacupiytfx&se=2025-01-14T17:42:05Z&st=2025-01-14T09:42:05Z&spr=https&sig=M24hAovQuT9DTiSjiRnfeyy5lNhlRxIilNwd4mgfEF0%3D';

// Replace the DEMO_TRANSCRIPT and DEMO_SUMMARIES constants
const DEMO_TRANSCRIPT = `Patient Arison presents with generalized periodontitis type 3, grade B, characterized by deep probing depths, inflammation, and a periodontal abscess between teeth 20 to 23. Clinical examination reveals significant tooth mobility, furcation involvement, and generalized moderate to severe bone loss. Treatment options discussed include full-mouth laser periodontal therapy, traditional deep cleaning, and potential future orthodontic treatment. The patient is advised to schedule the laser treatment and consider taking 1-2 days off work post-procedure. Follow-up is recommended in 6-9 months.`;

const DEMO_SUMMARIES = {
  summary1: `Patient Arison presents with generalized periodontitis type 3, grade B, characterized by deep probing depths, inflammation, and a periodontal abscess between teeth 20 to 23. Clinical examination reveals significant tooth mobility, furcation involvement, and generalized moderate to severe bone loss. Treatment options discussed include full-mouth laser periodontal therapy, traditional deep cleaning, and potential future orthodontic treatment. The patient is advised to schedule the laser treatment. Treatment options discussed include full-mouth laser periodontal therapy, traditional deep cleaning, and potential future orthodontic treatment. The patient is advised to schedule the laser treatment.`,
  summary2: `Patient Arison presents with generalized periodontitis type 3, grade B, characterized by deep probing depths, inflammation, and a periodontal abscess between teeth 20 to 23. Clinical examination reveals significant tooth mobility, furcation involvement, and generalized moderate to severe bone loss. Treatment options discussed include full-mouth laser periodontal therapy, traditional deep cleaning, and potential future orthodontic treatment. The patient is advised to schedule the laser treatment. Treatment options discussed include full-mouth laser periodontal therapy, traditional deep cleaning, and potential future orthodontic treatment. The patient is advised to schedule the laser treatment.`
};

const RecordSession = ({ demoMode = false, uploadedFile = null }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [summaries, setSummaries] = useState({ summary1: '', summary2: '' });
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  useEffect(() => {
    if (uploadedFile) {
      setAudioBlob(uploadedFile);
      setShowPopup(true);
    }
  }, [uploadedFile]);

  // Upload to Azure function
  const uploadToAzure = async (audioBlob, fileName) => {
    const blobUrl = `${AZURE_STORAGE_URL}/${CONTAINER_NAME}/${fileName}?${SAS_TOKEN}`;
    
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', blobUrl, true);
      xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
      xhr.setRequestHeader('Content-Type', 'audio/webm');

      return new Promise((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(`${AZURE_STORAGE_URL}/${CONTAINER_NAME}/${fileName}`);
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(audioBlob);
      });
    } catch (error) {
      console.error('Error uploading to Azure:', error);
      throw error;
    }
  };

  // Start recording function
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setShowPopup(true);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setErrorMessage('Could not access microphone. Please check your permissions.');
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Process recording function
  const processRecording = async () => {
    setIsProcessing(true);
    try {
      if (demoMode) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setTranscript(DEMO_TRANSCRIPT);
        setSummaries(DEMO_SUMMARIES);

        const sessionData = {
          name: patientName || 'Demo Patient',
          timestamp: new Date().toLocaleString(),
          duration: `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`,
          pronouns: pronouns,
          transcript: DEMO_TRANSCRIPT,
          ...DEMO_SUMMARIES
        };

        const existingSessions = JSON.parse(localStorage.getItem('sessions')) || [];
        localStorage.setItem('sessions', JSON.stringify([sessionData, ...existingSessions]));
      } else {
        const fileName = `recording-${Date.now()}.webm`;
        const audioUrl = await uploadToAzure(audioBlob, fileName);

        const formData = new FormData();
        formData.append('file', audioBlob);
        formData.append('model', 'whisper-1');
        
        const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
          body: formData
        });
        
        const transcriptionData = await transcriptionResponse.json();
        setTranscript(transcriptionData.text);

        const completion = await openai.chat.completions.create({
          messages: [{ 
            role: "user", 
            content: `Please provide two summaries of this medical transcription:
              ${transcriptionData.text}
              
              Summary 1: A detailed medical summary with key findings
              Summary 2: A simplified, patient-friendly explanation`
          }],
          model: "gpt-3.5-turbo",
        });

        const summaryResponse = completion.choices[0].message.content;
        const [summary1, summary2] = summaryResponse.split('Summary 2:');
        
        setSummaries({
          summary1: summary1.replace('Summary 1:', '').trim(),
          summary2: summary2.trim()
        });

        const sessionData = {
          name: patientName || 'Unnamed Session',
          timestamp: new Date().toLocaleString(),
          duration: uploadedFile ? null : `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`,
          pronouns: pronouns,
          audio_url: audioUrl,
          transcript: transcriptionData.text,
          summaries: {
            summary1: summary1.replace('Summary 1:', '').trim(),
            summary2: summary2.trim()
          }
        };

        const existingSessions = JSON.parse(localStorage.getItem('sessions')) || [];
        localStorage.setItem('sessions', JSON.stringify([sessionData, ...existingSessions]));
      }

      window.dispatchEvent(new Event('sessionsUpdated'));
      setShowPopup(false);
      resetForm();
    } catch (error) {
      console.error('Error processing recording:', error);
      setErrorMessage('Failed to process recording. Please try again.');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  // Reset form
  const resetForm = () => {
    setPatientName('');
    setPronouns('');
    setAudioBlob(null);
    setTranscript('');
    setSummaries({ summary1: '', summary2: '' });
    setRecordingTime(0);
    setErrorMessage('');
  };

  // Handle skip
  const handleSkip = () => {
    setShowPopup(false);
    resetForm();
  };

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="record-session-container">
      {!uploadedFile && (
        <div className="recording-controls">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`recording-button ${isRecording ? 'stop' : 'start'}`}
            disabled={isProcessing}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          {isRecording && (
            <span className="recording-time">
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>
      )}

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Add patient details</h3>
              <button className="close-button" onClick={handleSkip}>×</button>
            </div>
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
            </div>

            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}

            <div className="popup-footer">
              <button 
                className="skip-button" 
                onClick={handleSkip}
                disabled={isProcessing}
              >
                Skip
              </button>
              <button 
                className="save-button" 
                onClick={processRecording}
                disabled={isProcessing}
              >
                {isProcessing ? `Processing ${uploadProgress}%` : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="session-card">
          <p className="processing-message">Processing recording...</p>
        </div>
      )}

      {(transcript || summaries.summary1 || summaries.summary2) && (
        <div className="session-card">
          {transcript && (
            <>
              <h2 className="card-title">Transcript</h2>
              <p className="transcript-text">{transcript}</p>
            </>
          )}
          
          {(summaries.summary1 || summaries.summary2) && (
            <>
              <h2 className="card-title">Summary options</h2>
              <div className="summaries-container">
                <div className="summary-box">
                  <h3>Detailed Medical Summary</h3>
                  <p>{summaries.summary1}</p>
                </div>
                <div className="summary-box">
                  <h3>Patient-Friendly Summary</h3>
                  <p>{summaries.summary2}</p>
                </div>
              </div>
            </>
          )}

          {audioBlob && (
            <div className="audio-container">
              <audio controls src={URL.createObjectURL(audioBlob)} className="audio-player" />
              <button 
                className="download-button"
                onClick={() => {
                  const url = URL.createObjectURL(audioBlob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `session-recording-${Date.now()}.webm`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                Download Recording
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecordSession;