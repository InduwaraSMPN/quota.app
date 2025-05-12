"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  fullName: string;
  employeeId?: string;
  department?: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Verify token by fetching admin profile
        const response = await apiService.getAdminProfile();
        
        if (response.error || !response.data) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
          setError(response.error || 'Authentication failed');
        } else {
          // Token is valid
          setIsAuthenticated(true);
          setUser(response.data);
          setError(null);
        }
      } catch (err) {
        setIsAuthenticated(false);
        setUser(null);
        setError('Authentication check failed');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.login(username, password);
      
      if (response.error || !response.data) {
        setError(response.error || 'Login failed');
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
      
      // Check if user has admin role
      if (response.data.role !== 'ADMIN') {
        setError('Access denied. Admin privileges required.');
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
      
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      
      // Fetch admin profile
      const profileResponse = await apiService.getAdminProfile();
      
      if (profileResponse.error || !profileResponse.data) {
        setError(profileResponse.error || 'Failed to fetch admin profile');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
      
      setUser(profileResponse.data);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError('Login failed');
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/auth/login');
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    error,
  };
}
