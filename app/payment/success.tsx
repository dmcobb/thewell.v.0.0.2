import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2 } from 'lucide-react-native';
import { subscriptionService } from '@/lib/services/subscription.service';
import { useAuth } from '@/contexts/auth-context';
import { clearPendingCheckoutToken } from '@/components/subscription-paywall';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { refreshUser } = useAuth();

  useEffect(() => {
    verifyPayment();
  }, [token]);

  const verifyPayment = async () => {
    if (!token) {
      Alert.alert(
        'Error',
        'Invalid payment session. Please contact support.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
      return;
    }

    try {
      // Verify the external payment and activate subscription
      const result = await subscriptionService.verifyExternalPayment(token);

      if (result.success) {
        // Refresh user data to get updated subscription
        await refreshUser();
        
        // Clear the pending checkout token
        clearPendingCheckoutToken();

        Alert.alert(
          'Payment Successful!',
          'Your subscription has been activated. Enjoy The Well!',
          [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        Alert.alert(
          'Processing Payment',
          'We\'re still processing your payment. Please check back in a few minutes.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      }
    } catch (error) {
      console.error('[PaymentSuccess] Error verifying payment:', error);
      Alert.alert(
        'Almost There',
        'Your payment was received! We\'re activating your subscription now. Please restart the app if you don\'t see your subscription within a few minutes.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#0891B2', '#0284C7', '#8B5CF6']}
        className="flex-1 justify-center items-center px-6"
      >
        <View className="bg-white rounded-2xl p-8 shadow-2xl items-center max-w-sm w-full">
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
            <CheckCircle2 size={40} color="#10B981" />
          </View>
          
          <Text className="text-2xl font-bold text-slate-800 mb-2 text-center">
            Payment Processing
          </Text>
          
          <Text className="text-slate-600 text-center mb-6">
            We\'re confirming your subscription. This may take a moment...
          </Text>

          <ActivityIndicator size="large" color="#0891B2" />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
