// AudioSection.js
import { useEffect, useRef, useState } from 'react';
import './App.css'
const AudioSection = ({ audioUrl }) => {
  const [isPlaying,setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  console.log(audioUrl)

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
      <h2 className="title">Audio</h2>
      <div className="wrapper">
        <span className="text">Recording</span>
        <div className='mic-download'>
          <audio controls src={audioUrl || null} ref={audioRef} className='player' style={{ width: '900px' }} />
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

export default AudioSection;