import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getUserInfo());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getProfile();
          setUser({
            userId: profile.user_id,
            fullName: profile.full_name,
            email: profile.email,
            role: profile.role,
            departmentId: profile.department_id,
          });
        } catch (err) {
          console.warn('Failed to fetch user profile, using stored session if available:', err);
          setUser(authService.getUserInfo());
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const userInfo = {
      userId: data.user_id,
      fullName: data.full_name,
      email: data.email,
      role: data.role,
    };
    setUser(userInfo);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
