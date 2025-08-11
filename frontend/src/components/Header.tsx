import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-[99999] shadow-lg">
      {/* Logo-matching background: solid #043C46 extending 1/3 across, then gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#043C46] from-33% via-[#043C46] via-33% to-teal-700"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* Logo/Brand - Always visible */}
          <div className="flex items-center cursor-pointer p-2 flex-shrink-0 bg-yellow-300 p-1">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 text-white font-bold">LOGO</div>
              <span className="text-black font-bold text-lg truncate max-w-[200px] sm:max-w-none">
                Transparent Partners
              </span>
            </Link>
          </div>

          {/* Simple Sign In button for now */}
          <div className="flex items-center">
            <button className="bg-white text-[#043C46] px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}