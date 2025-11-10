
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import Button from '../components/ui/Button';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>(UserRole.OPERACIONAL);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(role, password)) {
      setError('Senha incorreta.');
    } else {
      setError('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Sistema Pracafé ©- Alex</h1>
          <p className="mt-2 text-sm text-gray-600">Controle de Produção - Useon SAT52</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="role-select" className="sr-only">Nível de Acesso</label>
              <select
                id="role-select"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              >
                <option value={UserRole.OPERACIONAL}>Operacional</option>
                <option value={UserRole.CONTROLE}>Controle</option>
                <option value={UserRole.MANUTENCAO}>Manutenção</option>
              </select>
            </div>
            <div>
              <label htmlFor="password-input" className="sr-only">Senha</label>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Senha"
              />
            </div>
          </div>

          {error && <p className="text-sm text-center text-red-600">{error}</p>}

          <div>
            <Button type="submit" className="w-full" size="lg">
              Entrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
