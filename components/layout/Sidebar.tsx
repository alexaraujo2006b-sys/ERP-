
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  currentPage: string;
  setPage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Home', page: 'dashboard', roles: [UserRole.OPERACIONAL, UserRole.CONTROLE, UserRole.MANUTENCAO], icon: '🏠' },
    { name: 'Produção', page: 'production', roles: [UserRole.OPERACIONAL, UserRole.CONTROLE], icon: '🏭' },
    { name: 'PCP', page: 'pcp', roles: [UserRole.CONTROLE], icon: '📊' },
    { name: 'Manutenção', page: 'maintenance', roles: [UserRole.CONTROLE, UserRole.MANUTENCAO], icon: '🔧' },
  ];

  const NavLink: React.FC<{ page: string; name: string; icon: string; }> = ({ page, name, icon }) => (
    <button
      onClick={() => setPage(page)}
      className={`w-full flex items-center p-3 my-1 rounded-lg transition-colors ${
        currentPage === page ? 'bg-secondary text-white' : 'text-gray-200 hover:bg-blue-800 hover:text-white'
      }`}
    >
      <span className="mr-3 text-2xl">{icon}</span>
      <span className="font-semibold">{name}</span>
    </button>
  );

  return (
    <div className="w-64 bg-primary text-white flex flex-col h-screen p-4 shadow-lg">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-white">Useon SAT52</h1>
        <p className="text-sm text-gray-300">Sistema Pracafé ©- Alex</p>
      </div>
      <nav className="flex-grow">
        {navItems.filter(item => user && item.roles.includes(user.role)).map(item => (
          <NavLink key={item.page} page={item.page} name={item.name} icon={item.icon} />
        ))}
      </nav>
      <div className="mt-auto">
        <button
          onClick={logout}
          className="w-full flex items-center p-3 my-1 rounded-lg transition-colors text-gray-200 hover:bg-red-700 hover:text-white"
        >
          <span className="mr-3 text-2xl">🚪</span>
          <span className="font-semibold">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
