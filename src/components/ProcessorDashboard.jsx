import React, { useState } from 'react';
import Header from './Header';
import Modal from './Modal';
import OrderProcessingList from './OrderProcessingList';
import OrderStatusUpdate from './OrderStatusUpdate';
import { Package, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { fastapi_url } from '../App';

const BackofficeDashboard = ({ user, onLogout }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleUpdateOrder = (orderId) => {
    // Find order and open update modal
    setSelectedOrder(orderId);
    setActiveModal('updateOrder');
  };

  const handleOrderUpdate = async (orderData) => {
    try {
      // API call to update order status and add delivery notes
     const response = await fetch(`${fastapi_url}/fastapi/odoo/orders/${selectedOrder}/status`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(orderData),
});

      
      if (response.ok) {
        alert('Order updated successfully!');
        setActiveModal(null);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  const orderStats = {
    pending: 15,
    processing: 8,
    shipped: 12,
    delivered: 25
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Order Processing Dashboard</h1>
            <p className="text-xl text-green-100">Manage order fulfillment and delivery tracking</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Order Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-yellow-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900">{orderStats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-3xl font-bold text-gray-900">{orderStats.processing}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-orange-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shipped</p>
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
            onClick={() => setActiveModal('pendingOrders')}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-200 border-2 border-transparent hover:border-yellow-200 group text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center group-hover:bg-yellow-600 transition">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Process Pending Orders</h3>
                <p className="text-gray-600 text-sm">Review and update order status</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveModal('allOrders')}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-200 border-2 border-transparent hover:border-blue-200 group text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">All Orders</h3>
                <p className="text-gray-600 text-sm">View and manage all orders</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Order #SO001 delivered successfully</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Order #SO002 shipped to Mumbai</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <Package className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Order #SO003 ready for processing</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={activeModal === 'pendingOrders'} onClose={() => setActiveModal(null)} title="Pending Orders">
        <OrderProcessingList 
          status="pending" 
          onUpdateOrder={handleUpdateOrder}
        />
      </Modal>

      <Modal isOpen={activeModal === 'allOrders'} onClose={() => setActiveModal(null)} title="All Orders">
        <OrderProcessingList 
          onUpdateOrder={handleUpdateOrder}
        />
      </Modal>

      <Modal isOpen={activeModal === 'updateOrder'} onClose={() => setActiveModal(null)} title="Update Order Status">
        <OrderStatusUpdate 
          orderId={selectedOrder}
          onClose={() => setActiveModal(null)}
          onSubmit={handleOrderUpdate}
        />
      </Modal>
    </div>
  );
};

export default BackofficeDashboard;