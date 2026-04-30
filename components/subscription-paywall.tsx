// components/subscription-paywall.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Check,
  X,
  Sparkles,
  Heart,
  MessageCircle,
  Flame,
  ExternalLink,
  RefreshCw,
} from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import {
  subscriptionService,
  type SubscriptionPlan,
} from '@/lib/services/subscription.service';
import { iapService, type IAPProduct } from '@/lib/services/iap.service';
import { useAuth } from '@/contexts/auth-context';

interface SubscriptionPaywallProps {
  onClose: () => void;
  onSubscribe: (planId: string) => void;
  hasUsedTrial: boolean;
}

// External checkout session token storage
let pendingCheckoutToken: string | null = null;

export function getPendingCheckoutToken() {
  return pendingCheckoutToken;
}

export function clearPendingCheckoutToken() {
  pendingCheckoutToken = null;
}

export function SubscriptionPaywall({
  onClose,
  onSubscribe,
  hasUsedTrial,
}: SubscriptionPaywallProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [iapProducts, setIapProducts] = useState<IAPProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useIAP, setUseIAP] = useState(false);
  const { refreshUser } = useAuth();

  useEffect(() => {
    initializePaymentMethod();
  }, []);

  const initializePaymentMethod = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we should use IAP (iOS)
      const shouldUseIAP = iapService.shouldUseIAP();
      setUseIAP(shouldUseIAP);

      if (shouldUseIAP) {
        // Initialize IAP and load products
        const available = await iapService.initialize();
        if (available) {
          const products = await iapService.getProducts();
          setIapProducts(products);
        }
      }

      // Load subscription plans from backend
      await loadPlans();
    } catch (err: any) {
      console.error('[SubscriptionPaywall] Initialization error:', err);
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const allPlans = await subscriptionService.getPlans();
      // Filter: exclude trial if used, and exclude ad-only plans
      const availablePlans = allPlans.filter((p) => {
        if (hasUsedTrial && p.id === 'trial') return false;
        const isAdOnlyPlan =
          p.features?.ad_free &&
          !p.features?.ai_matches &&
          !p.features?.unlimited_likes &&
          !p.features?.chat;
        if (isAdOnlyPlan) return false;
        return true;
      });
      setPlans(availablePlans);

      // Auto-select first plan if none selected
      if (availablePlans.length > 0 && !selectedPlan) {
        setSelectedPlan(availablePlans[0].id);
      }
    } catch (error) {
      console.error('[SubscriptionPaywall] Error loading plans:', error);
      setError('Failed to load subscription plans.');
    }
  };

  // Handle subscription
  const handleSubscribe = async () => {
    if (!selectedPlan) {
      Alert.alert(
        'Select a Plan',
        'Please select a subscription plan to continue.',
      );
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      if (selectedPlan === 'trial') {
        // Trial activation
        const result = await subscriptionService.activateTrial();
        if (result.success) {
          Alert.alert('Success', result.message);
          await refreshUser();
          onSubscribe(selectedPlan);
          onClose();
        } else {
          throw new Error(result.message || 'Trial activation failed');
        }
      } else if (useIAP) {
        // Use StoreKit IAP for iOS
        await handleIAPPurchase(selectedPlan);
      } else {
        // Use external checkout for web/Android
        await handleExternalCheckout(selectedPlan);
      }
    } catch (error: any) {
      console.error('[SubscriptionPaywall] Subscribe error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
      Alert.alert(
        'Error',
        error.message || 'Something went wrong. Please try again.',
      );
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Handle StoreKit In-App Purchase
   */
  const handleIAPPurchase = async (planId: string) => {
    const productId = iapService.getProductIdForPlan(planId);

    if (!productId) {
      throw new Error('This plan is not available for in-app purchase');
    }

    // Show loading state
    setProcessing(true);

    // Initiate IAP
    const result = await iapService.purchaseAsync(productId);

    if (result.success) {
      Alert.alert(
        'Success!',
        'Your subscription has been activated successfully.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await refreshUser();
              onSubscribe(planId);
              onClose();
            },
          },
        ],
      );
    } else {
      throw new Error(result.message);
    }
  };

  /**
   * Handle external checkout for non-iOS platforms
   */
  const handleExternalCheckout = async (planId: string) => {
    try {
      const sessionResult =
        await subscriptionService.createCheckoutSession(planId);

      if (!sessionResult.success || !sessionResult.data) {
        throw new Error('Failed to create checkout session');
      }

      // Store the token for verification when user returns
      pendingCheckoutToken = sessionResult.data.session_token;

      const checkoutUrl = sessionResult.data.checkout_url;

      Alert.alert(
        'Continue to Secure Checkout',
        `You'll be redirected to our secure checkout page to complete your ${sessionResult.data.plan.name} subscription.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setProcessing(false);
              pendingCheckoutToken = null;
            },
          },
          {
            text: 'Continue',
            onPress: async () => {
              try {
                const supported = await Linking.canOpenURL(checkoutUrl);
                if (supported) {
                  await Linking.openURL(checkoutUrl);
                } else {
                  throw new Error('Cannot open checkout URL');
                }
                setProcessing(false);
              } catch (error) {
                console.error(
                  '[SubscriptionPaywall] Failed to open browser:',
                  error,
                );
                Alert.alert(
                  'Error',
                  'Could not open checkout page. Please try again.',
                );
                setProcessing(false);
              }
            },
          },
        ],
      );
    } catch (error: any) {
      console.error('[SubscriptionPaywall] External checkout error:', error);
      throw new Error('Checkout unavailable. Please try again later.');
    }
  };

  /**
   * Restore previous purchases
   */
  const handleRestorePurchases = async () => {
    try {
      setProcessing(true);
      const results = await iapService.restorePurchases();

      const successful = results.filter((r) => r.success);
      if (successful.length > 0) {
        Alert.alert(
          'Purchases Restored',
          'Your previous subscriptions have been restored.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await refreshUser();
                onSubscribe('restored');
                onClose();
              },
            },
          ],
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'No previous subscriptions were found to restore.',
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to restore purchases');
    } finally {
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

  // Get display price (use IAP price if available)
  const getPlanPrice = (
    plan: SubscriptionPlan,
  ): { price: string; period: string } => {
    if (plan.id === 'trial') {
      return { price: '$0', period: '' };
    }

    // Try to find IAP product for accurate pricing
    const productId = iapService.getProductIdForPlan(plan.id);
    const iapProduct = productId
      ? iapProducts.find((p) => p.productId === productId)
      : null;

    if (iapProduct && useIAP) {
      return { price: iapProduct.price, period: '/month' };
    }

    // Fall back to backend price
    return {
      price: `$${plan.price_monthly.toFixed(2)}`,
      period: '/month',
    };
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0891B2" />
        <Text className="mt-4 text-slate-600">
          Loading subscription options...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={['#0891C2', '#0284C7', '#8B5CF6']}
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
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <Text className="text-red-600 text-sm">{error}</Text>
              <TouchableOpacity
                onPress={initializePaymentMethod}
                className="mt-2 flex-row items-center"
              >
                <RefreshCw size={14} color="#DC2626" />
                <Text className="text-red-600 text-sm ml-1 font-medium">
                  Tap to retry
                </Text>
              </TouchableOpacity>
            </View>
          )}

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
                      <Icon size={16} color="#0891C2" />
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
              const { price, period } = getPlanPrice(plan);

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
                          {price}
                        </Text>
                        {!isTrial && (
                          <Text className="text-slate-600 mb-1">{period}</Text>
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

                      {useIAP && plan.id !== 'trial' && (
                        <Text className="text-xs text-slate-500 mt-2">
                          Billed via App Store
                        </Text>
                      )}
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            disabled={!selectedPlan || processing}
            onPress={handleSubscribe}
            className="h-12 mb-4"
          >
            {processing ? (
              <Text className="text-white font-semibold text-base">
                Processing...
              </Text>
            ) : (
              <View className="flex-row items-center gap-2">
                {selectedPlan !== 'trial' && !useIAP && (
                  <ExternalLink size={20} color="white" />
                )}
                <Text className="text-white font-semibold text-base">
                  {selectedPlan === 'trial'
                    ? 'Start Free Trial'
                    : useIAP
                      ? 'Subscribe via App Store'
                      : 'Subscribe Now'}
                </Text>
              </View>
            )}
          </Button>

          {useIAP && (
            <TouchableOpacity
              onPress={handleRestorePurchases}
              disabled={processing}
              className="mb-4"
            >
              <Text className="text-primary text-center text-sm font-medium">
                Restore Previous Purchases
              </Text>
            </TouchableOpacity>
          )}

          <Text className="text-xs text-slate-500 text-center px-4">
            By subscribing, you agree to our Terms of Service and Privacy
            Policy.{' '}
            {useIAP
              ? 'Subscriptions auto-renew unless cancelled in App Store settings. '
              : 'Subscriptions auto-renew unless cancelled. '}
            {useIAP &&
              'Payment will be charged to your Apple ID account at confirmation of purchase.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
