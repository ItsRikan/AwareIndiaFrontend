import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthState, LoginCredentials, SignupCredentials } from '@/types';
import { apiClient } from '@/lib/api';
import { authTokenService } from '@/lib/authTokenService';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<{ error?: string }>;
  isSupabaseMode: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Maps backend auth errors to user-friendly messages
 */
function mapAuthError(errorCode: string | undefined, errorMessage: string = '', statusCode?: number): string {
  if (errorCode === 'NETWORK_ERROR') {
    return 'Unable to connect. Please check your internet connection.';
  }
  
  if (errorCode === 'AUTH_FAILED' || statusCode === 401) {
    const detail = errorMessage.toLowerCase();
    
    if (detail.includes('invalid credentials') || detail.includes('user not found')) {
      return 'Invalid email or password';
    }
    if (detail.includes('email not confirmed')) {
      return 'Please verify your email before logging in';
    }
    if (detail.includes('user already registered')) {
      return 'This email is already registered';
    }
    if (detail.includes('account disabled')) {
      return 'Your account has been disabled';
    }
    
    return errorMessage || 'Invalid credentials';
  }
  
  return errorMessage || 'Operation failed';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Determine user from token
  const getUserFromToken = (accessToken: string, userId: string): User | null => {
    try {
      const decoded: any = jwtDecode(accessToken);

      // Extract available info from JWT
      const email = decoded.email || '';
      const metadata = decoded.user_metadata || {};

      return {
        id: userId,
        email: email,
        username: metadata.username || email.split('@')[0] || 'User',
        name: metadata.name || 'User',
        createdAt: new Date().toISOString(),
      };
    } catch (e) {
      console.error('Failed to decode token', e);
      return null;
    }
  };

  // Initialize auth state with automatic token refresh
  useEffect(() => {
    const initAuth = async () => {
      // Check if we have a refresh token
      const refreshToken = authTokenService.getRefreshToken();
      const userId = authTokenService.getUserId();

      if (refreshToken && userId) {
        // Try to refresh the access token
        try {
          const response = await apiClient.refresh(refreshToken);

          // Store new tokens
          authTokenService.setTokens(
            response.access_token,
            response.refresh_token,
            response.expires_in,
            response.user_id
          );

          const user = getUserFromToken(response.access_token, response.user_id);

          if (user) {
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        } catch (error) {
          console.error('Failed to refresh token on init', error);
          // Clear invalid tokens
          authTokenService.clearTokens();
        }
      }

      // No valid session
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    };

    initAuth();
  }, []);

  // Listen for token expiry events from API client
  useEffect(() => {
    const handleTokenExpiry = () => {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    };

    window.addEventListener('auth:token-expired', handleTokenExpiry);
    return () => window.removeEventListener('auth:token-expired', handleTokenExpiry);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const response = await apiClient.login({ email, password });

      // Store tokens using token service
      authTokenService.setTokens(
        response.access_token,
        response.refresh_token,
        response.expires_in,
        response.user_id
      );

      const user = getUserFromToken(response.access_token, response.user_id);

      setState({
        user: user,
        isAuthenticated: true,
        isLoading: false,
      });

      return {};
    } catch (error: any) {
      const errorMessage = mapAuthError(error.code, error.message, error.status);
      return { error: errorMessage };
    }
  }, []);

  const signup = useCallback(async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ error?: string }> => {
    try {
      await apiClient.signup({ email, password, name });
      // Signup usually requires email verification
      return {};
    } catch (error: any) {
      const errorMessage = mapAuthError(error.code, error.message, error.status);
      return { error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    const token = authTokenService.getAccessToken();
    if (token) {
      await apiClient.logout(token);
    }

    // Clear all tokens
    authTokenService.clearTokens();

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const deleteAccount = useCallback(async (): Promise<{ error?: string }> => {
    // Delete account is not supported by the minimal backend provided yet
    return { error: 'Account deletion not supported yet.' };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        deleteAccount,
        isSupabaseMode: true,
      }}
    >
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
