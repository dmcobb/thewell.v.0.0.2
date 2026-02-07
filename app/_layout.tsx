import { Stack, usePathname, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';
import { AuthProvider } from '../contexts/auth-context';
import { NotificationProvider } from '../contexts/notification-context';
import { NotificationContainer } from '@/components/notification-container';
import { GlobalHeader } from '@/components/global-header';
import { View } from 'react-native';

export default function RootLayout() {
  const pathname = usePathname();
  const segments = useSegments();

  const isInTabs = segments[0] === '(tabs)';
  const isAuthRoute =
    (pathname === '/' && !isInTabs) ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/start-journey');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <AuthProvider>
          <NotificationProvider>
            <NotificationContainer>
              <View className="flex-1">
                {!isAuthRoute && <GlobalHeader />}
                <StatusBar style="light" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="auth" />
                  <Stack.Screen name="onboarding" />
                  <Stack.Screen name="start-journey" />
                  <Stack.Screen name="profile" />
                  <Stack.Screen name="browse" />
                  <Stack.Screen name="settings" />
                  <Stack.Screen name="(tabs)" />
                </Stack>
              </View>
            </NotificationContainer>
          </NotificationProvider>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
