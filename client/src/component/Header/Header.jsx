import React from 'react';

const Header = () => {
  return (
    <header className="bg-gray-800 py-4 shadow-lg">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold">Handwritten Note Converter</h1>
        <p className="text-gray-400">Convert your notes to PDF effortlessly</p>
      </div>
    </header>
  );
};

export default Header;