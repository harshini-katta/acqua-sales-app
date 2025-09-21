import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { fastapi_url } from '../App';

const OrdersList = ({ userEmail, refreshTrigger }) => { // refreshTrigger can be a counter
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = () => {
    if (!userEmail) return;

    fetch(`${fastapi_url}/fastapi/odoo/order-management/orders/sales/orders/${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
      })
      .catch((err) => console.error('Error fetching orders:', err));
  };

  useEffect(() => {
    fetchOrders();
  }, [userEmail, refreshTrigger]); // refreshTrigger allows re-fetch after order creation

  const filteredOrders = orders.filter((order) =>
    order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.partner_id[1].toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by order number or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        {filteredOrders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-800">{order.name}</h4>
                <p className="text-sm text-gray-600">{order.partner_id[1]}</p>
                <p className="text-sm text-gray-500">{new Date(order.date_order).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">₹{order.amount_total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersList;
