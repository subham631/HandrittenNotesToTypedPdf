import React, { useState, useEffect, useRef } from "react";
import { ImCross } from "react-icons/im";
import { IoSend } from "react-icons/io5";
import { FaRobot } from "react-icons/fa";
import { IoMdPerson } from "react-icons/io";

const ChatBot = ({ isChatOpen, setIsChatOpen, pdfContentInText }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      setMessages([
        {
          text: `Hi there! I'm Gurudev, your AI assistant. How can I help you with your questions today?`,
          sender: "ai",
          rawText: `Hi there! I'm Gurudev, your AI assistant. How can I help you with your questions today?`,
        },
      ]);
    }
  }, [isChatOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatResponse = (text) => {
    // Convert markdown-like formatting to HTML
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
      .replace(/^# (.*$)/gm, "<h3>$1</h3>") // Headings
      .replace(/^## (.*$)/gm, "<h4>$1</h4>") // Subheadings
      .replace(/^### (.*$)/gm, "<h5>$1</h5>") // Sub-subheadings
      .replace(/^\> (.*$)/gm, "<blockquote>$1</blockquote>") // Blockquotes
      .replace(/\n/g, "<br>"); // Line breaks

    // Handle lists
    formattedText = formattedText.replace(/^\* (.*$)/gm, "<li>$1</li>");
    formattedText = formattedText.replace(/<li>.*<\/li>/g, (match) => {
      if (!formattedText.includes("<ul>")) {
        return "<ul>" + match;
      }
      return match;
    });
    formattedText = formattedText.replace(/(<\/li>)(?!.*<li>)/, "$1</ul>");

    // Handle code blocks
    formattedText = formattedText.replace(
      /```(\w*)\n([\s\S]*?)\n```/g,
      '<pre><code class="language-$1">$2</code></pre>'
    );

    return { __html: formattedText };
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = {
      text: input,
      sender: "user",
      rawText: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const chatHistory = messages
      .slice(-5)
      .map((msg) => `${msg.sender}: ${msg.rawText}`)
      .join("\n");

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are an AI expert Teacher/Doubt solver. Respond in a professional, well-formatted manner using markdown-like syntax:
              - Use **bold** for important terms
              - Use *italics* for emphasis
              - Use # for main headings, ## for subheadings
              - Use * for bullet points
              - Use > for quotes
              - Use \`\`\` for code blocks
              - Always use proper line breaks and spacing
              
              Current document context: ${pdfContentInText} 
              
              Conversation history:
              ${chatHistory}
              
              Respond to: "${input}" with properly formatted, professional explanation.`,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      const aiResponse =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I encountered an error. Please try again.";

      console.log("aiResponse ->", aiResponse);

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          text: aiResponse,
          sender: "ai",
          rawText: aiResponse,
        },
      ]);
    } catch (error) {
      console.error("API Error:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I couldn't process your request at the moment. Please try again later.",
          sender: "ai",
          rawText:
            "Sorry, I couldn't process your request at the moment. Please try again later.",
        },
      ]);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center z-30 justify-end bg-black/50 bg-opacity-50 backdrop-blur-sm md:p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl md:h-[85vh] h-full z-50 rounded-xl shadow-xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all duration-300 ease-in-out">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <FaRobot className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gurudev AI Assistant</h3>
              <p className="text-xs opacity-80">
                {isTyping ? "Typing..." : "Online"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsChatOpen(false)}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition"
          >
            <ImCross size={16} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50 dark:bg-gray-950">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[90%] p-4 rounded-2xl ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none shadow-sm border border-gray-100 dark:border-gray-700"
                }`}
              >
                <div className="flex items-start space-x-3">
                  {msg.sender === "ai" ? (
                    <FaRobot className="text-blue-500 mt-1 flex-shrink-0" />
                  ) : (
                    <IoMdPerson className="text-blue-200 mt-1 flex-shrink-0" />
                  )}
                  <div
                    className="prose dark:prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={formatResponse(msg.text)}
                  />
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[90%] p-4 rounded-2xl rounded-bl-none bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <FaRobot className="text-blue-500" />
                  <div className="flex space-x-2">
                    <div
                      className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={input.trim() === ""}
              className={`p-3 rounded-xl ${
                input.trim() === ""
                  ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white transition-all duration-200 flex items-center justify-center`}
            >
              <IoSend className="text-lg" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center">
            Gurudev AI may produce inaccurate information. Verify critical
            information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;

// //***************************************** */

// import React, { useState, useEffect, useRef } from "react";
// import { ImCross } from "react-icons/im";
// import { IoSend } from "react-icons/io5";
// import { FaRobot } from "react-icons/fa";
// import { IoMdPerson } from "react-icons/io";
// import { Prism as SyntaxHighlighter } from "prism-react-renderer";

// // Define a default theme directly in the component
// const defaultTheme = {
//   plain: {
//     color: "#F8F8F2",
//     backgroundColor: "#282A36",
//   },
//   styles: [
//     {
//       types: ["comment", "prolog", "doctype", "cdata"],
//       style: {
//         color: "#6272A4",
//       },
//     },
//     {
//       types: ["punctuation"],
//       style: {
//         color: "#F8F8F2",
//       },
//     },
//     {
//       types: ["property", "tag", "constant", "symbol", "deleted"],
//       style: {
//         color: "#FF79C6",
//       },
//     },
//     {
//       types: ["boolean", "number"],
//       style: {
//         color: "#BD93F9",
//       },
//     },
//     {
//       types: ["selector", "attr-name", "string", "char", "builtin", "inserted"],
//       style: {
//         color: "#50FA7B",
//       },
//     },
//     {
//       types: ["operator", "entity", "url", "variable"],
//       style: {
//         color: "#F8F8F2",
//       },
//     },
//     {
//       types: ["atrule", "attr-value", "function", "class-name"],
//       style: {
//         color: "#F1FA8C",
//       },
//     },
//     {
//       types: ["keyword"],
//       style: {
//         color: "#8BE9FD",
//       },
//     },
//     {
//       types: ["regex", "important"],
//       style: {
//         color: "#FFB86C",
//       },
//     },
//   ],
// };

// const ChatBot = ({ isChatOpen, setIsChatOpen, pdfContentInText }) => {
//   // ... (keep all your existing state and effect hooks)
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef(null);

//   const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

//   useEffect(() => {
//     if (isChatOpen && messages.length === 0) {
//       setMessages([
//         {
//           text: `Hi there! I'm Gurudev, your AI assistant. How can I help you with your questions today?`,
//           sender: "ai",
//           rawText: `Hi there! I'm Gurudev, your AI assistant. How can I help you with your questions today?`,
//         },
//       ]);
//     }
//   }, [isChatOpen]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const formatText = (text) => {
//     const html = text
//       .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
//       .replace(/\*(.*?)\*/g, "<em>$1</em>")
//       .replace(/^# (.*$)/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
//       .replace(
//         /^## (.*$)/gm,
//         '<h4 class="text-lg font-semibold mt-3 mb-1">$1</h4>'
//       )
//       .replace(/^### (.*$)/gm, '<h5 class="font-medium mt-2">$1</h5>')
//       .replace(
//         /^\> (.*$)/gm,
//         '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2 text-gray-600 dark:text-gray-400">$1</blockquote>'
//       )
//       .replace(/^\* (.*$)/gm, '<li class="ml-4">$1</li>')
//       .replace(/\n\n/g, "</p><p>")
//       .replace(/\n/g, "<br>");

//     return (
//       <div
//         className="prose dark:prose-invert prose-sm max-w-none"
//         dangerouslySetInnerHTML={{ __html: html }}
//       />
//     );
//   };

//   // const formatCodeBlocks = (text) => {
//   //   const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;
//   //   let lastIndex = 0;
//   //   const elements = [];

//   //   text.replace(codeBlockRegex, (match, language, code, offset) => {
//   //     if (offset > lastIndex) {
//   //       const textBefore = text.slice(lastIndex, offset);
//   //       elements.push(formatText(textBefore));
//   //     }

//   //     elements.push(
//   //       <div
//   //         key={offset}
//   //         className="my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
//   //       >
//   //         <div className="bg-gray-800 text-gray-300 px-3 py-1 text-xs font-mono">
//   //           {language || "text"}
//   //         </div>
//   //         <SyntaxHighlighter
//   //           language={language || "text"}
//   //           style={defaultTheme}
//   //           customStyle={{
//   //             margin: 0,
//   //             padding: "1rem",
//   //             fontSize: "0.9rem",
//   //             lineHeight: "1.5",
//   //             backgroundColor: "#282A36",
//   //           }}
//   //         >
//   //           {code}
//   //         </SyntaxHighlighter>
//   //       </div>
//   //     );

//   //     lastIndex = offset + match.length;
//   //     return match;
//   //   });

//   //   if (lastIndex < text.length) {
//   //     elements.push(formatText(text.slice(lastIndex)));
//   //   }

//   //   return elements;
//   // };

//   const formatCodeBlocks = (text) => {
//     const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;
//     let lastIndex = 0;
//     const elements = [];
//     let matchCount = 0; // Counter for unique keys

//     text.replace(codeBlockRegex, (match, language, code, offset) => {
//       if (offset > lastIndex) {
//         const textBefore = text.slice(lastIndex, offset);
//         elements.push(
//           <React.Fragment key={`text-${matchCount}`}>
//             {formatText(textBefore)}
//           </React.Fragment>
//         );
//       }

//       elements.push(
//         <div
//           key={`code-${matchCount}`} // Use the counter for unique keys
//           className="my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
//         >
//           <div className="bg-gray-800 text-gray-300 px-3 py-1 text-xs font-mono">
//             {language || "text"}
//           </div>
//           <SyntaxHighlighter
//             language={language || "text"}
//             style={defaultTheme}
//             customStyle={{
//               margin: 0,
//               padding: "1rem",
//               fontSize: "0.9rem",
//               lineHeight: "1.5",
//               backgroundColor: "#282A36",
//             }}
//           >
//             {code}
//           </SyntaxHighlighter>
//         </div>
//       );

//       lastIndex = offset + match.length;
//       matchCount++; // Increment the counter
//       return match;
//     });

//     if (lastIndex < text.length) {
//       elements.push(
//         <React.Fragment key={`text-end-${matchCount}`}>
//           {formatText(text.slice(lastIndex))}
//         </React.Fragment>
//       );
//     }

//     return elements;
//   };

//   // ... (keep all your other existing functions)
//   const handleSendMessage = async () => {
//     if (input.trim() === "") return;

//     const userMessage = {
//       text: input,
//       sender: "user",
//       rawText: input,
//     };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setIsTyping(true);

//     const chatHistory = messages
//       .slice(-5)
//       .map((msg) => `${msg.sender}: ${msg.rawText}`)
//       .join("\n");

//     const requestBody = {
//       contents: [
//         {
//           parts: [
//             {
//               text: `You are an AI expert Teacher/Doubt solver. Respond in a professional, well-formatted manner using markdown-like syntax:
//               - Use **bold** for important terms
//               - Use *italics* for emphasis
//               - Use # for main headings, ## for subheadings
//               - Use * for bullet points
//               - Use > for quotes
//               - Use \`\`\`language for code blocks (specify language)
//               - Always use proper line breaks and spacing

//               Current document context: ${pdfContentInText}

//               Conversation history:
//               ${chatHistory}

//               Respond to: "${input}" with properly formatted, professional explanation.`,
//             },
//           ],
//         },
//       ],
//     };

//     try {
//       const response = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(requestBody),
//         }
//       );

//       const data = await response.json();
//       const aiResponse =
//         data?.candidates?.[0]?.content?.parts?.[0]?.text ||
//         "Sorry, I encountered an error. Please try again.";

//       setIsTyping(false);
//       setMessages((prev) => [
//         ...prev,
//         {
//           text: aiResponse,
//           sender: "ai",
//           rawText: aiResponse,
//         },
//       ]);
//     } catch (error) {
//       console.error("API Error:", error);
//       setIsTyping(false);
//       setMessages((prev) => [
//         ...prev,
//         {
//           text: "Sorry, I couldn't process your request at the moment. Please try again later.",
//           sender: "ai",
//           rawText:
//             "Sorry, I couldn't process your request at the moment. Please try again later.",
//         },
//       ]);
//     }
//   };

//   return (
//     <div className="fixed inset-0 flex items-center z-30 justify-end bg-black bg-opacity-50 backdrop-blur-sm md:p-4">
//       <div className="bg-white dark:bg-gray-900 w-full max-w-2xl md:h-[85vh] h-full z-50 rounded-xl shadow-xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all duration-300 ease-in-out">
//         {/* Chat Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 text-white p-4 flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <div className="bg-white/20 p-2 rounded-full">
//               <FaRobot className="text-white text-xl" />
//             </div>
//             <div>
//               <h3 className="text-lg font-semibold">Gurudev AI Assistant</h3>
//               <p className="text-xs opacity-80">
//                 {isTyping ? "Typing..." : "Online"}
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={() => setIsChatOpen(false)}
//             className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition"
//           >
//             <ImCross size={16} />
//           </button>
//         </div>

//         {/* Messages Area */}
//         <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50 dark:bg-gray-950">
//           {messages.map((msg, index) => (
//             <div
//               key={index}
//               className={`flex ${
//                 msg.sender === "user" ? "justify-end" : "justify-start"
//               }`}
//             >
//               <div
//                 className={`max-w-[90%] p-4 rounded-2xl ${
//                   msg.sender === "user"
//                     ? "bg-blue-600 text-white rounded-br-none"
//                     : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none shadow-sm border border-gray-100 dark:border-gray-700"
//                 }`}
//               >
//                 <div className="flex items-start space-x-3">
//                   {msg.sender === "ai" ? (
//                     <FaRobot className="text-blue-500 mt-1 flex-shrink-0" />
//                   ) : (
//                     <IoMdPerson className="text-blue-200 mt-1 flex-shrink-0" />
//                   )}
//                   <div className="w-full">{formatCodeBlocks(msg.text)}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//           {isTyping && (
//             <div className="flex justify-start">
//               <div className="max-w-[90%] p-4 rounded-2xl rounded-bl-none bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
//                 <div className="flex items-center space-x-3">
//                   <FaRobot className="text-blue-500" />
//                   <div className="flex space-x-2">
//                     <div
//                       className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
//                       style={{ animationDelay: "0ms" }}
//                     />
//                     <div
//                       className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
//                       style={{ animationDelay: "150ms" }}
//                     />
//                     <div
//                       className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
//                       style={{ animationDelay: "300ms" }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input Area */}
//         <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
//           <div className="flex items-center space-x-2">
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//               placeholder="Ask me anything..."
//               className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
//             />
//             <button
//               onClick={handleSendMessage}
//               disabled={input.trim() === ""}
//               className={`p-3 rounded-xl ${
//                 input.trim() === ""
//                   ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
//                   : "bg-blue-600 hover:bg-blue-700"
//               } text-white transition-all duration-200 flex items-center justify-center`}
//             >
//               <IoSend className="text-lg" />
//             </button>
//           </div>
//           <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center">
//             Gurudev AI may produce inaccurate information. Verify critical
//             information.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatBot;
