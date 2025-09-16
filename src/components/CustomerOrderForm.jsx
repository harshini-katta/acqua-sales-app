import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

const CustomerOrderForm = ({ customerId, onClose, onSubmit }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // New state for delivery option
  const [deliveryOption, setDeliveryOption] = useState('deliver'); // default to deliver

  // Products state
  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(true);

  // Fetch products with retry logic
  const fetchProductsUntilReady = () => {
    setProductLoading(true);

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          'https://d28c5r6pnnqv4m.cloudfront.net/fastapi/odoo/products',
          { params: { skip: 0, limit: 20 } }
        );
        const data = res.data;

        if (Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          setProductLoading(false);
          clearInterval(interval);
        } else if (data?.detail === 'Request-sent') {
          console.log('Products not ready yet, retrying...');
        } else {
          console.warn('Unexpected response:', data);
          setProducts([]);
          setProductLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error fetching products:', err.message || err);
      }
    }, 2000);
  };

  useEffect(() => {
    fetchProductsUntilReady();
  }, []);

  const addProduct = (product) => {
    const existing = orderItems.find((item) => item.id === product.id);
    if (existing) {
      setOrderItems(
        orderItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems([...orderItems, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter((item) => item.id !== id));
    } else {
      setOrderItems(
        orderItems.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const total = orderItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
    0
  );
  const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      alert('Please add some products to your order');
      return;
    }

    // Only require delivery address if option is "deliver"
    if (deliveryOption === 'deliver' && !deliveryAddress.trim()) {
      alert('Please provide a delivery address');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customer_id: customerId,
        items: orderItems,
        total,
        delivery_address:
          deliveryOption === 'pickup'
            ? 'Oceana Positive, Survey No. 508/2 & 509/2, Ootla Village, Jinnaram Mandal, Sangareddy District, Suburbs of Hyderabad, Telangana - 502319'
            : deliveryAddress,
        delivery_notes: deliveryNotes,
        order_date: new Date().toISOString(),
      };

      await onSubmit(orderData);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      
      {/* Product Catalog */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Select Products
        </h3>
        {productLoading ? (
          <p>Loading products...</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🛒</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {product.description || 'No description'}
                        </p>
                        <p className="text-lg font-bold text-purple-600 mt-1">
                          ₹{Number(product.price).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => addProduct(product)}
                        className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 transition flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      {product.categ_id || 'General'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No products available</p>
        )}
      </div>

      {/* Delivery Option */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Delivery Option *
        </label>
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="deliveryOption"
              value="pickup"
              checked={deliveryOption === 'pickup'}
              onChange={(e) => setDeliveryOption(e.target.value)}
            />
            <span>Pickup At</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="deliveryOption"
              value="deliver"
              checked={deliveryOption === 'deliver'}
              onChange={(e) => setDeliveryOption(e.target.value)}
            />
            <span>Deliver To</span>
          </label>
        </div>

        {deliveryOption === 'pickup' && (
          <div className="bg-gray-50 p-3 rounded-lg border mt-2">
            <p className="text-sm text-gray-800 font-medium">
              Oceana Positive, Survey No. 508/2 & 509/2, Ootla Village, Jinnaram Mandal, Sangareddy District, Suburbs of Hyderabad, Telangana - 502319
            </p>
          </div>
        )}
      </div>

      {/* Order Summary */}
      {orderItems.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Order Summary
          </h3>
          <div className="space-y-3">
            {orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white p-3 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">🛒</span>
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      ₹{Number(item.price).toFixed(2)} each
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600">Total Items: {itemCount}</p>
              </div>
              <p className="text-xl font-bold text-gray-800">
                ₹{total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Information */}
      {deliveryOption === 'deliver' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Address *
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter your complete delivery address..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Any special delivery instructions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="2"
            />
          </div>
        </div>
      )}

      {/* Estimated Delivery */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          <p className="font-medium text-blue-800">Delivery Information</p>
        </div>
        <p className="text-sm text-blue-700">
          • Standard delivery within 24-48 hours
        </p>
        <p className="text-sm text-blue-700">
          • Free delivery for orders above ₹500
        </p>
        {total < 500 && (
          <p className="text-sm text-blue-700">
            • Delivery charges: ₹50 (Add ₹{(500 - total).toFixed(2)} more for
            free delivery)
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 disabled:opacity-50 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || orderItems.length === 0}
          className="flex-1 bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 disabled:opacity-50 font-medium"
        >
          {loading ? 'Placing Order...' : `Place Order - ₹${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default CustomerOrderForm;
