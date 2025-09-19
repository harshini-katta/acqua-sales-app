import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { fastapi_url } from '../App';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(fastapi_url+'/fastapi/odoo/contacts/external-contacts')
      .then((res) => res.json())
      .then((data) => {
        // ✅ API returns an array, not { contacts: [...] }
        setCustomers(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error('Error fetching contacts:', err));
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone || '').includes(searchTerm) ||
    (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <h4 className="font-medium text-gray-800">{customer.name}</h4>

            <p className="text-sm text-gray-600">
              📞 {customer.phone || 'No phone available'}
            </p>

            <p className="text-sm text-gray-600">
              ✉️ {customer.email || 'No email available'}
            </p>

            {(customer.street || customer.city || customer.country_id) && (
              <p className="text-sm text-gray-500">
                {customer.street ? customer.street + ', ' : ''}
                {customer.city ? customer.city + ', ' : ''}
                {Array.isArray(customer.country_id) ? customer.country_id[1] : ''}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomersList;
