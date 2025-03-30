import React, { useState } from "react";
import FilePreview from "../FilePreview/FilePreview";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const FileUploader = ({
  setDownloadUrl,
  isProcessing,
  setIsProcessing,
  setPdfContentInText,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const GEMINI_API_KEY2 = import.meta.env.VITE_GEMINI_API_KEY2;

  console.log("GEMINI_API_KEY2", GEMINI_API_KEY2);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (
      file &&
      (file.type.includes("image") || file.type === "application/pdf")
    ) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Please upload an image or PDF file");
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);

    try {
      // Convert file to Base64
      const fileBase64 = await getBase64(selectedFile);

      const prompt = `
You are an expert in text extraction and refinement. 
Extract and refine the text from the uploaded document, ensuring:
1. Correct spelling and grammar.
2. Proper paragraph structure.
3. Formatting into structured *HTML* with:
   - <h1> for headings
   - <p> for paragraphs
   - <pre><code> for code snippets (preserving their structure)
4. Removing unwanted symbols, OCR artifacts, and unstructured formatting.
5. Maintaining the original intent while making the text clear and readable.
6. Use Inline CSS for styling and better readability (NOTE : Use tailwind CSS only)


Return only the refined *HTML-formatted* text.

Here is the document content:
`;

      const requestBody = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: fileBase64,
                  mimeType: selectedFile.type,
                },
              },
            ],
          },
        ],
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      console.log("Extracted Data ->", data);

      let refinedExtractedText = "Failed to extract text."; // Default fallback
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        refinedExtractedText = data.candidates[0].content.parts[0].text;
      }

      console.log("Extracted Text ->", refinedExtractedText);

      //       const requestBody = {
      //         contents: [
      //           {
      //             parts: [
      //               {
      //                 text: `Extract all text content from the uploaded file.`,
      //               },
      //               {
      //                 inlineData: {
      //                   data: fileBase64,
      //                   mimeType: selectedFile.type,
      //                 },
      //               },
      //             ],
      //           },
      //         ],
      //       };

      //       const response = await fetch(
      //         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      //         {
      //           method: "POST",
      //           headers: { "Content-Type": "application/json" },
      //           body: JSON.stringify(requestBody),
      //         }
      //       );

      //       const data = await response.json();
      //       //   console.log(" data ->", data);
      //       const extractedText =
      //         data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      //         "Failed to extract text.";

      //       //   console.log(" extractedText ->", extractedText);

      //       //   const prompt = `
      //       //   You are an expert text refiner. Here is some extracted text from a PDF:

      //       //   ${extractedText}

      //       //   It may contain:
      //       //   - Spelling and grammar mistakes
      //       //   - Formatting issues
      //       //   - Unstructured paragraphs
      //       //   - Code snippets that need correction

      //       //   Please refine this text by:
      //       //   1. Correcting all spelling and grammar mistakes.
      //       //   2. Formatting the text properly with proper paragraph structure.
      //       //   3. Fixing any code snippets while keeping their original intent.
      //       //   4. Returning the output in a **structured HTML format** using:
      //       //      - <h1> for headings
      //       //      - <p> for paragraphs
      //       //      - <pre><code> for code blocks
      //       //      - Proper indentation & appropiate fonts for readability
      //       //      - Use Inline CSS to make it beutiful and colorful.
      //       //      - Use inline CSS ONLY

      //       //   Return only the refined **HTML-formatted** text.
      //       //   `;

      //       const prompt = `You are an expert in text refinement. Here is some extracted text from a PDF:

      // ${extractedText}

      // Refine this text by:
      // 1. **Correcting** spelling and grammar mistakes.
      // 2. **Structuring** it properly with well-formatted paragraphs.
      // 3. **Fixing** any code snippets while preserving their intent.
      // 4. **Returning** the refined text in **structured HTML format**, using:
      //    - <h1> for headings
      //    - <p> for paragraphs
      //    - <pre><code> for code blocks
      //    - Proper indentation for readability
      //    - **Inline CSS** for a visually appealing, colorful, and readable format

      // Return only the **HTML-formatted** text. `;

      //       const requestBody2 = {
      //         contents: [
      //           {
      //             parts: [
      //               {
      //                 text: prompt,
      //               },
      //             ],
      //           },
      //         ],
      //       };

      //       const res = await fetch(
      //         `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      //         {
      //           method: "POST",
      //           headers: { "Content-Type": "application/json" },
      //           body: JSON.stringify(requestBody2),
      //         }
      //       );

      //       const refinedData = await res.json();
      //       console.log(" refinedData ->", refinedData);
      //       const refinedExtractedText =
      //         refinedData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      //         "Failed to extract text.";
      //       console.log(" refinedExtractedText ->", refinedExtractedText);

      setPdfContentInText(refinedExtractedText);

      //const htmlContent_FOR_TEST = "<h1>Hello, PDF!</h1><p>This is a test.</p>";

      const fastAPI_Response = await fetch(
        "http://127.0.0.1:8000/generate-pdf/", //http://127.0.0.1:8000
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ html_content: refinedExtractedText }),
        }
      );

      console.log("fastAPI_Response", fastAPI_Response);

      if (!fastAPI_Response.ok) {
        throw new Error("Failed to generate PDF ...");
      }

      //Convert response to blob
      const blob = await fastAPI_Response.blob();
      // Create a download URL
      const url = window.URL.createObjectURL(blob);

      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      setError("Error processing file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to convert file to Base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // Extract Base64 string
      reader.onerror = (error) => reject(error);
    });
  };

  // Function to generate a PDF
  //   async function generatePDF(text) {
  //     const pdfDoc = await PDFDocument.create();
  //     pdfDoc.registerFontkit(fontkit);

  //     // Load a Unicode-supported font
  //     const fontBytes = await fetch(robotoFont).then((res) => res.arrayBuffer());
  //     const customFont = await pdfDoc.embedFont(fontBytes);

  //     const page = pdfDoc.addPage([600, 800]);
  //     const { width, height } = page.getSize();

  //     const fontSize = 12;
  //     const lineHeight = 16;
  //     const margin = 40;
  //     let y = height - margin;

  //     const words = text.split(/\s+/);
  //     let line = "";

  //     for (let word of words) {
  //       if (
  //         customFont.widthOfTextAtSize(line + " " + word, fontSize) >
  //         width - 2 * margin
  //       ) {
  //         page.drawText(line, {
  //           x: margin,
  //           y,
  //           size: fontSize,
  //           font: customFont,
  //           color: rgb(0, 0, 0),
  //         });
  //         y -= lineHeight;
  //         line = word;
  //       } else {
  //         line += " " + word;
  //       }
  //     }

  //     if (line) {
  //       page.drawText(line, {
  //         x: margin,
  //         y,
  //         size: fontSize,
  //         font: customFont,
  //         color: rgb(0, 0, 0),
  //       });
  //     }

  //     const pdfBytes = await pdfDoc.save();
  //     return pdfBytes;
  //   }

  //   async function downloadPDF() {
  //     const inputText = `① Technical Feasibility, ② Economic Feasibility, ③ Operational Feasibility, ④ Legal Feasibility`;
  //     const pdfBytes = await generatePDF(inputText);
  //     const blob = new Blob([pdfBytes], { type: "application/pdf" });
  //     const link = document.createElement("a");
  //     link.href = URL.createObjectURL(blob);
  //     link.download = "document.pdf";
  //     link.click();
  //   }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <div className="flex flex-col gap-4">
        <label className="block text-sm font-medium">
          Upload Handwritten Note
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="mt-2 block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-gray-700 file:text-gray-300
              hover:file:bg-gray-600"
          />
        </label>

        {selectedFile && <FilePreview file={selectedFile} />}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 
            text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {isProcessing ? "Processing..." : "Convert to PDF"}
        </button>
      </div>
    </div>
  );
};

export default FileUploader;
