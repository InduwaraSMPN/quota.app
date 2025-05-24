import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthRequest, AuthResponse, User, FuelStation } from '../types';
import { apiService, storageService, notificationService } from '../services';

interface AuthContextType {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  station: FuelStation | null;
  
  // Actions
  login: (credentials: AuthRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [station, setStation] = useState<FuelStation | null>(null);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const token = await storageService.getAuthToken();
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setStation(null);
        return;
      }

      // Try to get user data from storage first
      const storedUser = await storageService.getUserData();
      const storedStation = await storageService.getStationData();

      if (storedUser && storedStation) {
        setUser(storedUser);
        setStation(storedStation);
        setIsAuthenticated(true);
      } else {
        // If no stored data, try to refresh token and get fresh data
        const refreshSuccess = await refreshToken();
        if (!refreshSuccess) {
          await logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: AuthRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await apiService.login(credentials);
      
      if (response.error || !response.data) {
        notificationService.showLoginError(response.error || 'Login failed');
        return false;
      }

      const authData = response.data;
      
      // Save tokens
      await apiService.saveTokens(authData);
      
      // Get station details
      const stationResponse = await apiService.getStationDetails();
      if (stationResponse.error || !stationResponse.data) {
        notificationService.showError('Failed to load station details');
        return false;
      }

      const stationData = stationResponse.data;
      
      // Create user object from auth response and station data
      const userData: User = {
        id: stationData.owner.user.id,
        email: stationData.owner.user.email,
        role: authData.role,
        isActive: stationData.owner.user.isActive,
        lastLogin: stationData.owner.user.lastLogin,
      };

      // Save user and station data
      await storageService.saveUserData(userData);
      await storageService.saveStationData(stationData);

      // Update state
      setUser(userData);
      setStation(stationData);
      setIsAuthenticated(true);

      notificationService.showLoginSuccess();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      notificationService.showLoginError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Clear tokens and data
      await apiService.clearTokens();
      await storageService.logout();
      
      // Update state
      setIsAuthenticated(false);
      setUser(null);
      setStation(null);
      
      notificationService.showLogoutSuccess();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = await storageService.getRefreshToken();
      if (!refreshTokenValue) {
        return false;
      }

      const response = await apiService.refreshToken(refreshTokenValue);
      
      if (response.error || !response.data) {
        return false;
      }

      const authData = response.data;
      
      // Save new tokens
      await apiService.saveTokens(authData);
      
      // Get fresh station details
      const stationResponse = await apiService.getStationDetails();
      if (stationResponse.error || !stationResponse.data) {
        return false;
      }

      const stationData = stationResponse.data;
      
      // Create user object
      const userData: User = {
        id: stationData.owner.user.id,
        email: stationData.owner.user.email,
        role: authData.role,
        isActive: stationData.owner.user.isActive,
        lastLogin: stationData.owner.user.lastLogin,
      };

      // Save updated data
      await storageService.saveUserData(userData);
      await storageService.saveStationData(stationData);

      // Update state
      setUser(userData);
      setStation(stationData);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    station,
    login,
    logout,
    refreshToken,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
