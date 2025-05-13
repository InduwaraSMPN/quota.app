"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
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

        // Verify token by fetching user profile
        const response = await apiService.getUserProfile();

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
        // Handle specific error cases
        if (response.status === 401) {
          setError('Invalid email or password');
          throw new Error('Invalid email or password');
        } else if (response.status === 403) {
          if (response.error?.includes('inactive')) {
            setError('Your account is inactive. Please contact support.');
            throw new Error('Account inactive');
          } else if (response.error?.includes('verified')) {
            setError('Your email is not verified. Please verify your email first.');
            throw new Error('Email not verified');
          } else {
            setError(response.error || 'Access denied');
            throw new Error('Access denied');
          }
        } else {
          setError(response.error || 'Login failed');
          throw new Error('Login failed');
        }
      }

      // Check if user has vehicle owner role
      if (response.data.role !== 'VEHICLE_OWNER') {
        setError('Access denied. This portal is for vehicle owners only.');
        setIsAuthenticated(false);
        setUser(null);
        throw new Error('Invalid role');
      }

      // Save token to localStorage
      localStorage.setItem('token', response.data.token);

      // Fetch user profile
      const profileResponse = await apiService.getUserProfile();

      if (profileResponse.error || !profileResponse.data) {
        setError(profileResponse.error || 'Failed to fetch user profile');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        throw new Error('Failed to fetch profile');
      }

      setUser(profileResponse.data);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
      // Error is already set in the catch blocks above
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
