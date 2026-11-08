import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  googleLogin: () => Promise<void>;
  quickLogin: (role: 'student' | 'pro' | 'admin') => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('campusmate_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('campusmate_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('campusmate_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/profile');
          if (res.success && res.user) {
            const u = res.user;
            const formatted: User = {
              id: u.id,
              email: u.email,
              role: u.role,
              fullName: u.profile?.full_name || 'Student',
              collegeName: u.profile?.college_name || '',
              course: u.profile?.course || '',
              semester: u.profile?.semester || 1,
              academicYear: u.profile?.academic_year || '',
              avatarUrl: u.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.email)}`,
              bio: u.profile?.bio || '',
              planTier: u.subscription?.plan_tier || 'free',
              aiQueriesUsedToday: u.subscription?.ai_queries_used_today || 0,
              aiQueriesLimit: u.subscription?.ai_queries_limit || 10,
            };
            setUser(formatted);
            localStorage.setItem('campusmate_user', JSON.stringify(formatted));
          }
        } catch (err) {
          console.warn('Session expired or offline. Keeping cached user if available.');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('campusmate_token', res.token);
      localStorage.setItem('campusmate_user', JSON.stringify(res.user));
    }
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('campusmate_token', res.token);
      localStorage.setItem('campusmate_user', JSON.stringify(res.user));
    }
  };

  const googleLogin = async () => {
    const mockEmail = `student_${Math.floor(100 + Math.random() * 900)}@campusmate.ai`;
    const res = await api.post('/auth/google', {
      email: mockEmail,
      fullName: 'Google Student',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    });
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('campusmate_token', res.token);
      localStorage.setItem('campusmate_user', JSON.stringify(res.user));
    }
  };

  const quickLogin = async (role: 'student' | 'pro' | 'admin') => {
    let email = 'student@campusmate.ai';
    let password = 'campusmate123';

    if (role === 'admin') {
      email = 'admin@campusmate.ai';
      password = 'campusmate123';
    } else if (role === 'pro') {
      email = 'pro@campusmate.ai';
      password = 'campusmate123';
    }

    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('campusmate_token');
    localStorage.removeItem('campusmate_user');
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('campusmate_user', JSON.stringify(updated));
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.success && res.user) {
        const u = res.user;
        const formatted: User = {
          id: u.id,
          email: u.email,
          role: u.role,
          fullName: u.profile?.full_name || 'Student',
          collegeName: u.profile?.college_name || '',
          course: u.profile?.course || '',
          semester: u.profile?.semester || 1,
          academicYear: u.profile?.academic_year || '',
          avatarUrl: u.profile?.avatar_url,
          bio: u.profile?.bio || '',
          planTier: u.subscription?.plan_tier || 'free',
          aiQueriesUsedToday: u.subscription?.ai_queries_used_today || 0,
          aiQueriesLimit: u.subscription?.ai_queries_limit || 10,
        };
        setUser(formatted);
        localStorage.setItem('campusmate_user', JSON.stringify(formatted));
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        googleLogin,
        quickLogin,
        logout,
        updateUser,
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
