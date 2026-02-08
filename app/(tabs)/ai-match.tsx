import { View, Text, ScrollView, ActivityIndicator, Modal } from 'react-native';
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
import { useState, useEffect } from 'react';
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
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    checkSubscriptionAndLoadMatch();
  }, []);

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
      setLoading(true);
      const aiMatch = await matchService.getAIMatch();
      setMatch(aiMatch);
      setLoading(false);
    } catch (error) {
      console.error('[Anointed Innovations] Error loading AI match:', error);
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!match) return;
    try {
      const result = await matchService.likeUser(match.id);
      if (result.is_match) {
        // Initially blank
      }
      // Reload to get next match
      await loadAIMatch();
    } catch (error) {
      console.error('[Anointed Innovations] Error liking user:', error);
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
        setShowPaywall(false);
        await checkSubscriptionAndLoadMatch();
      } else {
        // Handle paid subscription (implement Square integration)
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
    return (
      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SubscriptionPaywall
          onClose={() => router.back()}
          onSubscribe={handleSubscribe}
          hasUsedTrial={subscriptionStatus?.has_used_trial || false}
        />
      </Modal>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gradient-to-b from-ocean-100 via-ocean-50 to-ocean-100 items-center justify-center">
        <ActivityIndicator size="large" color="#0891B2" />
        <Text className="text-slate-600 mt-4">
          Finding your perfect match...
        </Text>
      </View>
    );
  }

  if (!match) {
    return (
      <View className="flex-1 bg-gradient-to-b from-ocean-100 via-ocean-50 to-ocean-100 items-center justify-center p-6">
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
    );
  }

  return (
    <View className="flex-1 bg-gradient-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-6">
        <View className="gap-6">
          <LinearGradient
            colors={['#0891B2', '#0284C7', '#0369A1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-xl overflow-hidden shadow-xl"
          >
            <View className="p-4">
              <View className="flex-row items-center gap-2 mb-1">
                <Brain size={24} color="white" />
                <Text className="text-xl font-bold text-white">
                  Soul Compass AI
                </Text>
                <Crown size={20} color="#fbbf24" />
              </View>
              <Text className="text-sm text-white/90">
                Guided by faith, powered by understanding
              </Text>
            </View>
          </LinearGradient>

          <Card className="shadow-lg bg-white/95">
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <Sparkles size={20} color="#8B5CF6" />
                <CardTitle className="text-purple-500">
                  Divine Connection
                </CardTitle>
              </View>
              <Text className="text-sm text-slate-600">
                A heart that resonates with yours
              </Text>
            </CardHeader>
            <CardContent className="gap-4">
              <View className="flex-row items-center gap-3 mb-3">
                <Avatar className="ring-2 ring-purple-200/50">
                  {match.photos && match.photos.length > 0 ? (
                    <AvatarImage
                      source={{
                        uri:
                          match.photos.find((p) => p.is_primary)?.photo_url ||
                          match.photos[0].photo_url,
                      }}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-ocean-400 to-primary">
                      <Text className="text-white text-lg font-semibold">
                        {match.first_name[0]}
                      </Text>
                    </AvatarFallback>
                  )}
                </Avatar>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-semibold text-base text-slate-800">
                      {match.first_name}, {calculateAge(match.date_of_birth)}
                    </Text>
                    <Badge className="bg-gradient-to-r from-ocean-50 to-ocean-100 border-purple-200">
                      <Text className="text-xs text-purple-500">
                        {Math.round(match.match_score)}% harmony
                      </Text>
                    </Badge>
                  </View>
                  <Text className="text-sm text-slate-600">
                    {match.denomination} • {match.location_city}
                  </Text>
                </View>
              </View>

              {match.profile_video_url && (
                <View className="aspect-video rounded-xl overflow-hidden shadow-md">
                  <VideoPlayer
                    videoUrl={match.profile_video_url}
                    poster={match.profile_video_thumbnail_url || undefined}
                    className="h-full"
                  />
                </View>
              )}

              {match.bio && (
                <View className="bg-gradient-to-r from-ocean-50 to-ocean-100 p-4 rounded-xl border border-purple-200/50">
                  <Text className="text-sm text-purple-500 font-medium mb-2">
                    Soul Resonance Analysis
                  </Text>
                  <Text className="text-xs text-slate-600 leading-relaxed">
                    {match.bio}
                  </Text>
                </View>
              )}

              <View className="flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-10 bg-white"
                  onPress={handlePass}
                >
                  <View className="flex-row items-center gap-2">
                    <MessageCircle size={16} color="#8B5CF6" />
                    <Text className="text-purple-500 font-medium">Pass</Text>
                  </View>
                </Button>
                <Button className="flex-1 h-10" onPress={handleLike}>
                  <View className="flex-row items-center gap-2">
                    <Heart size={16} color="white" />
                    <Text className="text-white font-medium">Like</Text>
                  </View>
                </Button>
              </View>
            </CardContent>
          </Card>

          {match.compatibility_insights &&
            match.compatibility_insights.strengths.length > 0 && (
              <Card className="shadow-lg bg-white/95">
                <CardHeader>
                  <View className="flex-row items-center gap-2">
                    <Waves size={20} color="#8B5CF6" />
                    <CardTitle className="text-purple-500">
                      Harmony Levels
                    </CardTitle>
                  </View>
                </CardHeader>
                <CardContent className="gap-4">
                  <View className="items-center">
                    <Text className="text-3xl font-bold text-purple-500 mb-2">
                      {Math.round(match.match_score)}%
                    </Text>
                    <Text className="text-sm text-slate-600">
                      Deep Connection
                    </Text>
                  </View>

                  <View className="gap-4">
                    {match.compatibility_insights.strengths
                      .slice(0, 3)
                      .map((strength, index) => (
                        <View
                          key={index}
                          className="bg-gradient-to-r from-ocean-50 to-ocean-100 p-3 rounded-xl"
                        >
                          <View className="flex-row justify-between mb-2">
                            <Text className="text-sm text-slate-600">
                              {getSectionName(strength.area)}
                            </Text>
                            <Text className="text-sm text-purple-500 font-medium">
                              {strength.importance === 'high' ? '95%' : '88%'}
                            </Text>
                          </View>
                          <Progress
                            value={strength.importance === 'high' ? 95 : 88}
                            className="h-2 bg-white/50"
                          />
                        </View>
                      ))}
                  </View>
                </CardContent>
              </Card>
            )}
        </View>
      </ScrollView>
    </View>
  );
}
