import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Modal from './Modal';
import CreateOrderForm from './CreateOrderForm';
import CreateCustomerForm from './CreateCustomerForm';
import OrdersList from './OrdersList';
import CustomersList from './CustomersList';
import { Plus, Users, ShoppingCart, User, TrendingUp } from 'lucide-react';

const SalespersonDashboard = ({ user, onLogout }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0); // total orders state
  const [revenue, setRevenue] = useState(0); // revenue state

  const handleCreateOrder = (orderData) => {
    console.log('Creating order:', orderData);
    alert('Order created successfully!');
  };

  const handleCreateCustomer = (customerData) => {
    console.log('Creating customer:', customerData);
    alert('Customer created successfully!');
  };

  // Fetch total orders and revenue from API
  useEffect(() => {
    const fetchCustomerRevenue = async () => {
      try {
        const token = "YOUR_TOKEN_HERE"; // replace with your token if needed
        const response = await fetch(
          "http://d28c5r6pnnqv4m.cloudfront.net/fastapi/orders/customer/revenue",
          {
            method: "GET",
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch revenue");
        }

        const data = await response.json();
        console.log("Revenue data:", data);

        // Assuming the API returns a single object like this:
        // { customer_id: 26, customer_name: "sita", total_revenue: 23000, total_orders: 3 }
        setTotalOrders(data.total_orders);
        setRevenue(data.total_revenue);
      } catch (error) {
        console.error("Error fetching revenue:", error);
      }
    };

    fetchCustomerRevenue();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Distributor Dashboard</h1>
            <p className="text-xl text-blue-100">Manage orders and customers for premium bottled water products</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => setActiveModal('createOrder')}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-200 border-2 border-transparent hover:border-orange-200 group"
          >
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600 transition">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Create Order</h3>
            <p className="text-gray-600 text-sm">Create a new sales order for customers</p>
          </button>

          <button
            onClick={() => setActiveModal('viewOrders')}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-200 border-2 border-transparent hover:border-blue-200 group"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">View Orders</h3>
            <p className="text-gray-600 text-sm">View and manage sales orders</p>
          </button>

          <button
            onClick={() => setActiveModal('createCustomer')}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-200 border-2 border-transparent hover:border-green-200 group"
          >
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 transition">
              <User className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Add Customer</h3>
            <p className="text-gray-600 text-sm">Add new customers to the system</p>
          </button>

          <button
            onClick={() => setActiveModal('viewCustomers')}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-200 border-2 border-transparent hover:border-purple-200 group"
          >
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 transition">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">View Customers</h3>
            <p className="text-gray-600 text-sm">Browse customer database</p>
          </button>
        </div>

        {/* Sales Statistics */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900">48</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₹{revenue}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={activeModal === 'createOrder'} onClose={() => setActiveModal(null)} title="Create New Order">
        <CreateOrderForm onClose={() => setActiveModal(null)} onSubmit={handleCreateOrder} />
      </Modal>

      <Modal isOpen={activeModal === 'viewOrders'} onClose={() => setActiveModal(null)} title="Orders">
        <OrdersList />
      </Modal>

      <Modal isOpen={activeModal === 'createCustomer'} onClose={() => setActiveModal(null)} title="Create New Customer">
        <CreateCustomerForm onClose={() => setActiveModal(null)} onSubmit={handleCreateCustomer} />
      </Modal>

      <Modal isOpen={activeModal === 'viewCustomers'} onClose={() => setActiveModal(null)} title="Customers">
        <CustomersList />
      </Modal>
    </div>
  );
};

export default SalespersonDashboard;