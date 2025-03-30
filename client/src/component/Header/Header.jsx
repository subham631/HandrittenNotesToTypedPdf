import React, { useState, useEffect } from "react";
import { FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.body.classList.contains("dark")
  );
  return (
    <header className="bg-gray-800 py-4 shadow-lg flex justify-around">
      <div className="w-[40%]">
        <h1 className="text-2xl font-bold">Handwritten Note Converter</h1>
        <p className="text-gray-400">Convert your notes to PDF effortlessly</p>
      </div>
      <button
        onClick={() => setIsDarkMode((prev) => !prev)}
        className="w-16 rounded-full bg-gray-200 dark:bg-red-700 text-gray-800 dark:text-gray-200 transition flex items-center justify-center"
      >
        {isDarkMode ? (
          <FaSun className="text-xl" />
        ) : (
          <FaMoon className="text-xl" />
        )}
      </button>
    </header>
  );
};

export default Header;
