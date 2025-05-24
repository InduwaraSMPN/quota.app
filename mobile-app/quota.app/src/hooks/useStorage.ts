import { useState, useEffect } from 'react';
import { storageService } from '../services';

interface UseStorageReturn<T> {
  data: T;
  setData: (value: T) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const useStorage = <T>(key: string, defaultValue: T): UseStorageReturn<T> => {
  const [data, setDataState] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [key]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const storedData = await storageService.getItem(key, defaultValue);
      setDataState(storedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const setData = async (value: T) => {
    try {
      setError(null);
      await storageService.setItem(key, value);
      setDataState(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save data');
      throw err;
    }
  };

  return {
    data,
    setData,
    loading,
    error,
  };
};

export default useStorage;
