// context/AuthContext.tsx
'use client'; // This needs to be a client component

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
// Update the import path below if your api file is located elsewhere, e.g. '../../lib/api'
import { fetchApi } from '../lib/api';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'player' | 'owner';
}

interface AuthContextType {
  user: User | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        try {
          const data = await fetchApi('/auth/me');
          setUser(data.data);
        } catch (error) {
          localStorage.removeItem('jwt_token');
        }
      }
      setLoading(false);
    };
    loadUserFromToken();
  }, []);

  const login = async (data: any) => {
    const { token } = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('jwt_token', token);
    const userData = await fetchApi('/auth/me');
    setUser(userData.data);
    router.push('/');
  };

  const register = async (data: any) => {
    const { token } = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    localStorage.setItem('jwt_token', token);
    const userData = await fetchApi('/auth/me');
    setUser(userData.data);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
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