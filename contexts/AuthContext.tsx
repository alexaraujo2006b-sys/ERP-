
import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { User } from '../types';
import { UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PASSWORDS: Record<UserRole, string> = {
  [UserRole.OPERACIONAL]: '123',
  [UserRole.CONTROLE]: '321',
  [UserRole.MANUTENCAO]: '789',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('erp-user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (role: UserRole, pass: string): boolean => {
    if (PASSWORDS[role] === pass) {
      const newUser = { role };
      localStorage.setItem('erp-user', JSON.stringify(newUser));
      setUser(newUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('erp-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
