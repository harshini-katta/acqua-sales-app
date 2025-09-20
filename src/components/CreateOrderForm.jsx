import React, { useEffect, useState, useCallback, useRef } from 'react';
import ApiService from '../utils/apiService';

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
  
  const [loadingState, setLoadingState] = useState({
    customers: false,
    products: false,
    order: false,
    initialLoad: false
  });
  
  const [errors, setErrors] = useState({
    customers: null,
    products: null,
    order: null
  });

  // Use refs to prevent duplicate calls and handle cleanup
  const abortControllerRef = useRef(null);
  const isLoadingRef = useRef(false);

  // Enhanced batch load data with proper cleanup
  const loadData = useCallback(async () => {
    // Prevent duplicate calls
    if (isLoadingRef.current) {
      console.log('Data loading already in progress, skipping...');
      return;
    }

    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    isLoadingRef.current = true;
    abortControllerRef.current = new AbortController();
    
    setLoadingState(prev => ({ ...prev, initialLoad: true }));
    console.log('Starting batch data loading...');
    
    try {
      const { results, errors: batchErrors } = await ApiService.batchLoad([
        {
          key: 'customers',
          operation: () => ApiService.getCustomers(true),
          delay: 300 // 300ms delay between operations
        },
        {
          key: 'products', 
          operation: () => ApiService.getProducts(0, 100, false), // forceRefresh = false for caching
          delay: 0 // No delay after last operation
        }
      ], abortControllerRef.current);

      // Check if operation was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('Data loading was aborted');
        return;
      }

      // Process customers
      if (results.customers) {
        const customerData = Array.isArray(results.customers.data) ? results.customers.data : [];
        setCustomers(customerData);
        console.log(`Loaded ${customerData.length} customers`);
      }

      // Process products
      if (results.products) {
        const productsData = results.products.data.products || [];
        const formattedProducts = productsData.map((p) => ({
          ...p,
          price: p.list_price || p.price,
          sizes: p.sizes || ['250ml', '500ml', '1000ml'],
          cap_types: p.cap_types || ['fliptop', 'screwcap', 'sportscap'],
        }));
        setProducts(formattedProducts);
        console.log(`Loaded ${formattedProducts.length} products`);
      }

      // Handle any errors
      const errorMessages = {};
      if (batchErrors.customers) {
        errorMessages.customers = ApiService.getErrorMessage(batchErrors.customers);
        setCustomers([]);
      }
      if (batchErrors.products) {
        errorMessages.products = ApiService.getErrorMessage(batchErrors.products);
        setProducts([]);
      }
      
      setErrors(errorMessages);
      console.log('Batch loading completed');
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Data loading was aborted');
        return;
      }
      console.error('Batch loading failed:', error);
      setErrors({
        customers: 'Failed to load data',
        products: 'Failed to load data',
        order: null
      });
    } finally {
      setLoadingState(prev => ({ ...prev, initialLoad: false }));
      isLoadingRef.current = false;
      abortControllerRef.current = null;
    }
  }, []);

  // Load data on component mount and when reloadData changes
  useEffect(() => {
    loadData();
    
    // Cleanup function to abort requests when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isLoadingRef.current = false;
    };
  }, [loadData, reloadData]);

  // Retry failed data loading
  const retryFailedData = () => {
    // Reset loading state first
    isLoadingRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear errors and retry
    setErrors({ customers: null, products: null, order: null });
    loadData();
  };

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
    const orderData = { partner_id: customer.id, date_order, order_line };
    
    setLoadingState(prev => ({ ...prev, order: true }));
    setErrors(prev => ({ ...prev, order: null }));

    try {
      console.log('Creating order...');
      const response = await ApiService.createOrder(orderData);
      
      console.log('Order created successfully:', response.data);
      onSubmit({ 
        customer: selectedCustomer, 
        items: orderItems, 
        total, 
        apiResponse: response.data 
      });
      onClose();
      
    } catch (error) {
      const errorMessage = ApiService.getErrorMessage(error);
      console.error('Error creating order:', error);
      setErrors(prev => ({ ...prev, order: errorMessage }));
      alert(`Failed to create order: ${errorMessage}`);
    } finally {
      setLoadingState(prev => ({ ...prev, order: false }));
    }
  };

  // Loading state check
  const isLoading = loadingState.initialLoad || loadingState.customers || loadingState.products;
  const hasErrors = errors.customers || errors.products;

  return (
    <div className="space-y-6">
      {/* Overall loading indicator */}
      {loadingState.initialLoad && (
        <div className="text-center py-4">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            Loading order form data...
          </div>
        </div>
      )}

      {/* Error messages and retry buttons */}
      {hasErrors && !loadingState.initialLoad && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-red-800 font-medium">Data Loading Error</h3>
              {errors.customers && (
                <p className="text-red-600 text-sm mt-1">Customers: {errors.customers}</p>
              )}
              {errors.products && (
                <p className="text-red-600 text-sm mt-1">Products: {errors.products}</p>
              )}
            </div>
            <button
              onClick={retryFailedData}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        </div>
      )}

      {/* Customers dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Customer
          {loadingState.customers && <span className="text-blue-600 ml-2">(Loading...)</span>}
        </label>
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          disabled={loadingState.customers || customers.length === 0}
        >
          <option value="">
            {loadingState.customers 
              ? 'Loading customers...' 
              : customers.length === 0 
                ? errors.customers ? 'Failed to load customers' : 'No customers available'
                : 'Choose a customer...'
            }
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name} - {c.phone || 'No phone'}
            </option>
          ))}
        </select>
      </div>

      {/* Products dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Product
          {loadingState.products && <span className="text-blue-600 ml-2">(Loading...)</span>}
        </label>
        <select
          value={selectedProduct ? selectedProduct.id : ''}
          onChange={(e) => {
            const prod = products.find((p) => p.id === Number(e.target.value));
            setSelectedProduct(prod || null);
            setSelectedSize('');
            setSelectedCap('');
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          disabled={loadingState.products || products.length === 0}
        >
          <option value="">
            {loadingState.products 
              ? 'Loading products...' 
              : products.length === 0 
                ? errors.products ? 'Failed to load products' : 'No products available'
                : 'Choose a product...'
            }
          </option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - ₹{p.price}
            </option>
          ))}
        </select>
      </div>

      {/* Size selection */}
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

      {/* Cap Type selection */}
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
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          Add Product
        </button>
      )}

      {/* Order Items display */}
      {orderItems.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
          <div className="space-y-2">
            {orderItems.map((item) => (
              <div key={`${item.id}-${item.selectedSize}-${item.selectedCap}`} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
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
                    className="bg-red-500 text-white w-6 h-6 rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="bg-green-500 text-white w-6 h-6 rounded text-sm hover:bg-green-600 transition-colors"
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

      {/* Order creation error */}
      {errors.order && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">Order Creation Error: {errors.order}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          disabled={loadingState.order}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          disabled={
            loadingState.order || 
            customers.length === 0 || 
            products.length === 0 || 
            !selectedCustomer || 
            orderItems.length === 0 ||
            hasErrors
          }
        >
          {loadingState.order ? (
            <span className="inline-flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </span>
          ) : (
            'Create Order'
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateOrderForm;