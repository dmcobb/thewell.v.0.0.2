import type React from 'react';
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
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
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser); // Will be null if guest, or user object if logged in
      } catch (e) {
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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
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
      router.replace('/');
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register: async () => {}, // Map your register logic here
    logout,
    refreshUser: async () => { const u = await authService.getCurrentUser(); setUser(u); },
    onboardingProgress: null,
    loadOnboardingProgress: async () => {},
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}