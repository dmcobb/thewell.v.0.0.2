import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  Modal, 
  Platform, 
  RefreshControl,
  TouchableOpacity 
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Brain,
  MessageCircle,
  Heart,
  Waves,
  Sparkles,
  Crown,
} from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { VideoPlayer } from '@/components/video-player';
import { useState, useEffect, useCallback } from 'react';
import { matchService, type AIMatchResult } from '@/lib/services/match.service';
import {
  subscriptionService,
  type SubscriptionStatus,
} from '@/lib/services/subscription.service';
import { SubscriptionPaywall } from '@/components/subscription-paywall';
import { useRouter } from 'expo-router';

export default function AIMatchTab() {
  const router = useRouter();
  const [match, setMatch] = useState<AIMatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Added for iOS pull-to-refresh
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    checkSubscriptionAndLoadMatch();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Refresh subscription status whenever tab comes into focus
      checkSubscriptionAndLoadMatch();
    }, []),
  );

  const checkSubscriptionAndLoadMatch = async () => {
    try {
      const status = await subscriptionService.getUserSubscription();
      setSubscriptionStatus(status);

      if (status.is_premium) {
        await loadAIMatch();
      } else {
        setLoading(false);
        setShowPaywall(true);
      }
    } catch (error) {
      console.error(
        '[Anointed Innovations] Error checking subscription:',
        error,
      );
      setLoading(false);
      setShowPaywall(true);
    }
  };

  const loadAIMatch = async () => {
    try {
      if (!refreshing) setLoading(true);
      const aiMatch = await matchService.getAIMatch();
      setMatch(aiMatch);
    } catch (error) {
      console.error('[Anointed Innovations] Error loading AI match:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    checkSubscriptionAndLoadMatch();
  };

  const handleLike = async () => {
    if (!match) return;
    try {
      const result = await matchService.likeUser(match.id);
      if (result?.isMatch) {
        // Match created - optional toast/notification
      }
      // Reload to get next match
      await loadAIMatch();
    } catch (error) {
      console.error('[Anointed Innovations] Error liking user:', error);
    }
  };

  const handleMessage = async () => {
    if (!match) return;
    try {
      // Navigate to chat with this match
      router.push(`/chat/${match.id}`);
    } catch (error) {
      console.error('[Anointed Innovations] Error navigating to chat:', error);
    }
  };

  const handlePass = async () => {
    if (!match) return;
    try {
      await matchService.passUser(match.id);
      // Reload to get next match
      await loadAIMatch();
    } catch (error) {
      console.error('[Anointed Innovations] Error passing user:', error);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      if (planId === 'trial') {
        await subscriptionService.activateTrial();
        // Add small delay to ensure backend has processed the trial
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Refresh subscription status after successful trial activation
        const updatedStatus = await subscriptionService.getUserSubscription();
        setSubscriptionStatus(updatedStatus);
        setShowPaywall(false);
        // Load AI match after paywall closes
        await loadAIMatch();
      } else {
        // For paid plans, the payment is already processed by the hook
        // Add delay to ensure backend has processed the payment
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Just refresh subscription status and load matches
        const updatedStatus = await subscriptionService.getUserSubscription();
        setSubscriptionStatus(updatedStatus);
        if (updatedStatus.is_premium) {
          setShowPaywall(false);
          await loadAIMatch();
        }
      }
    } catch (error) {
      console.error('[Anointed Innovations] Error subscribing:', error);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getSectionName = (section: string) => {
    const names: Record<string, string> = {
      part_a: 'Faith Foundation',
      part_b: 'Life Vision',
      part_c: 'Heart Interests',
      part_d: 'Communication',
      part_e: 'Values Alignment',
      part_f: 'Lifestyle Match',
    };
    return names[section] || section;
  };

  if (showPaywall) {
    const handleClosePaywall = () => {
      setShowPaywall(false);
      router.replace('/(tabs)');
    };

    return (
      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClosePaywall}
      >
        <SubscriptionPaywall
          onClose={handleClosePaywall}
          onSubscribe={handleSubscribe}
          hasUsedTrial={subscriptionStatus?.has_used_trial || false}
        />
      </Modal>
    );
  }

  return (
    <View className="flex-1 bg-linear-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ 
          paddingHorizontal: 24, 
          paddingTop: Platform.OS === 'ios' ? 60 : 32, 
          paddingBottom: 40 
        }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#0891B2"
          />
        }
      >
        <View className="gap-6">
          <View className="rounded-[28px] overflow-hidden shadow-lg">
            <LinearGradient
              colors={['#0891B2', '#0284C7', '#0369A1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            >
              <View className="p-6">
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center gap-2">
                  <Brain size={22} color="white" />
                  <Text className="text-xl font-bold text-white tracking-tight">
                    Soul Compass AI
                  </Text>
                </View>
                <Crown size={20} color="#fbbf24" fill="#fbbf24" />
              </View>
              <Text className="text-sm text-cyan-50 font-medium">
                Guided by faith, powered by understanding
              </Text>
            </View>
          </LinearGradient>
        </View>

          {loading && !refreshing ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#0891B2" />
              <Text className="text-slate-500 font-medium mt-4">
                Finding your perfect match...
              </Text>
            </View>
          ) : !match ? (
            <View className="items-center justify-center p-6 py-20">
              <Heart size={64} color="#94a3b8" />
              <Text className="text-slate-800 font-semibold text-xl mt-4 text-center">
                No Matches Available
              </Text>
              <Text className="text-slate-600 text-center mt-2">
                Check back soon for new AI-powered matches
              </Text>
              <Button onPress={loadAIMatch} className="mt-6">
                <Text className="text-white font-medium">Refresh</Text>
              </Button>
            </View>
          ) : (
            <>
              <Card className="shadow-md bg-white border-0 rounded-[32px] overflow-hidden">
                <CardHeader className="pb-2">
                  <View className="flex-row items-center gap-2">
                    <Sparkles size={18} color="#8B5CF6" fill="#8B5CF6" />
                    <CardTitle className="text-purple-600 font-bold uppercase text-xs tracking-widest">
                      Divine Match
                    </CardTitle>
                  </View>
                </CardHeader>
                <CardContent className="gap-5">
                  <View className="flex-row items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-purple-100">
                      {match.photos && match.photos.length > 0 ? (
                        <AvatarImage
                          source={{
                            uri:
                              match.photos.find((p) => p.is_primary)?.photo_url ||
                              match.photos[0].photo_url,
                          }}
                        />
                      ) : (
                        <AvatarFallback className="bg-slate-200">
                          <Text className="font-bold">{match.first_name[0]}</Text>
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <View className="flex-1">
                      <Text className="font-bold text-xl text-slate-900">
                        {match.first_name}, {calculateAge(match.date_of_birth)}
                      </Text>
                      <View className="flex-row mt-1">
                        <Badge className="bg-purple-50 border-0 px-2 py-0.5">
                          <Text className="text-[10px] font-bold text-purple-700">
                            {Math.round(match.match_score)}% HARMONY
                          </Text>
                        </Badge>
                      </View>
                    </View>
                  </View>

                  {match.profile_video_url && (
                    <View className="aspect-video rounded-3xl overflow-hidden bg-slate-100 shadow-sm">
                      <VideoPlayer
                        videoUrl={match.profile_video_url}
                        poster={match.profile_video_thumbnail_url || undefined}
                        className="h-full"
                      />
                    </View>
                  )}

                  {match.bio && (
                    <View className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                      <Text className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">
                        Soul Resonance Analysis
                      </Text>
                      <Text className="text-[14px] leading-6 text-slate-700 font-medium italic">
                        "{match.bio}"
                      </Text>
                    </View>
                  )}

                  <View className="flex-row gap-3 pt-2">
                    <TouchableOpacity
                      className="flex-1 h-14 bg-slate-100 rounded-2xl items-center justify-center"
                      onPress={handlePass}
                      activeOpacity={0.7}
                    >
                      <Text className="text-slate-500 font-bold text-base">Pass</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 h-14 bg-cyan-600 rounded-2xl flex-row items-center justify-center shadow-md"
                      onPress={handleMessage}
                      activeOpacity={0.8}
                    >
                      <MessageCircle size={20} color="white" fill="white" className="mr-2" />
                      <Text className="text-white font-bold text-base">Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 h-14 bg-purple-600 rounded-2xl flex-row items-center justify-center shadow-md"
                      onPress={handleLike}
                      activeOpacity={0.8}
                    >
                      <Heart size={20} color="white" fill="white" className="mr-2" />
                      <Text className="text-white font-bold text-base">Like</Text>
                    </TouchableOpacity>
                  </View>

                  {subscriptionStatus && !subscriptionStatus.is_premium && (
                    <View className="bg-orange-50 p-3 rounded-2xl border border-orange-100">
                      <Text className="text-xs text-orange-600 text-center font-medium">
                        5 likes remaining today
                      </Text>
                    </View>
                  )}
                </CardContent>
              </Card>

              {match.compatibility_insights &&
                match.compatibility_insights.strengths.length > 0 && (
                  <Card className="shadow-sm bg-white border-0 rounded-[32px] p-2">
                    <CardHeader>
                      <View className="flex-row items-center gap-2">
                        <Waves size={18} color="#0891B2" />
                        <CardTitle className="text-cyan-700 font-bold">Deep Harmony</CardTitle>
                      </View>
                    </CardHeader>
                    <CardContent className="gap-4 pb-6">
                      <View className="items-center mb-2">
                        <Text className="text-4xl font-bold text-cyan-600">
                          {Math.round(match.match_score)}%
                        </Text>
                        <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Connection Score
                        </Text>
                      </View>

                      {match.compatibility_insights.strengths
                        .slice(0, 3)
                        .map((strength, index) => (
                          <View key={index} className="px-1">
                            <View className="flex-row justify-between mb-2">
                              <Text className="text-xs font-bold text-slate-500 uppercase">
                                {getSectionName(strength.area)}
                              </Text>
                              <Text className="text-xs font-bold text-cyan-600">
                                {strength.importance === 'high' ? '95%' : '88%'}
                              </Text>
                            </View>
                            <Progress
                              value={strength.importance === 'high' ? 95 : 88}
                              className="h-2 bg-slate-100"
                            />
                          </View>
                        ))}
                    </CardContent>
                  </Card>
                )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}