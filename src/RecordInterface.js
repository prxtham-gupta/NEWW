import React, { useState, useEffect } from 'react';
import { Mic, Pause } from 'lucide-react';

const RecordingInterface = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center p-6">
      {!isRecording ? (
        <>
          <h1 className="text-2xl font-medium text-gray-800 mb-2">Record session</h1>
          <p className="text-gray-500 mb-8">
            Streamline patient care with seamless session recording
          </p>
          <button
            onClick={toggleRecording}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full py-3 px-6 flex items-center gap-2 transition-colors duration-200"
          >
            <Mic className="w-5 h-5" />
            <span>Start Recording</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={toggleRecording}
            className="bg-purple-100 border-2 border-purple-300 text-purple-600 rounded-full py-3 px-6 flex items-center gap-2 mb-4 hover:bg-purple-200 transition-colors duration-200"
          >
            <Pause className="w-5 h-5" />
            <span>Stop Recording</span>
          </button>
          <div className="text-xl font-medium text-gray-800 mb-2">
            {formatTime(timer)}
          </div>
          <h2 className="text-xl text-gray-800 mb-2">Recording....</h2>
          <p className="text-gray-500">
            Stay on this screen while conversing with your patient
          </p>
        </>
      )}
    </div>
  );
};

export default RecordingInterface;