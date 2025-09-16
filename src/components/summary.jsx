import React, { useEffect, useState } from 'react';

const SummaryDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://d28c5r6pnnqv4m.cloudfront.net/fastapi/odoo/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard summary:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading dashboard summary...</p>;
  }

  if (!summary) {
    return <p>No dashboard data available</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md">
        <h4 className="text-sm font-medium text-gray-600">Total Events</h4>
        <p className="text-2xl font-bold text-blue-600">{summary.total_events}</p>
      </div>

      <div className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md">
        <h4 className="text-sm font-medium text-gray-600">Total Products</h4>
        <p className="text-2xl font-bold text-green-600">{summary.total_products}</p>
      </div>

      <div className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md">
        <h4 className="text-sm font-medium text-gray-600">Total Orders</h4>
        <p className="text-2xl font-bold text-purple-600">{summary.total_orders}</p>
      </div>

      <div className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md">
        <h4 className="text-sm font-medium text-gray-600">Total Sales</h4>
        <p className="text-2xl font-bold text-orange-600">₹{summary.total_sales.toLocaleString()}</p>
      </div>

      <div className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md">
        <h4 className="text-sm font-medium text-gray-600">GST Collected</h4>
        <p className="text-2xl font-bold text-red-600">₹{summary.gst_collected.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default SummaryDashboard;
