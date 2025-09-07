import React, { useState } from 'react';
import { mockProducts, mockCustomers } from '../mockData';

const CreateOrderForm = ({ onClose, onSubmit }) => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([]);

  const addProduct = (product) => {
    const existing = orderItems.find(item => item.id === product.id);
    if (existing) {
      setOrderItems(orderItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter(item => item.id !== id));
    } else {
      setOrderItems(orderItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = () => {
    if (selectedCustomer && orderItems.length > 0) {
      onSubmit({ customer: selectedCustomer, items: orderItems, total });
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Choose a customer...</option>
          {mockCustomers.map(customer => (
            <option key={customer.id} value={customer.name}>
              {customer.name} - {customer.phone}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Add Products</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mockProducts.map(product => (
            <div key={product.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-800">{product.name}</h4>
                  <p className="text-sm text-gray-600">${product.price}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addProduct(product)}
                  className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-orange-600"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {orderItems.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
          <div className="space-y-2">
            {orderItems.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600 ml-2">${item.price}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="bg-red-500 text-white w-6 h-6 rounded text-sm hover:bg-red-600"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="bg-green-500 text-white w-6 h-6 rounded text-sm hover:bg-green-600"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-right mt-4">
            <span className="text-lg font-bold text-gray-800">Total: ${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Create Order
        </button>
      </div>
    </div>
  );
};

export default CreateOrderForm;
