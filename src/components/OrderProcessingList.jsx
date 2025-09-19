import React, { useEffect, useState } from 'react';
import { Search, Package, Clock, Truck, CheckCircle, Edit3 } from 'lucide-react';
import { fastapi_url } from '../App';

const OrderProcessingList = ({ status, onUpdateOrder }) => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(fastapi_url+'/fastapi/odoo/orders');
      const data = await response.json();
      
      let filteredOrders = data.orders || [];
      
      // Filter by status if provided
      if (status) {
        filteredOrders = filteredOrders.filter(order => {
          switch (status) {
            case 'pending':
              return ['draft', 'sent'].includes(order.state);
            case 'processing':
              return order.state === 'sale';
            case 'shipped':
              return order.state === 'done' && !order.delivery_notes?.includes('Delivered');
            case 'delivered':
              return order.delivery_notes?.includes('Delivered');
            default:
              return true;
          }
        });
      }
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.partner_id[1].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusInfo = (order) => {
    if (order.delivery_notes?.includes('Delivered')) {
      return { status: 'Delivered', color: 'green', icon: CheckCircle };
    }
    
    switch (order.state) {
      case 'draft':
      case 'sent':
        return { status: 'Pending', color: 'yellow', icon: Clock };
      case 'sale':
        if (order.delivery_notes?.includes('Shipped')) {
          return { status: 'Shipped', color: 'orange', icon: Truck };
        }
        return { status: 'Processing', color: 'blue', icon: Package };
      case 'done':
        return { status: 'Completed', color: 'green', icon: CheckCircle };
      case 'cancel':
        return { status: 'Cancelled', color: 'red', icon: Clock };
      default:
        return { status: 'Unknown', color: 'gray', icon: Clock };
    }
  };

  const getDeliveryTimeline = (order) => {
    if (!order.delivery_notes) return [];
    
    return order.delivery_notes.split('\n').filter(note => note.trim()).map((note, index) => {
      const parts = note.split(' - ');
      return {
        id: index,
        timestamp: parts[0] || new Date().toLocaleString(),
        message: parts[1] || note
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading orders...</span>
      </div>
    );
  }

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

      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const statusInfo = getStatusInfo(order);
          const timeline = getDeliveryTimeline(order);
          const StatusIcon = statusInfo.icon;

          return (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-800">{order.name}</h4>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}>
                      <StatusIcon className="w-3 h-3" />
                      <span>{statusInfo.status}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{order.partner_id[1]}</p>
                  <p className="text-sm text-gray-500">
                    Order Date: {new Date(order.date_order).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 mb-2">₹{order.amount_total.toFixed(2)}</p>
                  <button
                    onClick={() => onUpdateOrder(order.id)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Update</span>
                  </button>
                </div>
              </div>

              {/* Delivery Timeline */}
              {timeline.length > 0 && (
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Delivery Timeline:</p>
                  <div className="space-y-1">
                    {timeline.slice(-3).map((entry) => (
                      <div key={entry.id} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600">{entry.timestamp}</p>
                          <p className="text-sm text-gray-800">{entry.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {timeline.length > 3 && (
                    <p className="text-xs text-gray-500 mt-1">
                      +{timeline.length - 3} more updates
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No orders found</p>
        </div>
      )}
    </div>
  );
};

export default OrderProcessingList;