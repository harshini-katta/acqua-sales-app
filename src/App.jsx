import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import SalespersonDashboard from './components/SalespersonDashboard';
import ProcessorDashboard from './components/ProcessorDashboard'; // ✅ use PascalCase
import CustomerDashboard from './components/CustomerDashboard';

const App = () => {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => setUser(null);

  const renderDashboard = () => {
    if (!user) return <LoginForm onLogin={handleLogin} />;
    // user.role='salesperson';
    // ✅ don't mutate user.role
    switch (user.group) {
      case 'salesperson':
        return <SalespersonDashboard user={user} onLogout={handleLogout} />;
      case 'backoffice':
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
