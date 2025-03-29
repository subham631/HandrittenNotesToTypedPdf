import React from 'react';

const DownloadSection = ({ downloadUrl, isProcessing }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Download Your PDF</h2>
      {isProcessing ? (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Processing your file...</p>
        </div>
      ) : downloadUrl ? (
        <div className="flex flex-col gap-4">
          <p className="text-gray-300">Your PDF is ready!</p>
          <a
            href={downloadUrl}
            download="converted_note.pdf"
            className="bg-green-600 hover:bg-green-700 text-white font-bold 
              py-2 px-4 rounded-lg text-center transition-colors"
          >
            Download PDF
          </a>
        </div>
      ) : (
        <p className="text-gray-400">Upload a file to generate your PDF</p>
      )}
    </div>
  );
};

export default DownloadSection;