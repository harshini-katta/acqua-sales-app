import React from 'react';
import { BottleWine, LogOut } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          {/* Left Section */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <BottleWine className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">AquaSales</h1>
          </div>

          {/* Center Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <img
              src="src\Assets\OceanPositiveLogo.png" // <-- replace with your logo path
              alt="Company Logo"
              className="h-16 w-auto"
            />
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.name}</span>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
