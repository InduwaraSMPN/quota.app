import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants';
import { safeJsonParse, safeJsonStringify } from '../utils';

class StorageService {
  // Secure Storage Methods (for sensitive data like tokens)
  async setSecureItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error setting secure item ${key}:`, error);
      throw error;
    }
  }

  async getSecureItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error getting secure item ${key}:`, error);
      return null;
    }
  }

  async deleteSecureItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error deleting secure item ${key}:`, error);
    }
  }

  // Regular Storage Methods (for non-sensitive data)
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = safeJsonStringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  }

  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return safeJsonParse(jsonValue, defaultValue);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return defaultValue;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Authentication Token Methods
  async saveAuthToken(token: string): Promise<void> {
    await this.setSecureItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async getAuthToken(): Promise<string | null> {
    return await this.getSecureItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  async saveRefreshToken(token: string): Promise<void> {
    await this.setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  async getRefreshToken(): Promise<string | null> {
    return await this.getSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  async clearAuthTokens(): Promise<void> {
    await this.deleteSecureItem(STORAGE_KEYS.AUTH_TOKEN);
    await this.deleteSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  // User Data Methods
  async saveUserData(userData: any): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_DATA, userData);
  }

  async getUserData(): Promise<any> {
    return await this.getItem(STORAGE_KEYS.USER_DATA, null);
  }

  async clearUserData(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Station Data Methods
  async saveStationData(stationData: any): Promise<void> {
    await this.setItem(STORAGE_KEYS.STATION_DATA, stationData);
  }

  async getStationData(): Promise<any> {
    return await this.getItem(STORAGE_KEYS.STATION_DATA, null);
  }

  async clearStationData(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.STATION_DATA);
  }

  // Recent Searches Methods
  async saveRecentSearch(registrationNumber: string): Promise<void> {
    const recentSearches = await this.getRecentSearches();
    const updatedSearches = [
      registrationNumber,
      ...recentSearches.filter(search => search !== registrationNumber)
    ].slice(0, 10); // Keep only last 10 searches

    await this.setItem(STORAGE_KEYS.RECENT_SEARCHES, updatedSearches);
  }

  async getRecentSearches(): Promise<string[]> {
    return await this.getItem(STORAGE_KEYS.RECENT_SEARCHES, []);
  }

  async clearRecentSearches(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
  }

  // App Settings Methods
  async saveSettings(settings: any): Promise<void> {
    await this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  async getSettings(): Promise<any> {
    return await this.getItem(STORAGE_KEYS.SETTINGS, {
      autoLogoutTimer: 30, // minutes
      soundEnabled: true,
      hapticEnabled: true,
      cameraFlashEnabled: false,
      notifications: {
        transactions: true,
        system: true,
        warnings: true,
      },
    });
  }

  // Utility Methods
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  async getMultiple(keys: string[]): Promise<[string, string | null][]> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return [];
    }
  }

  async setMultiple(keyValuePairs: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('Error setting multiple items:', error);
      throw error;
    }
  }

  async removeMultiple(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error removing multiple items:', error);
    }
  }

  // Check if user is logged in
  async isLoggedIn(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }

  // Complete logout - clear all user-related data
  async logout(): Promise<void> {
    await this.clearAuthTokens();
    await this.clearUserData();
    await this.clearStationData();
    // Keep recent searches and settings for better UX
  }

  // Get storage usage info (for debugging)
  async getStorageInfo(): Promise<{
    totalKeys: number;
    secureItems: string[];
    regularItems: string[];
  }> {
    const allKeys = await this.getAllKeys();
    const secureKeys = Object.values(STORAGE_KEYS).filter(key => 
      key.includes('token') || key.includes('auth')
    );
    
    return {
      totalKeys: allKeys.length,
      secureItems: secureKeys,
      regularItems: allKeys.filter(key => !secureKeys.includes(key)),
    };
  }
}

// Create and export a singleton instance
const storageService = new StorageService();
export default storageService;
