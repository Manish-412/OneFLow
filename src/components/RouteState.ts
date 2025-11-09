// RouteState.ts
import { createContext, useContext } from 'react';

export interface RouteState {
  currentPath: string;
  lastAuthenticatedPath: string;
  setCurrentPath: (path: string) => void;
  setLastAuthenticatedPath: (path: string) => void;
}

export const RouteStateContext = createContext<RouteState>({
  currentPath: '/login',
  lastAuthenticatedPath: '/dashboard',
  setCurrentPath: () => {},
  setLastAuthenticatedPath: () => {},
});