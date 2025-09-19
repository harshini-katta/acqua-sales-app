import React, { useState } from 'react';
import axios from 'axios';
import { BottleWine, Eye, EyeOff } from 'lucide-react';

const LoginForm = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👈 state for toggling password

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (credentials.email && credentials.password) {
      setLoading(true);
      try {
        const response = await axios.post(
          'https://d28c5r6pnnqv4m.cloudfront.net/fastapi/api/login',
          {
            email: credentials.email,
            password: credentials.password,
          }
        );

        const data = response.data;
        let name = data.name || credentials.email.split('@')[0];
        name = name.charAt(0).toUpperCase() + name.slice(1);
        const group = data.group || 'User';

        onLogin({
          email: data.email,
          name,
          group,
          company: data.company || '',
          token: data.access_token || '',
          userId: data.user_id || '',
        });

      } catch (err) {
        console.error(err);
        setError('Login failed. Please check your email and password.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <BottleWine className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">AquaSales Login</h1>
          <p className="text-gray-600">Premium Bottled Water Sales</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'} // 👈 toggle type
              placeholder="Password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // 👈 toggle handler
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
