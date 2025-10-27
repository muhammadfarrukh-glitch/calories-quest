import { useState, useEffect } from 'react';
import { getToken } from '@/utils/auth';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  return { isLoggedIn, isLoading };
};