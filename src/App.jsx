import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import SalespersonDashboard from './components/SalespersonDashboard';
import ProcessorDashboard from './components/ProcessorDashboard';
import CustomerDashboard from './components/CustomerDashboard';

const App = () => {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => setUser(null);

  const renderDashboard = () => {
    if (!user) return <LoginForm onLogin={handleLogin} />;
    user.role='customer';
    switch (user.role) {
      case 'salesperson':
        return <SalespersonDashboard user={user} onLogout={handleLogout} />;
      case 'processor':
        return <ProcessorDashboard user={user} onLogout={handleLogout} />;
      case 'customer':
        return <CustomerDashboard user={user} onLogout={handleLogout} />;
      default:
        return <SalespersonDashboard user={user} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="App">
      {renderDashboard()}
    </div>
  );
};

export default App;