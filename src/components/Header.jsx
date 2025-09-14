import React from 'react';
import { Package, LogOut, User, Settings, ShoppingCart } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  const getRoleInfo = (role) => {
    switch (role) {
      case 'salesperson':
        return { icon: User, color: 'blue', title: 'Salesperson' };
      case 'processor':
        return { icon: Settings, color: 'green', title: 'Order Processor' };
      case 'customer':
        return { icon: ShoppingCart, color: 'purple', title: 'Customer' };
      default:
        return { icon: User, color: 'blue', title: 'User' };
    }
  };

  const roleInfo = getRoleInfo(user.role);
  const RoleIcon = roleInfo.icon;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className={`w-8 h-8 bg-${roleInfo.color}-500 rounded-full flex items-center justify-center mr-3`}>
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AquaSales</h1>
              <p className="text-xs text-gray-500">{roleInfo.title} Portal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 bg-${roleInfo.color}-100 rounded-full flex items-center justify-center`}>
                <RoleIcon className={`w-4 h-4 text-${roleInfo.color}-600`} />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className={`text-xs text-${roleInfo.color}-600`}>{roleInfo.title}</p>
              </div>
            </div>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <button
              onClick={onLogout}
              className={`flex items-center space-x-2 text-gray-600 hover:text-${roleInfo.color}-500 transition`}
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