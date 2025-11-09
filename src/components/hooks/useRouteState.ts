// hooks/useRouteState.ts
import { useState, useEffect } from 'react';

export const useRouteState = () => {
  const [currentPath, setCurrentPath] = useState('/login');
  const [lastAuthenticatedPath, setLastAuthenticatedPath] = useState('/dashboard');

  useEffect(() => {
    const lastPath = localStorage.getItem('lastAuthPath');
    if (lastPath) {
      setLastAuthenticatedPath(lastPath);
    }
  }, []);

  useEffect(() => {
    if (currentPath !== '/login' && currentPath !== '/signup') {
      localStorage.setItem('lastAuthPath', currentPath);
      setLastAuthenticatedPath(currentPath);
    }
  }, [currentPath]);

  return {
    currentPath,
    lastAuthenticatedPath,
    setCurrentPath,
    setLastAuthenticatedPath,
  };
};