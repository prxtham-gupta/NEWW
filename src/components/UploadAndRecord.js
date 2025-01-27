import React, { useContext, useRef, useState } from 'react'
import { Upload, Check } from "lucide-react"
import { CircularProgress } from '@mui/material';
import SessionContext from '../context/SessionContext';
import '../App.css'
import '../file-upload.css'


const UploadAndRecord = ({setAudioFileUrl,setPatient, currentTab, formatTime, setIsInSession, transcript, setTranscript, summaries, setSummaries }) => {
    const [errorMessage, setErrorMessage] = useState('');
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const [audioBlob, setAudioBlob] = useState(null);
    const [recordedFile, setRecordedFile] = useState(null);
    const [recordedFileURL, setRecordedFileUrl] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [timer, setTimer] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [patientName, setPatientName] = useState('');
    const [pronouns, setPronouns] = useState('');
    const [visitType, setVisitType] = useState('New patient');
    const [summaryLength, setSummaryLength] = useState('100-200');
    const [sessionModel, setSessionModel] = useState('ChatGPT4');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState(null);

    const context = useContext(SessionContext);
    const { allSessions} = context;

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    setUploadedFile(file)
    setShowPopup(true);
  }

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file){ 
        setUploadedFile(file)
        setShowPopup(true)
    }

  }


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

                // Optionally, create a temporary download link (for testing)
                const a = document.createElement('a');
                a.href = recordedUrl;
                a.download = fileName;
                a.click();

                if (blob) {
                    console.log("start saving")
                    const fileName = `recording_${new Date().toISOString()}.webm`;
                    await saveToFolder(blob, fileName);
                    console.log("end saving")

                }

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
    const saveToFolder = async (blob, fileName) => {
        try {
            // Ask the user to select a directory where the file will be saved
            const handle = await window.showDirectoryPicker();
            
            // Create a file in the selected directory
            const fileHandle = await handle.getFileHandle(fileName, { create: true });
            const writableStream = await fileHandle.createWritable();
    
            // Write the blob (audio file) to the file
            await writableStream.write(blob);
            await writableStream.close();
    
            console.log('File saved successfully!');
        } catch (error) {
            console.error('Error saving the file:', error);
        }
    };

    const audioToText = async (file) => {
        const file_name = file?.name;
        const url = `https://ai-summary-backend-bedjgqd6cddvgef4.eastus2-01.azurewebsites.net/audio2text/?file_name=${file_name}`;


        try {
            const response = await fetch(url, {
                method: "GET",
            });

            if (response.ok) {
                // Get the JSON response from the server
                const result = await response.json();
                setTranscript(result?.transcript);
            } else {
                return { error: "Failed to retrieve file" };
            }
        } catch (error) {
            return { error: error.message };
        }
    };

    const summarizeAudio = async (file) => {
        const url = "https://ai-summary-backend-bedjgqd6cddvgef4.eastus2-01.azurewebsites.net/summarize-audio/";

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
                setSummaries({ summary1: result?.Summary1, summary2: result?.summary2 })
                return result;
            } else {
                console.error("Failed to summarize audio");
                return { error: "Failed to summarize audio" };
            }
        } catch (error) {
            console.error("Error:", error.message);
            return { error: error.message };
        }
    };

    const handleSkip = () => {
        setShowPopup(false);
        setPatientName('');
        setPronouns('');
        setTimer(0);
        setUploadedFile(null);
        setAudioBlob(null);
        setErrorMessage('');
        setUploadProgress(0);
    };

    const handleSaveAndShowResults = async () => {
        setShowPopup(false)
        setIsLoading(true)
        if (currentTab === "record") {
            setIsLoading(false);
        }
        else {
            const file = uploadedFile
            if (file) {
                // Extract file extension
                const fileExtension = file.name.split('.').pop().toLowerCase();

                if (fileExtension === 'txt') {
                    await summarizeAudio(file); // Call summarizeAudio for .txt files
                    const reader = new FileReader(); // Create a FileReader object
                    reader.onload = (e) => {
                        const content = e.target.result; // Get the file content
                        setTranscript(content); // Store the content as string in state
                    };

                    reader.readAsText(file);
                } else {
                    setAudioFileUrl(URL.createObjectURL(file))
                    await audioToText(file); // Call audioToText for other file types
                    await summarizeAudio(file); // Call summarizeAudio for other file types
                }
            }
            setPatient({patientName,pronouns});
            setIsLoading(false);
            setIsInSession(false);
        }
    };


    return (
        <div className="record-upload-container">
            {!isLoading && <div className="recording-content">
                {currentTab === 'record' ? (
                    <>
                        {!isRecording ? (
                            <>
                                <button
                                    onClick={startRecording}
                                    className="recording-button start"
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
                    // <div className="upload-container">
                    //     <div className="upload-icon">⬆️</div>
                    //     <div className="upload-content">
                    //         <p className="upload-title">Click or drag a file to upload</p>
                    //         <p className="upload-subtitle">MP3, WAV, FLAC (max. 1GB)</p>
                    //         <input
                    //             type="file"
                    //             onChange={handleFileChange}
                    //             accept="audio/*"
                    //             className="hidden"
                    //             id="file-input"
                    //         />
                    //         <label
                    //             htmlFor="file-input"
                    //             className="upload-button"
                    //         >
                    //             Select File
                    //         </label>
                    //     </div>
                    // </div>
                    <div className="container">
                        <div className="upload-wrapper">
                            <div className="upload-box" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                                <div className="icon-wrapper">
                                    <Upload className="upload-icon" />
                                </div>
                                <h3 className="upload-title">Click or drag a file to upload</h3>
                                <p className="upload-subtitle">TXT, MP3, WAV, FLAC (max. 200MB per file)</p>
                                <input
                                    type="file"
                                    className="file-input"
                                    id="file-upload"
                                    onChange={handleFileInput}
                                    accept=".txt,.mp3,.wav,.flac,.m4a"
                                />
                                <label htmlFor="file-upload" className="file-label" />
                            </div>

                            {uploadedFile && (
                                <div className="progress-box">
                                    <div className="progress-content">
                                        <Check className="check-icon" />
                                        <div className="progress-info">
                                            <div className="file-name">Uploaded {uploadedFile.name}</div>
                                            <div className="progress-bar-wrapper">
                                                <div className="progress-bar" />
                                            </div>
                                        </div>
                                        <span className="progress-percentage">100%</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>}
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
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="save-button"
                                        onClick={() => setCurrentStep(2)}
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
                                    >
                                        Back
                                    </button>
                                    <button
                                        className="save-button"
                                        onClick={() => handleSaveAndShowResults()}
                                    > Save
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            {isLoading && <CircularProgress />}
        </div>
    )
}
export default UploadAndRecord;