import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fastapi_url } from '../App';

const formatOdooDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const CreateOrderForm = ({ onClose, onSubmit, reloadData }) => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedCap, setSelectedCap] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        fastapi_url+'/fastapi/odoo/contacts/external-contacts'
      );
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching customers:', err.message);
      setCustomers([]);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        fastapi_url+'/fastapi/odoo/products'
      );
      if (Array.isArray(res.data.products)) {
        // Simulate sizes and cap_types if not present
        const formattedProducts = res.data.products.map((p) => ({
          ...p,
          price: p.list_price,
          sizes: ['250ml', '500ml', '1000ml'], // example
          cap_types: ['fliptop', 'screwcap', 'sportscap'], // example
        }));
        setProducts(formattedProducts);
      }
    } catch (err) {
      console.error('Error fetching products:', err.message);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, [reloadData]);

  const addProduct = () => {
    if (!selectedProduct) return;
    const existing = orderItems.find((item) => item.id === selectedProduct.id);
    if (existing) {
      setOrderItems(
        orderItems.map((item) =>
          item.id === selectedProduct.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          ...selectedProduct,
          quantity: 1,
          selectedSize,
          selectedCap,
        },
      ]);
    }
    // Reset selections
    setSelectedProduct(null);
    setSelectedSize('');
    setSelectedCap('');
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

  const handleSubmit = async () => {
    if (!selectedCustomer || orderItems.length === 0) {
      alert('Please select a customer and add at least one product.');
      return;
    }

    const customer = customers.find((c) => c.name === selectedCustomer);
    if (!customer) {
      alert('Selected customer not found.');
      return;
    }

    const order_line = orderItems.map((item) => ({
      product_id: item.id,
      product_uom_qty: item.quantity,
      size: item.selectedSize,
      cap_type: item.selectedCap,
    }));

    const date_order = formatOdooDate(new Date());

    try {
      setLoading(true);
      const response = await axios.post(
        fastapi_url+'/fastapi/odoo/orders',
        { partner_id: customer.id, date_order, order_line },
        { headers: { 'Content-Type': 'application/json' } }
      );
       //alert('Order created successfully!');
      onSubmit({ customer: selectedCustomer, items: orderItems, total, apiResponse: response.data });
      onClose();
    } catch (err) {
      console.error('Error creating order:', err.response || err.message);
      alert('Failed to create order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Customers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a customer...</option>
          {customers.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name} - {c.phone || 'No phone'}
            </option>
          ))}
        </select>
      </div>

      {/* Products */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
        <select
          value={selectedProduct ? selectedProduct.id : ''}
          onChange={(e) => {
            const prod = products.find((p) => p.id === Number(e.target.value));
            setSelectedProduct(prod || null);
            setSelectedSize('');
            setSelectedCap('');
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - ₹{p.price}
            </option>
          ))}
        </select>
      </div>

      {/* Size */}
      {selectedProduct && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Size</label>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose size...</option>
            {selectedProduct.sizes.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {/* Cap Type */}
      {selectedProduct && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Cap Type</label>
          <select
            value={selectedCap}
            onChange={(e) => setSelectedCap(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose cap type...</option>
            {selectedProduct.cap_types.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Add Product Button */}
      {selectedProduct && selectedSize && selectedCap && (
        <button
          type="button"
          onClick={addProduct}
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
        >
          Add Product
        </button>
      )}

      {/* Order Items */}
      {orderItems.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
          <div className="space-y-2">
            {orderItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600 ml-2">₹{item.price}</span>
                  <div className="text-gray-500 text-sm">
                    Size: {item.selectedSize}, Cap: {item.selectedCap}
                  </div>
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
            <span className="text-lg font-bold text-gray-800">Total: ₹{total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </div>
    </div>
  );
};

export default CreateOrderForm;
