import React, { useContext, useState } from 'react'
import AudioSection from '../AudioSection';
import ReactMarkdown from 'react-markdown';
import SessionContext from '../context/SessionContext';

import '../App.css'



const SummaryTranscriptAndAudio = ({audioFileUrl ,patient, summaries, transcript, setSummaries, setTranscript }) => {

    const [editingSummary, setEditingSummary] = useState(null);
    const [editedText, setEditedText] = useState('');
    const [isEditingTranscript, setIsEditingTranscript] = useState(false);
    const [editedTranscript, setEditedTranscript] = useState('');
    const [chosenSummary, setChosenSummary] = useState(null);

    const context = useContext(SessionContext);
    const { allSessions, setAllSessions} = context;

    const handleSaveSummary = (editingSummary, editedText) => {
        setSummaries((prev) => ({
            ...prev,              // Spread the previous state to avoid mutation
            [editingSummary]: editedText  // Dynamically update the specific summary
        }));
        const updatedSession = {
            summary:editedText
        }
        setAllSessions((prevSessions)=>{
            const updatedSessions =[...prevSessions];
            updatedSessions[0]={...updatedSessions[0],...updatedSession};
            localStorage.setItem('sessions', JSON.stringify(updatedSessions));
            return updatedSessions;
        })
        setEditingSummary(null);
    };

    const handleSaveSession= (preferedSummary)=>{
        const newSession = {
            name:patient.patientName,
            pronouns:patient.pronouns,
            read:false,
            audioUrl:audioFileUrl || null,
            deleted: false,
            duration:null,
            timestamp:new Date().toLocaleString(),
            summary:summaries[preferedSummary],
            transcript:transcript,
        }
        // setAllSessions((prevSessions)=>[newSession,...prevSessions]);
        setAllSessions((prevSessions)=>{
            const updatedSessions =[newSession,...prevSessions];
            localStorage.setItem('sessions', JSON.stringify(updatedSessions));
            return updatedSessions;
        })
    }

    const handleSaveTranscript = (editedTranscript) => {
        const updatedSession = {
            transcript:editedTranscript
        }
        setAllSessions((prevSessions)=>{
            const updatedSessions =[...prevSessions];
            updatedSessions[0]={...updatedSessions[0],...updatedSession};
            localStorage.setItem('sessions', JSON.stringify(updatedSessions));
            return updatedSessions;
        })
    }
    console.log(allSessions)

    return (
        <div className="session-parent">
            {/* Summary Options Section */}

            <div className='summary-section'>
                {!editingSummary && (
                    <div className='summary-subsection'>
                        <h2 className="summary-options-title">
                            {chosenSummary ? 'Summary' : 'Summary Options'}
                        </h2>
                        {!chosenSummary ? (
                            // Show both summaries initially
                            <div className="summaries-container">
                                <div className='summary-card'>
                                    <h3>Summary 1</h3>
                                    <div className='mark-down'>
                                        <ReactMarkdown>{summaries.summary1}</ReactMarkdown>
                                    </div>
                                    <button
                                        className="prefer-button"
                                        onClick={() => {
                                            setChosenSummary('summary1');
                                            handleSaveSession('summary1');
                                        }}
                                    >
                                        I prefer this summary
                                    </button>
                                </div>
                                <div className='summary-card'>
                                    <h3>Summary 2</h3>
                                    <div className='mark-down'>
                                        <ReactMarkdown>{summaries.summary2}</ReactMarkdown>
                                    </div>
                                    <button
                                        className="prefer-button"
                                        onClick={() => {
                                            setChosenSummary('summary2');
                                            handleSaveSession('summary2');
                                        }}
                                    >
                                        I prefer this summary
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Show only the chosen summary
                            <div className="prefered-summary-card">
                                <div className='mark-down mark-container'>
                                    <ReactMarkdown>{summaries[chosenSummary]}</ReactMarkdown>
                                </div>
                                <div className='button-container'>
                                    <button
                                        onClick={() => setChosenSummary(null)}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingSummary(chosenSummary);
                                            setEditedText(summaries[chosenSummary]);
                                        }}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {editingSummary && (
                    <div className="editing-summary-container">
                        <h2>Edit Summary</h2>
                        <div className="summary-textarea">
                            <textarea
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                            />
                        </div>
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
                                    handleSaveSummary(editingSummary, editedText);
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Transcript Section */}
            <div className="transcript-section">
                <h2>Transcript</h2>
                {!isEditingTranscript ? (
                    <div className='transcript-box'>
                        <div className='mark-down mark-container' >
                            <ReactMarkdown>{transcript}</ReactMarkdown>
                        </div>
                        <div className='button-container'>
                            <button
                                onClick={() => {
                                    setIsEditingTranscript(true);
                                    setEditedTranscript(transcript);
                                }}
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="transcript-box">
                        <div className='transcript-textarea'>
                            <textarea
                                className="summary-textarea"
                                value={editedTranscript}
                                onChange={(e) => setEditedTranscript(e.target.value)}
                            />
                        </div>
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
                                    setTranscript(editedTranscript); 
                                    setIsEditingTranscript(false);
                                    handleSaveTranscript(editedTranscript);
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Audio Section */}
            <AudioSection audioUrl={audioFileUrl} />
        </div>
    )
}

export default SummaryTranscriptAndAudio;
