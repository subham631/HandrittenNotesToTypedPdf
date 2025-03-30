// src/App.jsx
import React, { useState } from "react";
import Header from "./component/Header/Header";
import FileUploader from "./component/FileUploader/FileUploader";
import DownloadSection from "./component/DownloadSection/DownloadSection";
import ChatBot from "./component/chatSection/ChatBot";

function App() {
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pdfContentInText, setPdfContentInText] = useState("**Anything**");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <FileUploader
          setDownloadUrl={setDownloadUrl}
          setIsProcessing={setIsProcessing}
          isProcessing={isProcessing}
          setPdfContentInText={setPdfContentInText}
        />
        <DownloadSection
          downloadUrl={downloadUrl}
          isProcessing={isProcessing}
        />
      </main>

      {pdfContentInText && (
        <div
          className="fixed  bottom-6 right-6 bg-blue-500 dark:bg-blue-600 text-white p-4 rounded-full shadow-lg dark:shadow-gray-900/50 cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-700 transition z-20 md:z-40"
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          <p className="text-sm md:text-base">Ask anything about the pdf</p>
        </div>
      )}

      {/* Chat Overlay */}
      {isChatOpen && (
        <ChatBot
          setIsChatOpen={setIsChatOpen}
          isChatOpen={isChatOpen}
          pdfContentInText={pdfContentInText}
        />
      )}
    </div>
  );
}

export default App;
