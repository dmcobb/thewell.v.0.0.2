import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  User,
  Sliders,
  Trash2,
  LogOut,
  Save,
  CreditCard,
} from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { userService, type UserPreferences } from '@/lib/services/user.service';
import { subscriptionService } from '@/lib/services/subscription.service';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    lookingFor: '',
    denomination: '',
    churchAttendance: '',
    location: '',
    ageRange: { min: 25, max: 35 },
    maxDistance: 50,
  });

  useEffect(() => {
    loadPreferences();
    loadSubscription();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await userService.getPreferences();
      if (prefs) {
        setPreferences(prefs);
      }
    } catch (err) {
      console.error('[Anointed Innovations] Error loading preferences:', err);
    }
  };

  const loadSubscription = async () => {
    try {
      const subStatus = await subscriptionService.getUserSubscription();
      setSubscription(subStatus);
    } catch (err) {
      console.error('[Anointed Innovations] Error loading subscription:', err);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setLoading(true);
      await userService.updatePreferences(preferences);
      Alert.alert('Success', 'Your preferences have been updated');
    } catch (err) {
      console.error('[Anointed Innovations] Error saving preferences:', err);
      Alert.alert('Error', 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubscriptionLoading(true);
              await subscriptionService.cancelSubscription();
              Alert.alert(
                'Subscription Canceled',
                'Your subscription has been canceled',
              );
              await loadSubscription();
            } catch (err) {
              console.error(
                '[Anointed Innovations] Error canceling subscription:',
                err,
              );
              Alert.alert('Error', 'Failed to cancel subscription');
            } finally {
              setSubscriptionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleCloseAccount = () => {
    Alert.alert(
      'Close Account',
      'Are you sure you want to close your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Account',
          style: 'destructive',
          onPress: async () => {
            // TODO: Add close account API call
            Alert.alert('Account Closed', 'Your account has been closed');
            await logout();
            router.replace('/auth/login');
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      <LinearGradient
        colors={['#0891B2', '#0284C7', '#8B5CF6', '#0369A1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <View className="px-4 pt-12 pb-4">
          <View className="flex-row items-center gap-3">
            <Button variant="ghost" size="sm" onPress={() => router.back()}>
              <ArrowLeft size={24} color="white" />
            </Button>
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">Settings</Text>
              <Text className="text-purple-100 text-xs">
                Manage your account and preferences
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-6">
        <View className="gap-4">
          {/* Profile Settings */}
          <Card className="shadow-lg bg-white/95">
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <User size={20} color="#8B5CF6" />
                <CardTitle>Profile Settings</CardTitle>
              </View>
            </CardHeader>
            <CardContent className="gap-3">
              <Button
                variant="outline"
                className="w-full h-12 bg-transparent"
                onPress={() => router.push('/start-journey')}
              >
                <Text className="text-purple-500 font-medium">
                  Edit Profile
                </Text>
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 bg-transparent"
                onPress={() => router.push('/profile/video')}
              >
                <Text className="text-purple-500 font-medium">
                  Update Video
                </Text>
              </Button>
            </CardContent>
          </Card>

          {/* Match Preferences */}
          <Card className="shadow-lg bg-white/95">
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <Sliders size={20} color="#8B5CF6" />
                <CardTitle>Match Preferences</CardTitle>
              </View>
              <Text className="text-sm text-slate-600">
                Adjust who you want to see
              </Text>
            </CardHeader>
            <CardContent className="gap-4">
              <View>
                <Text className="text-sm font-medium text-slate-700 mb-2">
                  Looking For
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {[
                    'Serious Relationship',
                    'Friendship',
                    'Dating',
                    'Marriage',
                  ].map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() =>
                        setPreferences({ ...preferences, lookingFor: option })
                      }
                      className={`px-4 py-2 rounded-lg border ${
                        preferences.lookingFor === option
                          ? 'border-primary bg-primary/10'
                          : 'border-slate-300'
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          preferences.lookingFor === option
                            ? 'text-primary font-medium'
                            : 'text-slate-600'
                        }`}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-slate-700 mb-2">
                  Age Range
                </Text>
                <View className="flex-row items-center gap-3">
                  <View className="flex-1">
                    <TextInput
                      value={preferences.ageRange?.min?.toString()}
                      onChangeText={(text) =>
                        setPreferences({
                          ...preferences,
                          ageRange: {
                            ...preferences.ageRange!,
                            min: Number.parseInt(text) || 18,
                          },
                        })
                      }
                      keyboardType="number-pad"
                      placeholder="Min"
                      className="bg-slate-100 rounded-lg p-3 text-slate-800"
                    />
                  </View>
                  <Text className="text-slate-600">to</Text>
                  <View className="flex-1">
                    <TextInput
                      value={preferences.ageRange?.max?.toString()}
                      onChangeText={(text) =>
                        setPreferences({
                          ...preferences,
                          ageRange: {
                            ...preferences.ageRange!,
                            max: Number.parseInt(text) || 99,
                          },
                        })
                      }
                      keyboardType="number-pad"
                      placeholder="Max"
                      className="bg-slate-100 rounded-lg p-3 text-slate-800"
                    />
                  </View>
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-slate-700 mb-2">
                  Maximum Distance (miles)
                </Text>
                <TextInput
                  value={preferences.maxDistance?.toString()}
                  onChangeText={(text) =>
                    setPreferences({
                      ...preferences,
                      maxDistance: Number.parseInt(text) || 50,
                    })
                  }
                  keyboardType="number-pad"
                  placeholder="50"
                  className="bg-slate-100 rounded-lg p-3 text-slate-800"
                />
              </View>

              <Button
                className="w-full h-12 mt-2"
                onPress={handleSavePreferences}
                disabled={loading}
              >
                <View className="flex-row items-center gap-2">
                  <Save size={16} color="white" />
                  <Text className="text-white font-medium">
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </Text>
                </View>
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          {subscription?.is_premium && (
            <Card className="shadow-lg bg-white/95">
              <CardHeader>
                <View className="flex-row items-center gap-2">
                  <CreditCard size={20} color="#8B5CF6" />
                  <CardTitle>Subscription</CardTitle>
                </View>
                <Text className="text-sm text-slate-600">
                  Active: {subscription?.subscription?.plan_name}
                </Text>
              </CardHeader>
              <CardContent className="gap-3">
                <View className="bg-slate-50 rounded-lg p-3 mb-2">
                  <Text className="text-xs text-slate-500 mb-1">
                    Expires:{' '}
                    {subscription?.subscription?.expires_at
                      ? new Date(
                          subscription.subscription.expires_at,
                        ).toLocaleDateString()
                      : 'N/A'}
                  </Text>
                </View>
                <Button
                  variant="outline"
                  className="w-full h-12 border-orange-200 bg-orange-50"
                  onPress={handleCancelSubscription}
                  disabled={subscriptionLoading}
                >
                  <View className="flex-row items-center gap-2">
                    <CreditCard size={18} color="#EA580C" />
                    <Text className="text-orange-600 font-medium">
                      {subscriptionLoading
                        ? 'Canceling...'
                        : 'Cancel Subscription'}
                    </Text>
                  </View>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Account Actions */}
          <Card className="shadow-lg bg-white/95">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <Button
                variant="outline"
                className="w-full h-12 border-red-200 bg-red-50"
                onPress={handleCloseAccount}
              >
                <View className="flex-row items-center gap-2">
                  <Trash2 size={18} color="#DC2626" />
                  <Text className="text-red-600 font-medium">
                    Close Account
                  </Text>
                </View>
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 border-slate-200 bg-transparent"
                onPress={handleLogout}
              >
                <View className="flex-row items-center gap-2">
                  <LogOut size={18} color="#64748B" />
                  <Text className="text-slate-600 font-medium">Logout</Text>
                </View>
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
