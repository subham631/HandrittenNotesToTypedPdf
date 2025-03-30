import React from "react";

const DownloadSection = ({ downloadUrl, isProcessing }) => {
  //   return (
  //     <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
  //       <h2 className="text-lg font-semibold mb-4">Download Your PDF</h2>
  //       {isProcessing ? (
  //         <div className="flex items-center gap-2">
  //           <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  //           <p>Processing your file...</p>
  //         </div>
  //       ) : downloadUrl ? (
  //         <div className="flex flex-col gap-4">
  //           <p className="text-gray-300">Your PDF is ready!</p>
  //           <a
  //             href={downloadUrl}
  //             download="converted_note.pdf"
  //             className="bg-green-600 hover:bg-green-700 text-white font-bold
  //               py-2 px-4 rounded-lg text-center transition-colors"
  //           >
  //             Download PDF
  //           </a>
  //         </div>
  //       ) : (
  //         <p className="text-gray-400">Upload a file to generate your PDF</p>
  //       )}
  //     </div>
  //   );

  const loaderStyle = {
    width: "48px",
    height: "48px",
    border: "5px solid #FFF",
    borderBottomColor: "#FF3D00",
    borderRadius: "50%",
    display: "inline-block",
    boxSizing: "border-box",
    animation: "rotation 1s linear infinite",
  };

  const keyframes = `
    @keyframes rotation {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <div className="bg-gray-900 bg-opacity-60 p-8 rounded-3xl shadow-2xl backdrop-blur-lg border border-gray-700 transition-all duration-500 hover:shadow-blue-500/50">
      {/* Inject Keyframes for the Loader */}
      <style>{keyframes}</style>

      <h2 className="text-xl font-bold text-white mb-4 text-center tracking-wide">
        Convert your handwritten notes to PDF in one click 😎
      </h2>

      {isProcessing ? (
        <div className="flex flex-col items-center gap-4">
          {/* 🚀 Loader with Inline CSS */}
          <span style={loaderStyle}></span>

          <p className="text-gray-300 text-sm tracking-wider animate-pulse">
            Processing your file...
          </p>
        </div>
      ) : downloadUrl ? (
        <div className="flex flex-col gap-6 items-center">
          <p className="text-gray-400 text-sm animate-fade-in">
            Your PDF is Ready!
          </p>
          <a
            href={downloadUrl}
            download="converted_note.pdf"
            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-teal-600 hover:to-green-600 text-white font-bold py-3 px-8 rounded-full text-center transition-all duration-500 transform hover:scale-105 hover:shadow-lg shadow-green-400/50"
          >
            Download PDF 🚀
          </a>
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center">
          Upload a file to generate your PDF
        </p>
      )}
    </div>
  );
};

export default DownloadSection;
