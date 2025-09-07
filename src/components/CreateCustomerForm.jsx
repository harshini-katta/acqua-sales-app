import React, { useState } from 'react';

const CreateCustomerForm = ({ onClose, onSubmit }) => {
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleSubmit = () => {
    if (customerData.name && customerData.phone) {
      onSubmit(customerData);
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
        <input
          type="text"
          value={customerData.name}
          onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
        <input
          type="tel"
          value={customerData.phone}
          onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text.sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={customerData.email}
          onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <textarea
          value={customerData.address}
          onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
      </div>
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
          Create Customer
        </button>
      </div>
    </div>
  );
};

export default CreateCustomerForm;
