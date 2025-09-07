import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { mockOrders } from '../mockData';

const OrdersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState(mockOrders);

  useEffect(() => {
    const filtered = mockOrders.filter(order =>
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm) ||
      order.id.toString().includes(searchTerm)
    );
    setFilteredOrders(filtered);
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by customer, phone, or order number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="space-y-2">
        {filteredOrders.map(order => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-800">Order #{order.id}</h4>
                <p className="text-sm text-gray-600">{order.customer} - {order.phone}</p>
                <p className="text-sm text-gray-500">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">${order.total}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersList;
