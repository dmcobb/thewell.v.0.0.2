import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
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
  const [onboardingProgress, setOnboardingProgress] = useState<any | null>(
    null,
  );
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const isDataMissing =
      user &&
      (!user.locationCity ||
        !user.locationState ||
        !user.gender ||
        !user.dateOfBirth ||
        !user.phone);
    const inOnboarding = segments[0] === 'onboarding';
    const inStartJourney = segments[0] === 'start-journey';
    const inTabs = segments[0] === '(tabs)';
    const isVideoProfile = segments[0] === 'profile' && segments[1] === 'video';
    const inBrowse = segments[0] === 'browse';
    const inSettings = segments[0] === 'settings';
    const inChat = segments[0] === 'chat';
    const inAllowedScreens =
      inTabs || isVideoProfile || inBrowse || inSettings || inChat;

    if (!user && !inAuthGroup) {
      // Not authenticated and not in auth screens - redirect to splash
      router.replace('/');
    } else if (user) {
      // User is authenticated - check profile completion
      if (
        !user.profileComplete &&
        !inOnboarding &&
        !inStartJourney &&
        isDataMissing
      ) {
        // Profile not complete - redirect to start journey
        router.replace('/onboarding');
      } else if (user.profileComplete && !inAllowedScreens) {
        router.replace('/(tabs)');
      }
    }
  }, [user, segments, isLoading]);

  const loadUser = async () => {
    try {
      const isAuth = await authService.isAuthenticated();

      if (isAuth) {
        const response = await authService.getCurrentUser();
        const currentUser = response.data || response;
        setUser(currentUser);

        if (!currentUser.profileComplete) {
          await loadOnboardingProgress();
        }
      }
    } catch (error: any) {
      console.error('[Anointed Innovations] Error loading user:', error);
      if (
        error.message?.includes('timeout') ||
        error.message?.includes('Network')
      ) {
        console.warn(
          '[Anointed Innovations] Backend unreachable - user will need to login',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

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
    try {
      const response = await authService.login({ email, password });

      const syncedUser = await authService.syncUserFromBackend();

      if (syncedUser) {
        setUser(syncedUser);
      } else {
        // Fallback to login response if sync fails
        setUser(response.user);
      }

      if (!syncedUser?.profileComplete && !response.user.profileComplete) {
        await loadOnboardingProgress();
      }
    } catch (error) {
      console.error('[Anointed Innovations] Login error:', error);
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
    } catch (error) {
      console.error('[Anointed Innovations] Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setOnboardingProgress(null);
      router.replace('/auth/login');
    } catch (error) {
      console.error('[Anointed Innovations] Logout error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.data || response);
    } catch (error) {
      console.error('[Anointed Innovations] Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        onboardingProgress,
        loadOnboardingProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
