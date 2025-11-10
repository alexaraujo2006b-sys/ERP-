
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Production from './pages/Production';
import PCP from './pages/PCP';
import MaintenanceLog from './pages/MaintenanceLog';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'production':
        return <Production />;
      case 'pcp':
        return <PCP />;
      case 'maintenance':
        return <MaintenanceLog />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} setPage={setCurrentPage} />
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
