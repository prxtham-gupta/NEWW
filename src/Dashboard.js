import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import './App.css';
import SessionContent from './SessionContent';
import ProfileDropdown from './ProfileDropdown';
// Azure Storage configurations
const STORAGE_URL = 'https://humbigenai.blob.core.windows.net';
const CONTAINER = 'rawaudiofiles';
const SAS = 'sp=racwl&st=2025-01-15T10:18:17Z&se=2027-12-01T18:18:17Z&spr=https&sv=2022-11-02&sr=c&sig=tk9BrsVj4k3Ome18hK9GK7WnQuFcapCIh9QpzQg1sgo%3D';
// Demo data flag - set this to false when switching to real API
const DEMO_MODE = true;
// Demo data
const DEMO_TRANSCRIPT = `Patient Arison presents with generalized periodontitis type 3, grade B, characterized by deep probing depths, inflammation, and a periodontal abscess between teeth 20 to 23. Clinical examination reveals significant tooth mobility, furcation involvement, and generalized moderate to severe bone loss. Treatment options discussed include full-mouth laser periodontal therapy, traditional deep cleaning, and potential future orthodontic treatment. The patient is advised to schedule the laser treatment and consider taking 1-2 days off work post-procedure. Follow-up is recommended in 6-9 months.`;

const DEMO_SUMMARIES = {
  summary1: `Diagnosis: Type 3 Grade B periodontitis with deep probing depths, inflammation, and periodontal abscess (teeth 20-23). Signs include significant tooth mobility, furcation involvement, and generalized moderate-severe bone loss. Recommended treatment plan: full-mouth laser periodontal therapy with possible orthodontic intervention. Recovery period: 1-2 days. Follow-up scheduled for 6-9 months post-procedure.`,
  summary2: `You have been diagnosed with advanced gum disease affecting multiple teeth, particularly in the back of your mouth. We found deep pockets in your gums, inflammation, and some bone loss. We recommend laser therapy to treat the gum disease, which is less invasive than traditional surgery. You may need 1-2 days to recover after the procedure. We'll need to see you back in 6-9 months to check your progress.`
};
const Dashboard = ({ user: initialUser }) => {
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
  const [transcript, setTranscript] = useState('');
  const [summaries, setSummaries] = useState({ summary1: '', summary2: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [summaryTranscript, setSummaryTranscript] = useState(false);
  const [user, setUser] = useState("");
  const [recordedFileURL, setRecordedFileUrl] = useState(null);
  const [recordedFile, setRecordedFile] = useState(null);
  const [isLoading,setIsLoading] = useState(false);

  // New state for tracking if we're in a session
  const [isInSession, setIsInSession] = useState(false);
  // Refs
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  useEffect(()=>{
    setUser(initialUser);
    if(transcript===''){
      setSummaries(DEMO_SUMMARIES);
    }

  },[])
  
  console.log(user);

  // Initialize OpenAI
  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

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

  // Recording Functions
  // const startRecording = async () => {
  //   try {
  //     setErrorMessage('');
  //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  //     mediaRecorderRef.current = new MediaRecorder(stream, {
  //       mimeType: 'audio/webm;codecs=opus'
  //     });

  //     chunksRef.current = [];

  //     mediaRecorderRef.current.ondataavailable = (e) => {
  //       if (e.data.size > 0) {
  //         chunksRef.current.push(e.data);
  //       }
  //     };

  //     mediaRecorderRef.current.onstop = () => {
  //       const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
  //       setAudioBlob(blob);
  //       setShowPopup(true);
  //     };

  //     mediaRecorderRef.current.start(1000);
  //     setIsRecording(true);
  //     const id = setInterval(() => setTimer(prev => prev + 1), 1000);
  //     setIntervalId(id);
  //   } catch (error) {
  //     console.error('Error starting recording:', error);
  //     setErrorMessage('Could not access microphone. Please check your permissions.');
  //   }
  // };

  // const stopRecording = () => {
  //   if (mediaRecorderRef.current && isRecording) {
  //     mediaRecorderRef.current.stop();
  //     mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
  //     setIsRecording(false);
  //     clearInterval(intervalId);
  //     setIntervalId(null);
  //   }
  // };

  const startRecording = async () => {
    try {
      setErrorMessage('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);

        // Generate a file name based on timestamp
        const fileName = `recording_${new Date().toISOString()}.webm`; // Example file name with timestamp

        // Save the blob and URL to state or a variable
        const recordedUrl = URL.createObjectURL(blob);
        setRecordedFile(blob);
        setRecordedFileUrl(recordedUrl);

        console.log(blob)
        console.log(recordedUrl);
        console.log(fileName);

        // Optionally, create a temporary download link (for testing)
        const a = document.createElement('a');
        a.href = recordedUrl;
        a.download = fileName;
        a.click();

        // Convert the recorded audio to text
        const textResult = await audioToText(recordedUrl);
        console.log(textResult);

        // Show the popup with the audio result (or any other UI update)
        setShowPopup(true);
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);

      // Set interval for recording timer
      const id = setInterval(() => setTimer(prev => prev + 1), 1000);
      setIntervalId(id);
    } catch (error) {
      console.error('Error starting recording:', error);
      setErrorMessage('Could not access microphone. Please check your permissions.');
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      // Stop the recording
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

      // Reset state
      setIsRecording(false);
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  



  // Upload Functions
  // const uploadToAzure = async (blob, fileName) => {
  //   // Make sure SAS token includes leading '?'
  //   const sasToken = SAS.startsWith('?') ? SAS : `?${SAS}`;
  //   const url = `${STORAGE_URL}/${CONTAINER}/${fileName}${sasToken}`;

  //   try {
  //     const xhr = new XMLHttpRequest();
  //     xhr.open('PUT', url, true);

  //     // Add all required headers
  //     xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
  //     xhr.setRequestHeader('x-ms-version', '2020-04-08');
  //     xhr.setRequestHeader('Content-Type', 'audio/webm');
  //     xhr.setRequestHeader('x-ms-date', new Date().toUTCString());

  //     return new Promise((resolve, reject) => {
  //       xhr.upload.onprogress = (e) => {
  //         if (e.lengthComputable) {
  //           const percentComplete = (e.loaded / e.total) * 100;
  //           setUploadProgress(Math.round(percentComplete));
  //         }
  //       };

  //       xhr.onload = () => {
  //         if (xhr.status >= 200 && xhr.status < 300) {
  //           resolve(`${STORAGE_URL}/${CONTAINER}/${fileName}`);
  //         } else {
  //           console.error('Upload failed response:', xhr.responseText);
  //           reject(new Error(`Upload failed with status: ${xhr.status}`));
  //         }
  //       };

  //       xhr.onerror = () => {
  //         console.error('Upload error:', xhr.responseText);
  //         reject(new Error('Upload failed'));
  //       };

  //       xhr.send(blob);
  //     });
  //   } catch (error) {
  //     console.error('Error in upload:', error);
  //     throw error;
  //   }
  // };

  const audioToText = async (file) => {
    setIsLoading(true);
    const file_name = file?.name;
    const url = `http://127.0.0.1:8005/audio2text/?file_name=${file_name}`;
    console.log(file);


    try {
      const response = await fetch(url, {
        method: "GET",
      });

      if (response.ok) {
        // Get the JSON response from the server
        const result = await response.json();
        console.log(result);  // Log or handle the result from the server
        setTranscript(result?.transcript);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        return { error: "Failed to retrieve file" };
      }
    } catch (error) {
      setIsLoading(false);

      return { error: error.message };
    }
  };

  const summarizeAudio = async (file) => {
    setIsLoading(true);

    const url = "http://localhost:8005/summarize-audio/";
  
    // Create FormData to send the file
    const formData = new FormData();
    formData.append("file", file, file.name); // Append file with its name
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "accept": "application/json",
        },
        body: formData,
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log(result); // Log the result
        setSummaries({ summary1: result?.Summary1, summary2: result?.summary2 })
        setIsLoading(false);

        return result;
      } else {
        console.error("Failed to summarize audio");
        setIsLoading(false);
        return { error: "Failed to summarize audio" };
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error:", error.message);
      return { error: error.message };
    }
  };
  
  
  

  // Example usage: File input to trigger upload
  const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Extract file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'txt') {
      console.log("TXT file detected. Running summarizeAudio function...");
      summarizeAudio(file); // Call summarizeAudio for .txt files
    } else {
      console.log("Non-TXT file detected. Running both functions...");
      audioToText(file); // Call audioToText for other file types
      summarizeAudio(file); // Call summarizeAudio for other file types
    }

    setSelectedFile(file);
    setShowPopup(true);
  }
};


  // // HTML input for file upload (for testing)
  // const fileInput = document.createElement("input");
  // fileInput.type = "file";
  // fileInput.accept = "audio/*";  // Only accept audio files
  // fileInput.onchange = handleFileUpload;
  // fileInput.click();


  // const handleFileChange = async (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     if (file.size > 1024 * 1024 * 1024) { // 1GB limit
  //       setErrorMessage('File size exceeds 1GB. Please choose a smaller file.');
  //       return;
  //     }
  //     setSelectedFile(file);
  //     setShowPopup(true);
  //   }
  // };

  // Process Functions
  const processContent = async (audioContent, isFile = false) => {
    setIsProcessing(true);
    setErrorMessage('');
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Set demo data

      // Demo session data
      const sessionData = {
        name: patientName || 'Demo Patient',
        pronouns: pronouns,
        timestamp: new Date().toLocaleString(),
        duration: isFile ? null : formatTime(timer),
        audioUrl: null, // No actual audio URL in demo mode
        transcript: DEMO_TRANSCRIPT,
        summaries: DEMO_SUMMARIES
      };

      const savedSessions = JSON.parse(localStorage.getItem('sessions') || '[]');
      savedSessions.unshift(sessionData);
      localStorage.setItem('sessions', JSON.stringify(savedSessions));


      // else {
      // 1. Upload to Azure

      //   const fileName = `${isFile ? 'upload' : 'recording'}-${Date.now()}.webm`;
      //   const audioUrl = await uploadToAzure(audioContent, fileName);
      //   setUploadedFileUrl(audioUrl);

      //   // 2. Transcribe with Whisper
      //   const formData = new FormData();
      //   formData.append('file', audioContent);
      //   formData.append('model', 'whisper-1');

      //   const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      //     method: 'POST',
      //     headers: {
      //       'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      //     },
      //     body: formData
      //   });

      //   if (!transcriptionResponse.ok) {
      //     throw new Error('Transcription failed');
      //   }

      //   const transcriptionData = await transcriptionResponse.json();
      //   setTranscript(transcriptionData.text);

      //   // 3. Generate summaries
      //   const completion = await openai.chat.completions.create({
      //     messages: [{
      //       role: "user",
      //       content: `Please provide two summaries of this medical transcription:
      //       ${transcriptionData.text}

      //       Summary 1: A detailed medical summary including key findings and recommendations
      //       Summary 2: A simplified, patient-friendly explanation`
      //     }],
      //     model: "gpt-3.5-turbo",
      //   });

      //   const summaryResponse = completion.choices[0].message.content;
      //   const [summary1, summary2] = summaryResponse.split('Summary 2:');

      //   setSummaries({
      //     summary1: summary1.replace('Summary 1:', '').trim(),
      //     summary2: summary2.trim()
      //   });

      //   // 4. Save session


      //   const sessionData = {
      //     name: patientName || 'Unnamed Session',
      //     pronouns: pronouns,
      //     timestamp: new Date().toLocaleString(),
      //     duration: isFile ? null : formatTime(timer),
      //     audioUrl,
      //     transcript: transcriptionData.text,
      //     summaries: {
      //       summary1: summary1.replace('Summary 1:', '').trim(),
      //       summary2: summary2.trim()
      //     }
      //   };

      //   const savedSessions = JSON.parse(localStorage.getItem('sessions') || '[]');
      //   savedSessions.unshift(sessionData);
      //   localStorage.setItem('sessions', JSON.stringify(savedSessions));
      // }
      // 5. Cleanup
      setShowPopup(false);
      setPatientName('');
      setPronouns('');
      setTimer(0);
      setSelectedFile(null);
      setAudioBlob(null);
      window.dispatchEvent(new Event('sessionsUpdated'));

    } catch (error) {
      console.error('Processing error:', error);
      setErrorMessage('Failed to process content. Please try again.');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  // Handle Save/Skip
  // Modified handleSave function
  const handleSave = async () => {
    try {
      if (currentTab === 'record' && audioBlob) {
        await processContent(audioBlob, false);
      } else if (currentTab === 'upload' && selectedFile) {
        await processContent(selectedFile, true);
      }
      setSummaryTranscript(true);
      setIsInSession(true); // Set session state to true after successful save
      setShowPopup(false); // Close the popup
    } catch (error) {
      console.error('Error in handleSave:', error);
      setErrorMessage('Failed to save session. Please try again.');
    }
  };

  // Add handleStartNewSession function
  const handleStartNewSession = () => {
    setIsInSession(false);
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
  };

  const handleSkip = () => {
    setShowPopup(false);
    setPatientName('');
    setPronouns('');
    setTimer(0);
    setSelectedFile(null);
    setAudioBlob(null);
    setErrorMessage('');
    setUploadProgress(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [intervalId, isRecording]);

  return (
    <div className="dashboard">
      {/* Top Row: Welcome and Profile */}
      <div className="dashboard-top">
        <div className="welcome-message-container">
          <div className="welcome-message">
            <h2>Welcome back, {user?.fullName || 'User'}!</h2>
          </div>
        </div>
        <ProfileDropdown
          fullName={user?.fullName || 'User'}
          title={user?.title}
          onProfileUpdate={handleProfileUpdate}
        />
      </div>


      {/* Tabs */}
      <div className="dashboard-tabs">
        {!isInSession ? (
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


      <SessionContent
        summaryTranscript={summaryTranscript}
        currentTab={currentTab}
        isRecording={isRecording}
        isProcessing={isProcessing}
        stopRecording={stopRecording}
        startRecording={startRecording}
        formatTime={formatTime}
        timer={timer}
        handleFileChange={handleFileChange}
        showPopup={showPopup}
        handleSkip={handleSkip}
        patientName={patientName}
        setPatientName={setPatientName}
        pronouns={pronouns}
        setPronouns={setPronouns}
        errorMessage={errorMessage}
        handleSave={handleSave}
        uploadProgress={uploadProgress}
        transcript={transcript}
        setTranscript={setTranscript}
        summaries={summaries}
        uploadedFileUrl={uploadedFileUrl}
        setCurrentTab={setCurrentTab}
        isInSession={isInSession}
        handleStartNewSession={handleStartNewSession}
        setSummaries={setSummaries}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Dashboard;