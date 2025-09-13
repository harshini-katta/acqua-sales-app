import React from 'react';
import { BottleWine, LogOut } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <BottleWine className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">AquaSales</h1>
          </div>

          {/* Center Logo */}
          <div className="flex-1 flex justify-center">
            <img
              src="assets/OceanPositiveLogo.png"
              alt="Company Logo"
              className="h-12 sm:h-16 w-auto"
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4 text-sm sm:text-base">
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              Welcome, {user?.name}
            </span>
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-orange-500 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
