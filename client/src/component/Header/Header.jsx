import React, { useState, useEffect } from "react";
import { FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.body.classList.contains("dark")
  );
  return (
    <header className="bg-gray-800 py-4 shadow-lg ">
      <div className="w-36 h-12 bg-blue-500 rounded-lg flex items-center justify-center ">
        <span className="text-white text-2xl font-bold ">Pen2Pdf</span>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold">Handwritten Note Converter</h1>
        <p className="text-gray-400">Convert your notes to PDF effortlessly</p>
      </div>

      
    </header>
  );
};

export default Header;
