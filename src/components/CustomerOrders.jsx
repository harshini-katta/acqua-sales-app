import React, { useEffect, useState } from 'react';
import { Search, Package, Clock, Truck, CheckCircle, Eye, MapPin } from 'lucide-react';

const CustomerOrders = ({ customerId }) => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerOrders();
  }, [customerId]);

  const fetchCustomerOrders = async () => {
    try {
      setLoading(true);
      // Mock customer orders - replace with actual API call
      const mockOrders = [
        {
          id: 123,
          name: 'SO123',
          date_order: '2024-01-15T10:30:00',
          amount_total: 240.00,
          state: 'done',
          delivery_notes: '2024-01-15 10:30 - Order confirmed\n2024-01-15 14:00 - Processing started\n2024-01-16 09:00 - Shipped from warehouse\n2024-01-17 15:30 - Delivered successfully',
          items: [
            { name: 'Natural Spring Water', quantity: 12, price: 20.00 }
          ]
        },
        {
          id: 124,
          name: 'SO124',
          date_order: '2024-01-18T09:15:00',
          amount_total: 360.00,
          state: 'sale',
          delivery_notes: '2024-01-18 09:15 - Order confirmed\n2024-01-18 16:00 - Processing started\n2024-01-19 11:00 - Shipped from warehouse\nExpected delivery: 2024-01-20',
          items: [
            { name: 'Premium Mineral Water', quantity: 8, price: 45.00 }
          ]
        },
        {
          id: 125,
          name: 'SO125',
          date_order: '2024-01-20T14:20:00',
          amount_total: 180.00,
          state: 'sale',
          delivery_notes: '2024-01-20 14:20 - Order confirmed\n2024-01-20 17:00 - Processing started',
          items: [
            { name: 'Sparkling Water', quantity: 6, price: 30.00 }
          ]
        }
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusInfo = (order) => {
    if (order.delivery_notes?.includes('Delivered')) {
      return { status: 'Delivered', color: 'green', icon: CheckCircle };
    }
    
    if (order.delivery_notes?.includes('Shipped')) {
      return { status: 'In Transit', color: 'orange', icon: Truck };
    }
    
    switch (order.state) {
      case 'draft':
      case 'sent':
        return { status: 'Pending', color: 'yellow', icon: Clock };
      case 'sale':
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
        message: parts[1] || note,
        isEstimate: note.includes('Expected')
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Loading your orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by order number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                  <p className="text-sm text-gray-500 mb-2">
                    Ordered: {new Date(order.date_order).toLocaleDateString()}
                  </p>
                  
                  {/* Order Items */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Items:</p>
                    {order.items.map((item, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        {item.quantity}x {item.name} - ₹{item.price.toFixed(2)} each
                      </p>
                    ))}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-gray-800 mb-2">₹{order.amount_total.toFixed(2)}</p>
                  <button
                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{selectedOrder === order.id ? 'Hide' : 'Track'}</span>
                  </button>
                </div>
              </div>

              {/* Delivery Timeline - Expanded View */}
              {selectedOrder === order.id && timeline.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <p className="text-sm font-medium text-gray-700">Delivery Timeline</p>
                  </div>
                  
                  <div className="space-y-3">
                    {timeline.map((entry, index) => {
                      const isLast = index === timeline.length - 1;
                      const isEstimate = entry.isEstimate;
                      
                      return (
                        <div key={entry.id} className="flex items-start space-x-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              isEstimate 
                                ? 'bg-gray-300 border-2 border-white' 
                                : isLast 
                                  ? 'bg-purple-500' 
                                  : 'bg-green-500'
                            }`}></div>
                            {index < timeline.length - 1 && (
                              <div className="w-0.5 h-8 bg-gray-200 mt-1"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between">
                              <p className={`text-xs ${
                                isEstimate ? 'text-gray-500' : 'text-gray-600'
                              }`}>
                                {entry.timestamp}
                              </p>
                              {isEstimate && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  Estimated
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${
                              isEstimate 
                                ? 'text-gray-600 italic' 
                                : isLast 
                                  ? 'text-purple-700 font-medium' 
                                  : 'text-gray-800'
                            }`}>
                              {entry.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Estimated Delivery Info */}
                  {statusInfo.status === 'In Transit' && (
                    <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-orange-600" />
                        <p className="text-sm font-medium text-orange-800">
                          Your order is on the way!
                        </p>
                      </div>
                      <p className="text-sm text-orange-700 mt-1">
                        Expected delivery within 24 hours
                      </p>
                    </div>
                  )}
                  
                  {statusInfo.status === 'Delivered' && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-medium text-green-800">
                          Order delivered successfully!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Status Summary */}
              {selectedOrder !== order.id && timeline.length > 0 && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">
                      {timeline[timeline.length - 1]?.message}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 ml-4">
                    {timeline[timeline.length - 1]?.timestamp}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No orders found</p>
          <p className="text-sm text-gray-500">
            {searchTerm ? 'Try a different search term' : 'You haven\'t placed any orders yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;