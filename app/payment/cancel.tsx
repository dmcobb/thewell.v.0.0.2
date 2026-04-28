import { View, Text, Alert } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { XCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { clearPendingCheckoutToken } from '@/components/subscription-paywall';

export default function PaymentCancelScreen() {
  const router = useRouter();

  useEffect(() => {
    // Clear any pending checkout token
    clearPendingCheckoutToken();
  }, []);

  const handleReturn = () => {
    router.replace('/(tabs)');
  };

  const handleTryAgain = () => {
    router.replace('/settings');
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#0891B2', '#0284C7', '#8B5CF6']}
        className="flex-1 justify-center items-center px-6"
      >
        <View className="bg-white rounded-2xl p-8 shadow-2xl items-center max-w-sm w-full">
          <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-6">
            <XCircle size={40} color="#64748B" />
          </View>
          
          <Text className="text-2xl font-bold text-slate-800 mb-2 text-center">
            Payment Cancelled
          </Text>
          
          <Text className="text-slate-600 text-center mb-6">
            Your subscription was not completed. You can try again anytime from the Settings menu.
          </Text>

          <Button
            onPress={handleTryAgain}
            className="w-full h-12 bg-gradient-to-r from-[#0891B2] to-[#8B5CF6] rounded-xl mb-3"
          >
            <Text className="text-white font-semibold text-base">
              Try Again
            </Text>
          </Button>

          <Button
            onPress={handleReturn}
            variant="outline"
            className="w-full h-12 rounded-xl"
          >
            <Text className="text-slate-600 font-medium">
              Return to App
            </Text>
          </Button>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
