// src/App.jsx
import React, { useState } from "react";
import Header from "./component/Header/Header";
import FileUploader from "./component/FileUploader/FileUploader";
import DownloadSection from "./component/DownloadSection/DownloadSection";

function App() {
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <FileUploader
          setDownloadUrl={setDownloadUrl}
          setIsProcessing={setIsProcessing}
          isProcessing={isProcessing}
        />
        <DownloadSection
          downloadUrl={downloadUrl}
          isProcessing={isProcessing}
        />
      </main>
    </div>
  );
}

export default App;
