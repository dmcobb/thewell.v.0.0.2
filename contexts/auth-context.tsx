import type React from 'react';
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../lib/services/auth.service';
import { useRouter, useSegments } from 'expo-router';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  onboardingProgress: any | null;
  loadOnboardingProgress: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [onboardingProgress, setOnboardingProgress] = useState<any | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if token exists before making API call
        const token = await AsyncStorage.getItem('authToken');
        
        if (!token) {
          console.log('[Anointed Innovations] No token found - user is not logged in');
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        
        if (!currentUser?.profileComplete) {
          await loadOnboardingProgress();
        }
      } catch (e) {
        console.error('[Anointed Innovations] Auth init error:', e);
        // Clear invalid tokens
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('refreshToken');
        setUser(null);
      } finally {
        setIsLoading(false); 
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const currentPath = segments.join('/');
    const inAuthGroup = segments[0] === 'auth';
    const isIndex = currentPath === '' || currentPath === 'index' || !segments.length;

    if (!user && !inAuthGroup && !isIndex) {
      router.replace('/');
    } else if (user && isIndex) {
      router.replace(user.profileComplete ? '/(tabs)' : '/onboarding');
    }
  }, [user, segments, isLoading]);

  const loadOnboardingProgress = async () => {
    try {
      const { userService } = await import('../lib/services/user.service');
      const progress = await userService.getOnboardingProgress();
      if (progress) {
        setOnboardingProgress(progress);
      } else {
        setOnboardingProgress(null);
      }
    } catch (error: any) {
      setOnboardingProgress(null);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      
      if (!response.user.profileComplete) {
        await loadOnboardingProgress();
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setOnboardingProgress(null);
      router.replace('/');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const u = await authService.getCurrentUser();
      setUser(u);
    } catch (error) {
      console.error('[Anointed Innovations] Error refreshing user:', error);
    }
  };

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    onboardingProgress,
    loadOnboardingProgress,
  }), [user, isLoading, onboardingProgress]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}