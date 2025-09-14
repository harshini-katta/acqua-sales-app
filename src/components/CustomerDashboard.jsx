import React, { useState } from 'react';
import Header from './Header';
import Modal from './Modal';
import CustomerOrders from './CustomerOrders';
import CustomerOrderForm from './CustomerOrderForm';
import { Plus, ShoppingCart, Package, Truck, CheckCircle } from 'lucide-react';

const CustomerDashboard = ({ user, onLogout }) => {
  const [activeModal, setActiveModal] = useState(null);

  const handleCreateOrder = async (orderData) => {
    try {
      // API call to create order for customer
      console.log('Creating customer order:', orderData);
      alert('Order placed successfully!');
      setActiveModal(null);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to place order');
    }
  };

  // Mock order statistics for the customer
  const orderStats = {
    total: 12,
    pending: 2,
    shipped: 1,
    delivered: 9
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome, {user.name}!</h1>
            <p className="text-xl text-purple-100">Manage your water orders and track deliveries</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{orderStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-yellow-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{orderStats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-orange-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-3xl font-bold text-gray-900">{orderStats.shipped}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-3xl font-bold text-gray-900">{orderStats.delivered}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button
            onClick={() => setActiveModal('createOrder')}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-200 border-2 border-transparent hover:border-purple-200 group text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Place New Order</h3>
                <p className="text-gray-600 text-sm">Order premium bottled water</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveModal('viewOrders')}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-200 border-2 border-transparent hover:border-blue-200 group text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">My Orders</h3>
                <p className="text-gray-600 text-sm">View order history and track deliveries</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Orders Preview */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
            <button
              onClick={() => setActiveModal('viewOrders')}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Order #SO123</p>
                  <p className="text-sm text-gray-600">Delivered • 2 days ago</p>
                </div>
              </div>
              <p className="font-semibold text-gray-800">₹240.00</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Order #SO124</p>
                  <p className="text-sm text-gray-600">In Transit • Expected tomorrow</p>
                </div>
              </div>
              <p className="font-semibold text-gray-800">₹360.00</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Order #SO125</p>
                  <p className="text-sm text-gray-600">Processing • Placed today</p>
                </div>
              </div>
              <p className="font-semibold text-gray-800">₹180.00</p>
            </div>
          </div>
        </div>

        {/* Product Catalog Preview */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Our Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800">Natural Spring Water</h4>
              <p className="text-sm text-gray-600 mb-2">500ml bottles</p>
              <p className="text-lg font-bold text-purple-600">₹25.00</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800">Premium Mineral Water</h4>
              <p className="text-sm text-gray-600 mb-2">1L bottles</p>
              <p className="text-lg font-bold text-purple-600">₹45.00</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800">Sparkling Water</h4>
              <p className="text-sm text-gray-600 mb-2">330ml bottles</p>
              <p className="text-lg font-bold text-purple-600">₹35.00</p>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={activeModal === 'createOrder'} onClose={() => setActiveModal(null)} title="Place New Order">
        <CustomerOrderForm 
          customerId={user.id}
          onClose={() => setActiveModal(null)} 
          onSubmit={handleCreateOrder} 
        />
      </Modal>

      <Modal isOpen={activeModal === 'viewOrders'} onClose={() => setActiveModal(null)} title="My Orders">
        <CustomerOrders customerId={user.id} />
      </Modal>
    </div>
  );
};

export default CustomerDashboard;