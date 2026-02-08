import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Check,
  X,
  Sparkles,
  Heart,
  MessageCircle,
  Flame,
  CreditCard,
} from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import {
  subscriptionService,
  type SubscriptionPlan,
} from '@/lib/services/subscription.service';
import { useSquarePayments } from '@/hooks/use-square-payments';

interface SubscriptionPaywallProps {
  onClose: () => void;
  onSubscribe: (planId: string) => void;
  hasUsedTrial: boolean;
}

export function SubscriptionPaywall({
  onClose,
  onSubscribe,
  hasUsedTrial,
}: SubscriptionPaywallProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { isInitialized, initializePayments, startCardEntry } =
    useSquarePayments();

  useEffect(() => {
    initializeSquarePayments();
    loadPlans();
  }, []);

  const initializeSquarePayments = async () => {
    try {
      await initializePayments();
    } catch (error) {
      console.error(
        '[Anointed Innovations] Square initialization error:',
        error,
      );
    }
  };

  const loadPlans = async () => {
    try {
      const allPlans = await subscriptionService.getPlans();
      const availablePlans = hasUsedTrial
        ? allPlans.filter((p) => p.id !== 'trial')
        : allPlans;
      setPlans(availablePlans);
      setLoading(false);
    } catch (error) {
      console.error('[Anointed Innovations] Error loading plans:', error);
      setLoading(false);
    }
  };

  // In subscription-paywall.tsx, update the handleSubscribe function:
  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setProcessing(true);

    try {
      if (selectedPlan === 'trial') {
        const result = await subscriptionService.activateTrial();
        Alert.alert('Success', result.message);
        onSubscribe(selectedPlan);
      } else {
        const planData = plans.find((p) => p.id === selectedPlan);
        if (!planData) {
          throw new Error('Plan not found');
        }

        // Start Square card entry flow with plan data
        startCardEntry(
          planData,
          async (cardDetails: any) => {
            console.log(
              '[Anointed Innovations] Card nonce received (modal should be closed):',
              cardDetails.nonce,
            );

            try {
              // Process payment through backend
              const result = await subscriptionService.processPayment(
                selectedPlan,
                cardDetails.nonce,
              );

              if (result.success) {
                Alert.alert(
                  'Success',
                  'Payment processed successfully! Enjoy your subscription.',
                );
                onSubscribe(selectedPlan);
                onClose();
              } else {
                Alert.alert(
                  'Error',
                  result.message || 'Payment processing failed',
                );
              }
            } catch (error: any) {
              console.error(
                '[Anointed Innovations] Payment processing error:',
                error,
              );
              Alert.alert(
                'Error',
                error.message || 'Failed to process payment',
              );
            } finally {
              setProcessing(false);
            }
          },
          () => {
            console.log('[Anointed Innovations] Card entry cancelled');
            setProcessing(false);
          },
        );
      }
    } catch (error: any) {
      console.error('[Anointed Innovations] Subscribe error:', error);
      Alert.alert(
        'Error',
        error.message || 'Something went wrong. Please try again.',
      );
      setProcessing(false);
    }
  };

  const features = [
    { icon: Flame, text: 'AI-Powered Soul Matches', premium: true },
    { icon: Heart, text: 'Unlimited Likes', premium: true },
    { icon: MessageCircle, text: 'Chat with All Matches', premium: true },
    { icon: Sparkles, text: 'Advanced Compatibility Insights', premium: true },
  ];

  const getPlanBadge = (plan: SubscriptionPlan) => {
    if (plan.id === 'trial') return 'Try Free!';
    if (plan.id === 'semi_annual') return 'Best Value';
    if (plan.id === 'quarterly') return 'Save 17%';
    return null;
  };

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={['#0891B2', '#0284C7', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-12 pb-8"
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-white mb-2">
              Unlock Premium
            </Text>
            <Text className="text-white/90 text-base">
              Find your God-ordained match
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 -mt-4">
        <View className="px-6 py-4">
          <Card className="mb-6 bg-linear-to-br from-ocean-50 to-purple-50 border-purple-200">
            <CardContent className="p-4">
              <Text className="font-semibold text-slate-800 mb-3">
                Premium Features:
              </Text>
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <View
                    key={index}
                    className="flex-row items-center gap-3 mb-2"
                  >
                    <View className="bg-primary/10 p-2 rounded-full">
                      <Icon size={16} color="#0891B2" />
                    </View>
                    <Text className="text-slate-700 flex-1">
                      {feature.text}
                    </Text>
                    <Check size={18} color="#10b981" />
                  </View>
                );
              })}
            </CardContent>
          </Card>

          <View className="gap-3 mb-6">
            {plans.map((plan) => {
              const badge = getPlanBadge(plan);
              const isSelected = selectedPlan === plan.id;
              const isTrial = plan.id === 'trial';

              return (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan.id)}
                >
                  <Card
                    className={`${isSelected ? 'border-2 border-primary shadow-lg' : 'border border-slate-200'} ${isTrial ? 'bg-linear-to-br from-purple-50 to-ocean-50' : 'bg-white'}`}
                  >
                    <CardContent className="p-4">
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-1">
                          <Text className="text-lg font-bold text-slate-800">
                            {plan.name}
                          </Text>
                          {plan.duration_months > 0 && (
                            <Text className="text-xs text-slate-600">
                              {plan.duration_months} months
                            </Text>
                          )}
                        </View>
                        {badge && (
                          <Badge className="bg-primary">
                            <Text className="text-white text-xs">{badge}</Text>
                          </Badge>
                        )}
                      </View>

                      <View className="flex-row items-end gap-2 mb-2">
                        <Text className="text-3xl font-bold text-primary">
                          ${isTrial ? '0' : plan.price_monthly.toFixed(2)}
                        </Text>
                        {!isTrial && (
                          <Text className="text-slate-600 mb-1">/month</Text>
                        )}
                      </View>

                      {!isTrial && plan.price_total !== plan.price_monthly && (
                        <Text className="text-sm text-slate-600">
                          ${plan.price_total.toFixed(2)} billed every{' '}
                          {plan.duration_months} months
                        </Text>
                      )}

                      {isTrial && (
                        <Text className="text-sm text-purple-600 font-medium">
                          7 days free, then cancel anytime
                        </Text>
                      )}
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            disabled={!selectedPlan || loading || processing || !isInitialized}
            onPress={handleSubscribe}
            className="h-12 mb-4"
          >
            {processing ? (
              <Text className="text-white font-semibold text-base">
                Processing...
              </Text>
            ) : (
              <View className="flex-row items-center gap-2">
                {selectedPlan !== 'trial' && (
                  <CreditCard size={20} color="white" />
                )}
                <Text className="text-white font-semibold text-base">
                  {selectedPlan === 'trial'
                    ? 'Start Free Trial'
                    : 'Subscribe Now'}
                </Text>
              </View>
            )}
          </Button>

          <Text className="text-xs text-slate-500 text-center px-4">
            By subscribing, you agree to our Terms of Service and Privacy
            Policy. Subscriptions auto-renew unless cancelled.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
