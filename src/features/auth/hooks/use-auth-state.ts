/**
 * Auth State Manager
 * Provides stable auth state with minimal re-renders
 * Prevents flickering during auth checks
 */

import { useEffect, useState } from 'react';
import { useCurrent } from '../api/use-current';

interface AuthState {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

/**
 * Hook that provides stable authentication state
 * Uses optimistic loading patterns to reduce flickering
 */
export const useAuthState = () => {
  const { data: user, isLoading, error } = useCurrent();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isInitialized: false,
  });

  useEffect(() => {
    // Only update if we have definitive state
    if (!isLoading) {
      setAuthState({
        user: user || null,
        isLoading: false,
        isAuthenticated: !!user,
        isInitialized: true,
      });
    }
  }, [user, isLoading]);

  return authState;
};

/**
 * Hook for checking if user is authenticated
 * Returns stable boolean to prevent render loops
 */
export const useIsAuthenticated = () => {
  const { isAuthenticated, isInitialized } = useAuthState();
  return isInitialized ? isAuthenticated : null; // null = loading
};

/**
 * Hook that requires authentication
 * Redirects to sign-in if not authenticated
 */
export const useRequireAuth = () => {
  const { user, isLoading, isInitialized } = useAuthState();
  
  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      // Only redirect if we're certain user is not authenticated
      window.location.href = '/sign-in';
    }
  }, [user, isLoading, isInitialized]);

  return { user, isLoading, isAuthenticated: !!user };
};
