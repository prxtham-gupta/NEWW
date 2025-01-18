import React, { useState, useCallback } from 'react';
import '../App.css';
import OpenAI from 'openai';

// Azure Storage configurations
const AZURE_STORAGE_URL = 'https://humbigenai.blob.core.windows.net/rawaudiofiles';
const CONTAINER_NAME = 'rawaudiofiles';
const SAS_TOKEN = 'sv=2022-11-02&ss=bfqt&srt=co&sp=rwdlacupiytfx&se=2025-01-14T17:42:05Z&st=2025-01-14T09:42:05Z&spr=https&sig=M24hAovQuT9DTiSjiRnfeyy5lNhlRxIilNwd4mgfEF0%3D';

const UploadSession = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [transcript, setTranscript] = useState('');
  const [summaries, setSummaries] = useState({ summary1: '', summary2: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 1GB)
      if (file.size > 1024 * 1024 * 1024) {
        alert('File size exceeds 1GB. Please choose a smaller file.');
        return;
      }
      setSelectedFile(file);
      setShowPopup(true);
    }
  };

  const uploadToAzure = async (file, fileName) => {
    const blobUrl = `${AZURE_STORAGE_URL}/${CONTAINER_NAME}/${fileName}?${SAS_TOKEN}`;
    
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', blobUrl, true);
      xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
      xhr.setRequestHeader('Content-Type', file.type);

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(progress));
        }
      };

      return new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 201 || xhr.status === 200) {
            resolve(`${AZURE_STORAGE_URL}/${CONTAINER_NAME}/${fileName}`);
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(file);
      });
    } catch (error) {
      console.error('Error uploading to Azure:', error);
      throw error;
    }
  };

  const processFile = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    try {
      // 1. Upload file to Azure
      const fileName = `upload-${Date.now()}-${selectedFile.name}`;
      const fileUrl = await uploadToAzure(selectedFile, fileName);
      setUploadedFileUrl(fileUrl);

      // 2. Transcribe with Whisper
      const formData = new FormData();
      formData.append('file', selectedFile);
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

      // 3. Generate summaries with GPT
      const completion = await openai.chat.completions.create({
        messages: [{
          role: "user",
          content: `Please provide two summaries of this medical transcription:
            ${transcriptionData.text}
            
            Summary 1: A detailed medical summary including key findings and recommendations
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

      // 4. Save session data
      const sessionData = {
        name: patientName || 'Unnamed Session',
        pronouns: pronouns,
        timestamp: new Date().toLocaleString(),
        audio_url: fileUrl,
        transcript: transcriptionData.text,
        summaries: {
          summary1: summary1.replace('Summary 1:', '').trim(),
          summary2: summary2.trim()
        }
      };

      const existingSessions = JSON.parse(localStorage.getItem('sessions')) || [];
      localStorage.setItem('sessions', JSON.stringify([sessionData, ...existingSessions]));
      
      // Trigger update event for LeftSection
      window.dispatchEvent(new Event('sessionsUpdated'));
      
      setShowPopup(false);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleSkip = () => {
    setShowPopup(false);
    setPatientName('');
    setPronouns('');
  };

  const handleDownload = () => {
    if (uploadedFileUrl) {
      const a = document.createElement('a');
      a.href = uploadedFileUrl;
      a.download = selectedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="upload-session-container">
      <div className="upload-box">
        <div className="upload-icon">⬆️</div>
        <div className="upload-text">
          <p>Click or drag a file to upload</p>
          <p className="file-types">MP3, WAV, FLAC (max. 1GB)</p>
          <input
            type="file"
            onChange={handleFileChange}
            accept="audio/*"
            style={{ display: 'none' }}
            id="file-input"
          />
          <label htmlFor="file-input" className="upload-button">
            Select File
          </label>
        </div>
      </div>

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
            <div className="popup-footer">
              <button className="skip-button" onClick={handleSkip}>Skip</button>
              <button 
                className="save-button" 
                onClick={processFile}
                disabled={isProcessing}
              >
                {isProcessing ? `Processing ${uploadProgress}%` : 'Save'}
              </button>
            </div>
          </div>
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
          
          {uploadedFileUrl && (
            <div className="audio-container">
              <audio controls src={uploadedFileUrl} className="audio-player" />
              <button onClick={handleDownload} className="download-button">
                Download Recording
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadSession;