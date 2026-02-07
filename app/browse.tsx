import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  Search,
  MapPin,
  Heart,
  X,
  Users,
  Shield,
  Home,
} from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { matchService, type DiscoverUser } from '@/lib/services/match.service';
import {
  subscriptionService,
  type DailyLikeStatus,
} from '@/lib/services/subscription.service';
import { userService, type UserPreferences } from '@/lib/services/user.service';
import { useRouter } from 'expo-router';
import { VideoPlayer } from '@/components/video-player';
import { useAuth } from '@/contexts/auth-context';
import { SubscriptionPaywall } from '@/components/subscription-paywall';

export default function BrowseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [likeStatus, setLikeStatus] = useState<DailyLikeStatus | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    checkSubscriptionStatus();
    loadPreferences();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const status = await subscriptionService.getUserSubscription();
      setHasUsedTrial(status.has_used_trial);

      const dailyStatus = await subscriptionService.checkDailyLikeLimit();
      setLikeStatus(dailyStatus);
    } catch (err) {
      console.error('[Anointed Innovations] Error checking subscription:', err);
    }
  };

  const loadPreferences = async () => {
    try {
      const prefs = await userService.getPreferences();
      setPreferences(prefs);
    } catch (err) {
      console.error('[Anointed Innovations] Error loading preferences:', err);
    }
  };

  const loadUsers = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      if (!user?.gender) {
        setError('Please complete your profile before browsing.');
        return;
      }

      const response = await matchService.getDiscoverMatches(50, 0);

      const oppositeGender = user.gender === 'male' ? 'female' : 'male';
      const filteredUsers = Array.isArray(response)
        ? response.filter((u: DiscoverUser) => {
            if (u.gender !== oppositeGender) return false;

            if (
              preferences?.maxDistance &&
              user.location_city &&
              u.location_city
            ) {
              return true;
            }

            return true;
          })
        : [];

      setUsers(filteredUsers);
    } catch (err) {
      console.error('[Anointed Innovations] Error loading users:', err);
      setError('Unable to load users. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleLike = async (userId: string) => {
    if (likeStatus && !likeStatus.is_premium && !likeStatus.can_like) {
      setShowPaywall(true);
      return;
    }

    try {
      const result = await matchService.likeUser(userId);

      if (likeStatus && !likeStatus.is_premium) {
        await subscriptionService.incrementDailyLikes();
        await checkSubscriptionStatus();
      }

      if (result.isMatch) {
        // Optional: I can use this to show a match notification or something
      }

      setUsers(users.filter((u) => u.id !== userId));
    } catch (err: any) {
      console.error('[Anointed Innovations] Error liking user:', err);

      if (
        err?.message?.includes('daily like limit') ||
        err?.message?.includes('limit reached')
      ) {
        setShowPaywall(true);
      }
    }
  };

  const handlePass = async (userId: string) => {
    try {
      await matchService.passUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      console.error('[Anointed Innovations] Error passing user:', err);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      if (planId === 'trial') {
        await subscriptionService.activateTrial();
        setShowPaywall(false);
        await checkSubscriptionStatus();
      } else {
        // Initially empty
      }
    } catch (err) {
      console.error('[Anointed Innovations] Error subscribing:', err);
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

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.first_name?.toLowerCase().includes(query) ||
      user.location_city?.toLowerCase().includes(query) ||
      user.denomination?.toLowerCase().includes(query) ||
      user.occupation?.toLowerCase().includes(query)
    );
  });

  return (
    <View className="flex-1 bg-gradient-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      <LinearGradient
        colors={['#0891B2', '#0284C7', '#8B5CF6', '#0369A1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <View className="px-4 pt-12 pb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 mb-4">
              <Button variant="ghost" size="sm" onPress={() => router.back()}>
                <ArrowLeft size={24} color="white" />
              </Button>
              <View className="flex-1">
                <Text className="text-xl font-bold text-white">Browse</Text>
                <Text className="text-purple-100 text-xs">
                  {preferences?.maxDistance
                    ? `Discover souls within ${preferences.maxDistance} miles`
                    : 'Discover souls in your area'}
                </Text>
              </View>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => router.push('/(tabs)')}
              >
                <Home size={24} color="white" />
              </Button>
            </View>
          </View>

          {likeStatus && !likeStatus.is_premium && (
            <View className="bg-white/20 backdrop-blur-lg rounded-xl p-2 mb-2">
              <Text className="text-white text-xs text-center">
                {likeStatus.likes_remaining} likes remaining today
              </Text>
            </View>
          )}

          <View className="bg-white/20 backdrop-blur-lg rounded-xl p-3 flex-row items-center gap-2">
            <Search size={20} color="white" opacity={0.8} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name, location, denomination..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              className="flex-1 text-white"
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadUsers(true)}
          />
        }
      >
        {loading && (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#0891B2" />
            <Text className="text-slate-600 mt-4">Loading profiles...</Text>
          </View>
        )}

        {error && !loading && (
          <Card className="shadow-lg bg-white/95">
            <CardContent className="p-6 items-center">
              <Text className="text-red-500 text-center mb-4">{error}</Text>
              <Button onPress={() => loadUsers()}>
                <Text className="text-white font-medium">Try Again</Text>
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && filteredUsers.length === 0 && (
          <Card className="shadow-lg bg-white/95">
            <CardContent className="p-6 items-center">
              <Users size={48} color="#94a3b8" />
              <Text className="text-slate-800 font-semibold text-lg mt-4">
                No Profiles Found
              </Text>
              <Text className="text-slate-600 text-center mt-2">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Check back soon for new profiles'}
              </Text>
            </CardContent>
          </Card>
        )}

        <View className="gap-4">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="overflow-hidden shadow-xl bg-white/95"
            >
              <View className="relative h-64">
                {user.profile_video_url ? (
                  <VideoPlayer
                    videoUrl={user.profile_video_url}
                    poster={user.profile_video_thumbnail_url || undefined}
                    className="h-full"
                  />
                ) : user.photos && user.photos.length > 0 ? (
                  <Image
                    source={{
                      uri:
                        user.photos.find((p) => p.is_primary)?.photo_url ||
                        user.photos[0].photo_url,
                    }}
                    className="w-full h-full"
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-slate-200 items-center justify-center">
                    <Users size={64} color="#94a3b8" />
                  </View>
                )}
                <View className="absolute top-3 right-3 flex-row gap-2">
                  <Badge variant="secondary" className="bg-white/90">
                    <View className="flex-row items-center gap-1">
                      <Shield size={10} color="#0891B2" />
                      <Text className="text-primary text-xs">Verified</Text>
                    </View>
                  </Badge>
                  {user.match_score && (
                    <Badge className="bg-gradient-to-r from-primary to-primary-light">
                      <Text className="text-white text-xs">
                        {user.match_score}% Match
                      </Text>
                    </Badge>
                  )}
                </View>
              </View>

              <CardContent className="p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-xl font-semibold text-slate-800">
                      {user.first_name}, {calculateAge(user.date_of_birth)}
                    </Text>
                    {user.location_city && user.location_state && (
                      <View className="flex-row items-center gap-1 mt-1">
                        <MapPin size={14} color="#64748B" />
                        <Text className="text-sm text-slate-600">
                          {user.location_city}, {user.location_state}
                        </Text>
                      </View>
                    )}
                  </View>
                  {user.denomination && (
                    <Badge
                      variant="outline"
                      className="border-purple-200 bg-purple-50"
                    >
                      <Text className="text-xs text-purple-500">
                        {user.denomination}
                      </Text>
                    </Badge>
                  )}
                </View>

                {user.bio && (
                  <Text
                    className="text-sm text-slate-600 mb-3 leading-relaxed"
                    numberOfLines={2}
                  >
                    "{user.bio}"
                  </Text>
                )}

                {user.occupation && (
                  <View className="bg-ocean-50 p-2 rounded-lg mb-3">
                    <Text className="text-xs text-primary font-medium">
                      {user.occupation}
                    </Text>
                  </View>
                )}

                <View className="flex-row gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-10 bg-transparent"
                    onPress={() => handlePass(user.id)}
                  >
                    <View className="flex-row items-center gap-1">
                      <X size={16} color="#8B5CF6" />
                      <Text className="text-purple-500 font-medium text-sm">
                        Pass
                      </Text>
                    </View>
                  </Button>
                  <Button
                    className="flex-1 h-10"
                    onPress={() => handleLike(user.id)}
                    disabled={
                      likeStatus
                        ? !likeStatus.can_like && !likeStatus.is_premium
                        : false
                    }
                  >
                    <View className="flex-row items-center gap-1">
                      <Heart size={16} color="white" />
                      <Text className="text-white font-medium text-sm">
                        Like
                      </Text>
                    </View>
                  </Button>
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SubscriptionPaywall
          onClose={() => setShowPaywall(false)}
          onSubscribe={handleSubscribe}
          hasUsedTrial={hasUsedTrial}
        />
      </Modal>
    </View>
  );
}
