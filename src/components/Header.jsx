import React, { useState } from 'react';
import { BottleWine, LogOut, User, Settings, ShoppingCart, Plus, X } from 'lucide-react';
import CreateInternalUserForm from './CreateInternalUserForm'; // ✅ import your form

const Header = ({ user, onLogout }) => {
  const [showModal, setShowModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // ✅ for mobile profile dropdown

  const getRoleInfo = (role) => {
    switch (role) {
      case 'salesperson':
        return { icon: User, color: 'blue' };
      case 'backoffice':
        return { icon: Settings, color: 'green', title: 'SalesAdministrator' };
      case 'customer':
        return { icon: ShoppingCart, color: 'purple', title: 'Customer' };
      default:
        return { icon: User, color: 'blue', title: 'User' };
    }
  };

  const roleInfo = getRoleInfo(user.group);
  const RoleIcon = roleInfo.icon;

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">

            {/* Left side (desktop) */}
            <div className="hidden sm:flex items-center">
              <div
                className={`w-8 h-8 bg-${roleInfo.color}-500 rounded-full flex items-center justify-center mr-3`}
              >
                <BottleWine className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">AquaSales</h1>
              </div>
            </div>

            {/* Center Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img
                src="public/templates/OceanPositiveLogo.png"
                alt="Logo"
                className="h-8 sm:h-10 w-auto"
              />
            </div>

            {/* Right side (desktop) */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
                <div
                  className={`w-8 h-8 bg-${roleInfo.color}-100 rounded-full flex items-center justify-center`}
                >
                  <RoleIcon className={`w-4 h-4 text-${roleInfo.color}-600`} />
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm font-medium text-gray-800">Welcome, {user?.name}</p>
                  <p className={`text-xs text-${roleInfo.color}-600`}>{roleInfo.title}</p>
                </div>

                {user.group === 'backoffice' && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Distributor</span>
                  </button>
                )}
              </div>

              <div className="h-6 w-px bg-gray-300"></div>

              <button
                onClick={onLogout}
                className={`flex items-center space-x-2 text-gray-600 hover:text-${roleInfo.color}-500 transition`}
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile view */}
            <div className="flex-1 flex items-center justify-between sm:hidden">
              {/* Left: only the BottleWine icon */}
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 bg-${roleInfo.color}-500 rounded-full flex items-center justify-center`}
                >
                  <BottleWine className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Centered Logo */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <img
                  src="public/templates/OceanPositiveLogo.png"
                  alt="Logo"
                  className="h-8 w-auto"
                />
              </div>

              {/* Right: mobile profile */}
              <div className="relative">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`w-8 h-8 bg-${roleInfo.color}-100 rounded-full flex items-center justify-center`}
                >
                  <RoleIcon className={`w-4 h-4 text-${roleInfo.color}-600`} />
                </button>

                {mobileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-3 z-50">
                    <p className="px-4 py-2 text-sm font-medium text-gray-800 border-b border-gray-100">
                      Welcome, {user?.name}
                    </p>
                    <p className={`px-4 py-2 text-sm text-${roleInfo.color}-600 border-b border-gray-100`}>
                      {roleInfo.title}
                    </p>
                    <button
                      onClick={onLogout}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold mb-4">Create Distributor</h2>
            <CreateInternalUserForm onClose={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
