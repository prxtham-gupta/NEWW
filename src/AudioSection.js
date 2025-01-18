// AudioSection.js
import React from 'react';
import { Download } from 'lucide-react';

const AudioSection = ({ audioUrl }) => {
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
    <div className="mt-6 bg-white rounded-lg border border-gray-200">
      <div className="p-4">
        <h2 className="text-sm font-medium text-gray-600 mb-3">Audio</h2>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-center">
          <span className="text-xs text-gray-500 min-w-[60px]">Recording</span>
          <audio
            controls
            src={audioUrl || null}
            className="w-full sm:flex-1"
          />
          <button
            onClick={handleDownload}
            className="flex items-center justify-center px-4 py-2 rounded-full text-purple-600 hover:bg-purple-50 transition-colors duration-200"
            aria-label="Download recording"
          >
            <Download className="w-5 h-5 mr-2" />
            <span className="text-sm">Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioSection;