import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auth';
import { api, setAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (emailOrPhone: string, pass: string) => Promise<User>;
  register: (payload: any) => Promise<{ user: User; verificationCode?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const userData = await api.get<User>('/auth/me');
      setUser(userData);
    } catch {
      setUser(null);
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (emailOrPhone: string, pass: string) => {
    const data = await api.post<{ user: User; accessToken: string }>('/auth/login', {
      emailOrPhone,
      password: pass,
    });
    setAuthToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload: any) => {
    const data = await api.post<{ user: User; accessToken: string; verificationCode?: string }>(
      '/auth/register',
      payload
    );
    setAuthToken(data.accessToken);
    setUser(data.user);
    return { user: data.user, verificationCode: data.verificationCode };
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue cleanup on error
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
