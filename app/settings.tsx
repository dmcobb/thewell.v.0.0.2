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
  ChevronRight,
} from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditProfileModal } from '@/components/edit-profile-modal';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { userService, type UserPreferences } from '@/lib/services/user.service';
import {
  subscriptionService,
  type SubscriptionStatus,
} from '@/lib/services/subscription.service';

interface Transaction {
  id: number;
  amount: number;
  plan_type: string;
  card_brand: string;
  card_last_4: string;
  created_at: string;
  status: string;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null,
  );
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(
    null,
  );
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
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
    loadLastTransaction();
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

  const loadLastTransaction = async () => {
    try {
      const transaction = await subscriptionService.getLatestTransaction();
      if (transaction) {
        setLastTransaction(transaction);
      }
    } catch (err) {
      console.error(
        '[Anointed Innovations] Error loading last transaction:',
        err,
      );
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
              const response = await subscriptionService.cancelSubscription();
              if (response.success === false) {
                Alert.alert(
                  'Cancellation Failed',
                  response.message ||
                    'Failed to cancel subscription with Square. Please try again or contact support.',
                );
                return;
              }
              Alert.alert(
                'Subscription Canceled',
                'Your subscription has been canceled successfully',
              );
              await loadSubscription();
            } catch (err: any) {
              console.error(
                '[Anointed Innovations] Error canceling subscription:',
                err,
              );
              const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to cancel subscription. Please try again or contact support.';
              Alert.alert('Error', errorMessage);
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
    <View className="flex-1 bg-slate-50">
      <LinearGradient
        colors={['#9B7EDE', '#8B5CF6', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <View className="px-5 pt-14 pb-6">
          <View className="flex-row items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onPress={() => router.back()} 
              className="p-0 h-10 w-10 bg-white/20 rounded-full"
            >
              <ArrowLeft size={24} color="white" />
            </Button>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white">Settings</Text>
              <Text className="text-purple-100 text-xs font-medium uppercase tracking-widest">
                Account & Preferences
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-5 pb-10">
        <View className="gap-6">
          {/* Profile Settings */}
          <Card className="shadow-xl bg-white border-0 rounded-[24px]">
            <CardHeader className="pb-2">
              <View className="flex-row items-center gap-3">
                <User size={20} color="#9B7EDE" />
                <CardTitle className="text-slate-800">Profile Settings</CardTitle>
              </View>
            </CardHeader>
            <CardContent className="gap-3">
              <Button
                variant="outline"
                className="w-full h-14 bg-purple-50 border-purple-100 rounded-xl"
                onPress={() => setEditProfileModalVisible(true)}
              >
                <Text className="text-primary font-bold">Edit Profile</Text>
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 bg-slate-50 border-slate-100 rounded-xl"
                onPress={() => router.push('/profile/video')}
              >
                <Text className="text-slate-600 font-bold">Update Video</Text>
              </Button>
            </CardContent>
          </Card>

          {/* Match Preferences */}
          <Card className="shadow-xl bg-white border-0 rounded-[24px]">
            <CardHeader className="pb-4">
              <View className="flex-row items-center gap-3">
                <Sliders size={20} color="#9B7EDE" />
                <CardTitle className="text-slate-800">Match Preferences</CardTitle>
              </View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Refine your discovery
              </Text>
            </CardHeader>
            <CardContent className="gap-6">
              <View>
                <Text className="text-sm font-bold text-slate-700 mb-3">Looking For</Text>
                <View className="flex-row flex-wrap gap-2">
                  {['Serious Relationship', 'Friendship', 'Dating', 'Marriage'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => setPreferences({ ...preferences, lookingFor: option })}
                      className={`px-4 py-2 rounded-full border ${
                        preferences.lookingFor === option
                          ? 'border-primary bg-purple-50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          preferences.lookingFor === option ? 'text-primary' : 'text-slate-500'
                        }`}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-sm font-bold text-slate-700 mb-3">Age Range</Text>
                <View className="flex-row items-center gap-3">
                  <View className="flex-1">
                    <TextInput
                      value={preferences.ageRange?.min?.toString()}
                      onChangeText={(text) =>
                        setPreferences({
                          ...preferences,
                          ageRange: { ...preferences.ageRange!, min: Number.parseInt(text) || 18 },
                        })
                      }
                      keyboardType="number-pad"
                      placeholder="Min"
                      className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-800 font-bold"
                    />
                  </View>
                  <Text className="text-slate-400 font-bold">to</Text>
                  <View className="flex-1">
                    <TextInput
                      value={preferences.ageRange?.max?.toString()}
                      onChangeText={(text) =>
                        setPreferences({
                          ...preferences,
                          ageRange: { ...preferences.ageRange!, max: Number.parseInt(text) || 99 },
                        })
                      }
                      keyboardType="number-pad"
                      placeholder="Max"
                      className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-800 font-bold"
                    />
                  </View>
                </View>
              </View>

              <View>
                <Text className="text-sm font-bold text-slate-700 mb-3">Max Distance (miles)</Text>
                <TextInput
                  value={preferences.maxDistance?.toString()}
                  onChangeText={(text) =>
                    setPreferences({ ...preferences, maxDistance: Number.parseInt(text) || 50 })
                  }
                  keyboardType="number-pad"
                  placeholder="50"
                  className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-800 font-bold"
                />
              </View>

              <Button
                className="w-full h-14 rounded-2xl bg-primary shadow-md"
                onPress={handleSavePreferences}
                disabled={loading}
              >
                <View className="flex-row items-center gap-2">
                  <Save size={18} color="white" />
                  <Text className="text-white font-bold text-lg">
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </Text>
                </View>
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          {subscription?.is_premium && (
            <Card className="shadow-xl bg-white border-0 rounded-[24px]">
              <CardHeader className="pb-2">
                <View className="flex-row items-center gap-3">
                  <CreditCard size={20} color="#9B7EDE" />
                  <CardTitle className="text-slate-800">Subscription</CardTitle>
                </View>
              </CardHeader>
              <CardContent className="gap-3">
                <View className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-2">
                  <Text className="text-sm text-primary font-bold mb-1">
                    {`Active: ${subscription?.subscription?.plan_name || 'Premium'}`}
                  </Text>
                  <Text className="text-xs text-slate-500 font-medium">
                    {`Expires: ${subscription?.subscription?.expires_at ? new Date(subscription.subscription.expires_at).toLocaleDateString() : 'N/A'}`}
                  </Text>
                </View>
                <Button
                  variant="outline"
                  className="w-full h-12 border-orange-200 bg-orange-50 rounded-xl"
                  onPress={handleCancelSubscription}
                  disabled={subscriptionLoading}
                >
                  <View className="flex-row items-center gap-2">
                    <CreditCard size={18} color="#EA580C" />
                    <Text className="text-orange-600 font-bold">
                      {subscriptionLoading ? 'Canceling...' : 'Cancel Subscription'}
                    </Text>
                  </View>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Transactions */}
          {lastTransaction && (
            <Card className="shadow-xl bg-white border-0 rounded-[24px]">
              <CardHeader className="pb-2">
                <View className="flex-row items-center gap-3">
                  <CreditCard size={20} color="#9B7EDE" />
                  <CardTitle className="text-slate-800">Latest Transaction</CardTitle>
                </View>
              </CardHeader>
              <CardContent className="gap-3">
                <View className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-slate-800 mb-1">
                        {lastTransaction.plan_type || 'Transaction'}
                      </Text>
                      <Text className="text-xs text-slate-500 font-medium">
                        {lastTransaction.created_at
                          ? new Date(lastTransaction.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Date unavailable'}
                      </Text>
                    </View>
                    <Text className="text-lg font-black text-primary">
                      ${lastTransaction.amount ? Number(lastTransaction.amount).toFixed(2) : '0.00'}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2 bg-white self-start px-3 py-1 rounded-full border border-slate-100">
                    <View className="w-2 h-2 rounded-full bg-green-500" />
                    <Text className="text-xs text-slate-600 font-bold">
                      {lastTransaction.card_brand || 'Card'} •••• {lastTransaction.card_last_4 || '••••'}
                    </Text>
                  </View>
                </View>
                <Button
                  variant="outline"
                  className="w-full h-14 bg-transparent border-purple-100 rounded-xl"
                  onPress={() => router.push('/settings/transactions')}
                >
                  <View className="flex-row items-center justify-between w-full px-2">
                    <Text className="text-primary font-bold">View All Transactions</Text>
                    <ChevronRight size={18} color="#9B7EDE" />
                  </View>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Account Actions */}
          <Card className="shadow-xl bg-white border-0 rounded-[24px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800">Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <Button
                variant="outline"
                className="w-full h-14 border-red-100 bg-red-50 rounded-xl"
                onPress={handleCloseAccount}
              >
                <View className="flex-row items-center gap-2">
                  <Trash2 size={18} color="#DC2626" />
                  <Text className="text-red-600 font-bold">Close Account</Text>
                </View>
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 border-slate-100 bg-transparent rounded-xl"
                onPress={handleLogout}
              >
                <View className="flex-row items-center gap-2">
                  <LogOut size={18} color="#64748B" />
                  <Text className="text-slate-600 font-bold">Logout</Text>
                </View>
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>

      <EditProfileModal
        visible={editProfileModalVisible}
        onClose={() => setEditProfileModalVisible(false)}
        onSave={() => loadPreferences()}
      />
    </View>
  );
}