import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { fastapi_url } from '../App';

const OrderStatusUpdate = ({ orderId, onClose, onSubmit }) => {
  const [orderData, setOrderData] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = 'YOUR_AUTH_TOKEN_HERE'; // Replace with a dynamic way to get the token
      // Corrected URL to match the API endpoint
      const response = await fetch(`${fastapi_url}/fastapi/odoo/order-management/orders/${orderId}/details`, {
  headers: {
    'accept': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});


      if (!response.ok) {
        throw new Error('Failed to fetch order details.');
      }

      const data = await response.json();
      setOrderData({
        id: data.id,
        name: data.name,
        customer: data.partner_id[1], // Assuming partner_id[1] is the customer name
        amount: data.amount_total,
        currentStatus: data.state,
        deliveryNotes: data.note ? data.note.replace(/<[^>]*>?/gm, '') : 'No notes available.' // Clean up HTML tags if present
      });
      setNewStatus(data.state);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Could not load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    {
      value: 'draft',
      label: 'Draft',
      icon: Clock,
      color: 'gray',
      description: 'Order created but not confirmed'
    },
    {
      value: 'sent',
      label: 'Quotation Sent',
      icon: AlertCircle,
      color: 'yellow',
      description: 'Quotation sent to customer'
    },
    {
      value: 'sale',
      label: 'Confirmed',
      icon: Package,
      color: 'blue',
      description: 'Order confirmed and being processed'
    },
    {
      value: 'sent',
      label: 'Shipped',
      icon: Truck,
      color: 'orange',
      description: 'Order shipped and in transit'
    },
    {
      value: 'done',
      label: 'Delivered',
      icon: CheckCircle,
      color: 'green',
      description: 'Order successfully delivered'
    }
  ];

  const handleSubmit = async () => {
    if (!newStatus || !deliveryNote.trim()) {
      alert('Please select a status and add a delivery note');
      return;
    }

    setLoading(true);

    try {
      const timestamp = new Date().toLocaleString();
      const updateData = {
        status: newStatus,
        delivery_notes: `${timestamp} - ${deliveryNote}`,
        estimated_delivery: estimatedDelivery || null
      };

      await onSubmit(updateData);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'gray';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading order details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Order Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-2">Order Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Order Number:</p>
            <p className="font-medium">{orderData.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Customer:</p>
            <p className="font-medium">{orderData.customer}</p>
          </div>
          <div>
            <p className="text-gray-600">Amount:</p>
            <p className="font-medium">₹{orderData.amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Current Status:</p>
            <p className={`font-medium text-${getStatusColor(orderData.currentStatus)}-600`}>
              {statusOptions.find(opt => opt.value === orderData.currentStatus)?.label || 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Current Timeline */}
      {orderData.deliveryNotes && (
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Current Timeline</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {orderData.deliveryNotes.split('\n').map((note, index) => {
              const parts = note.split(' - ');
              return (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-xs text-gray-600">{parts[0]}</p>
                    <p className="text-sm text-gray-800">{parts[1] || note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Update */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Update Status</label>
        <div className="grid grid-cols-1 gap-2">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setNewStatus(option.value)}
                className={`p-3 rounded-lg border-2 transition text-left ${
                  newStatus === option.value
                    ? `border-${option.color}-500 bg-${option.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${
                    newStatus === option.value
                      ? `text-${option.color}-600`
                      : 'text-gray-400'
                  }`} />
                  <div className="flex-1">
                    <p className={`font-medium ${
                      newStatus === option.value
                        ? `text-${option.color}-700`
                        : 'text-gray-600'
                    }`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Delivery Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Delivery Note *
        </label>
        <textarea
          value={deliveryNote}
          onChange={(e) => setDeliveryNote(e.target.value)}
          placeholder="Enter update message (e.g., 'Package prepared for shipment', 'Out for delivery')"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"
          required
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !newStatus || !deliveryNote.trim()}
          className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Order'}
        </button>
      </div>
    </div>
  );
};

export default OrderStatusUpdate;