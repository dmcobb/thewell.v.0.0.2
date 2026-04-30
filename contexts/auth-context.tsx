import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../lib/services/auth.service';
import { useRouter, useSegments, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const pathname = usePathname();

  useEffect(() => {
    loadUser();
  }, []);

  // Navigation guard effect - handles routing based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    const inStartJourney = segments[0] === 'start-journey';
    const inTabs = segments[0] === '(tabs)';
    const isSplashScreen = pathname === '/' || pathname === '';

    // Define allowed screens for authenticated users
    const allowedScreens = [
      '(tabs)',
      'profile',
      'browse',
      'settings',
      'chat',
      'payment',
    ];

    const isInAllowedScreen = allowedScreens.some((screen) =>
      pathname.includes(screen),
    );

    console.log('[AuthContext] Navigation check:', {
      pathname,
      segments: segments[0],
      hasUser: !!user,
      profileComplete: user?.profileComplete,
      inAuthGroup,
      inOnboarding,
      inStartJourney,
      inTabs,
      isSplashScreen,
    });

    // NOT AUTHENTICATED: Redirect to splash screen
    if (!user) {
      if (!inAuthGroup && !isSplashScreen) {
        console.log('[AuthContext] Not authenticated, redirecting to splash');
        router.replace('/');
      }
      return;
    }

    // AUTHENTICATED: Check profile completion and route accordingly
    const isProfileComplete = user.profileComplete === true;

    if (!isProfileComplete) {
      // Profile incomplete - must complete onboarding
      if (!inOnboarding && !inStartJourney) {
        console.log(
          '[AuthContext] Profile incomplete, redirecting to onboarding',
        );
        router.replace('/onboarding');
      }
    } else {
      // Profile complete - ensure we're in allowed screens
      if (!isInAllowedScreen && !inAuthGroup) {
        console.log('[AuthContext] Profile complete, redirecting to main tabs');
        router.replace('/(tabs)');
      }
    }
  }, [user, segments, isLoading, pathname]);

  const loadUser = async () => {
    try {
      setIsLoading(true);

      // Check for token immediately; only proceed if it exists
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('[AuthContext] No auth token found');
        setIsLoading(false);
        return;
      }

      const isAuth = await authService.isAuthenticated();

      if (isAuth) {
        const response = await authService.getCurrentUser();
        if (response) {
          const currentUser = response.data || response;
          console.log('[AuthContext] User loaded:', {
            id: currentUser.id,
            profileComplete: currentUser.profileComplete,
            email: currentUser.email,
          });
          setUser(currentUser);

          if (!currentUser.profileComplete) {
            await loadOnboardingProgress();
          }
        }
      } else {
        // Token exists but is invalid - clear it
        await AsyncStorage.removeItem('authToken');
      }
    } catch (error: any) {
      console.error('[AuthContext] Error loading user:', error);
      if (
        error.message?.includes('timeout') ||
        error.message?.includes('Network')
      ) {
        console.warn(
          '[AuthContext] Backend unreachable - user will need to login',
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
      console.log('[AuthContext] No onboarding progress found');
      setOnboardingProgress(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Login attempt for:', email);
      const response = await authService.login({ email, password });

      const syncedUser = await authService.syncUserFromBackend();

      if (syncedUser) {
        setUser(syncedUser);
        console.log('[AuthContext] User synced:', {
          profileComplete: syncedUser.profileComplete,
        });
      } else if (response.user) {
        // Fallback to login response if sync fails
        setUser(response.user);
        console.log('[AuthContext] Using login response user');
      }

      if (!syncedUser?.profileComplete && !response.user?.profileComplete) {
        await loadOnboardingProgress();
      }
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      console.log('[AuthContext] Register attempt for:', data.email);
      const response = await authService.register(data);
      setUser(response.user);
    } catch (error) {
      console.error('[AuthContext] Register error:', error);
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
      console.error('[AuthContext] Logout error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      console.log('[AuthContext] Refreshing user data');
      const response = await authService.getCurrentUser();
      const refreshedUser = response.data || response;
      setUser(refreshedUser);
      console.log('[AuthContext] User refreshed:', {
        profileComplete: refreshedUser?.profileComplete,
      });
    } catch (error) {
      console.error('[AuthContext] Error refreshing user:', error);
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
