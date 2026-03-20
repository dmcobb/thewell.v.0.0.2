import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import {
  Play,
  Shield,
  Sparkles,
  Heart,
  MessageCircle,
  Users,
  Search,
} from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VideoPlayer } from '@/components/video-player';
import { useState, useEffect } from 'react';
import { matchService, type DiscoverUser } from '@/lib/services/match.service';
import { useRouter } from 'expo-router';

export default function DiscoverTab() {
  const router = useRouter();
  const [matches, setMatches] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadMatches = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await matchService.getDiscoverMatches(10, 0);

      const dataArray =
        response && typeof response === 'object' && 'data' in response
          ? (response as any).data
          : response;

      setMatches(Array.isArray(dataArray) ? dataArray : []);
      setCurrentIndex(0);
    } catch (err) {
      console.error('[Anointed Innovations] Error loading matches:', err);
      setError('Unable to load matches. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleLike = async (userId: string) => {
    try {
      const result = await matchService.likeUser(userId);
      if (result.isMatch) {
        // Initially empty
      }
      if (currentIndex < matches.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        await loadMatches();
      }
    } catch (err) {
      console.error('[Anointed Innovations] Error liking user:', err);
    }
  };

  const handlePass = async (userId: string) => {
    try {
      await matchService.passUser(userId);
      if (currentIndex < matches.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        await loadMatches();
      }
    } catch (err) {
      console.error('[Anointed Innovations] Error passing user:', err);
    }
  };

  const currentMatch =
    matches && matches.length > 0 ? matches[currentIndex] : null;

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

  return (
    <View className="flex-1 bg-linear-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      <ScrollView
        className="flex-1"
        // iOS Fix: Using contentContainerStyle for proper layout rendering
        contentContainerStyle={{ 
          paddingVertical: 32, 
          paddingHorizontal: 24,
          flexGrow: 1 
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadMatches(true)}
            tintColor="#0891B2" // iOS spinner color
          />
        }
      >
        <View className="gap-6">
          {/* Welcome Card */}
          <Card className="shadow-lg bg-white/95">
            <CardContent className="p-4">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-12 h-12 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    source={require('../../assets/icon.png')}
                    style={{ width: '100%', height: '100%' }}
                    className="w-full h-full"
                    contentFit="cover"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-slate-800">
                    Welcome to The Well
                  </Text>
                  <Text className="text-sm text-slate-600">
                    Where faithful hearts find their home
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-slate-600 leading-relaxed">
                Discover meaningful connections rooted in faith, guided by love,
                and blessed by God's perfect timing.
              </Text>
            </CardContent>
          </Card>

          {loading && (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color="#0891B2" />
              <Text className="text-slate-600 mt-4">
                Finding your matches...
              </Text>
            </View>
          )}

          {error && !loading && (
            <Card className="shadow-lg bg-white/95">
              <CardContent className="p-6 items-center">
                <Text className="text-red-500 text-center mb-4">{error}</Text>
                <Button onPress={() => loadMatches()}>
                  <Text className="text-white font-medium">Try Again</Text>
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && !error && (!currentMatch || matches.length === 0) && (
            <Card className="shadow-lg bg-white/95">
              <CardContent className="p-6 items-center">
                <Heart size={48} color="#94a3b8" />
                <Text className="text-slate-800 font-semibold text-lg mt-4">
                  No Matches Yet
                </Text>
                <Text className="text-slate-600 text-center mt-2">
                  Check back soon! We're finding people who share your faith and
                  values.
                </Text>
                <View className="flex-row gap-3 mt-4 w-full">
                  <Button
                    onPress={() => loadMatches()}
                    className="flex-1"
                    variant="outline"
                  >
                    <Text className="text-primary font-medium">Refresh</Text>
                  </Button>
                  <Button
                    onPress={() => router.push('/browse')}
                    className="flex-1"
                  >
                    <View className="flex-row items-center gap-2">
                      <Search size={16} color="white" />
                      <Text className="text-white font-medium">Browse</Text>
                    </View>
                  </Button>
                </View>
              </CardContent>
            </Card>
          )}

          {!loading && !error && currentMatch && (
            <>
              {/* AI Matchmaker Teaser */}
              <Card className="shadow-lg bg-white/95">
                <CardContent className="p-4">
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-linear-to-br from-primary to-primary-light rounded-full items-center justify-center shadow-lg">
                      <Sparkles size={24} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-slate-800">
                        AI Matchmaker
                      </Text>
                      <Text className="text-sm text-slate-600">
                        {matches.length} soul connections found
                      </Text>
                    </View>
                    <Badge className="bg-gradient-to-r from-primary to-primary-light">
                      <Text className="text-white text-xs font-medium">
                        {currentMatch.match_score}% Match
                      </Text>
                    </Badge>
                  </View>
                </CardContent>
              </Card>

              {/* Main Profile Card - Real Data */}
              <Card className="overflow-hidden shadow-xl bg-white/95">
                <View className="relative h-72">
                  {currentMatch.profile_video_url ? (
                    <VideoPlayer
                      videoUrl={currentMatch.profile_video_url}
                      poster={
                        currentMatch.profile_video_thumbnail_url || undefined
                      }
                      className="h-full"
                    />
                  ) : currentMatch.photos && currentMatch.photos.length > 0 ? (
                    <Image
                      source={{
                        uri:
                          currentMatch.photos.find((p) => p.is_primary)
                            ?.photo_url || currentMatch.photos[0].photo_url,
                      }}
                      className="w-full h-full"
                      contentFit="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-slate-200 items-center justify-center">
                      <Users size={64} color="#94a3b8" />
                    </View>
                  )}
                  {currentMatch.profile_video_url && (
                    <View className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-primary to-primary-light">
                        <View className="flex-row items-center gap-1">
                          <Play size={12} color="white" />
                          <Text className="text-white text-xs font-medium">
                            Video Story
                          </Text>
                        </View>
                      </Badge>
                    </View>
                  )}
                  <View className="absolute top-4 right-4 flex-row gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-white/90 border-purple-200"
                    >
                      <View className="flex-row items-center gap-1">
                        <Shield size={12} color="#0891B2" />
                        <Text className="text-primary text-xs font-medium">
                          Verified
                        </Text>
                      </View>
                    </Badge>
                    <Badge className="bg-gradient-to-r from-ocean-400 to-ocean-300">
                      <View className="flex-row items-center gap-1">
                        <Sparkles size={12} color="white" />
                        <Text className="text-white text-xs font-medium">
                          Soul Match
                        </Text>
                      </View>
                    </Badge>
                  </View>
                </View>
                <CardContent className="p-6 bg-linear-to-b from-white to-slate-50">
                  <View className="flex-row items-center gap-3 mb-4">
                    <Text className="text-2xl font-semibold text-slate-800">
                      {currentMatch.first_name},{' '}
                      {calculateAge(currentMatch.date_of_birth)}
                    </Text>
                    {currentMatch.denomination && (
                      <Badge
                        variant="outline"
                        className="border-purple-200 bg-purple-50"
                      >
                        <Text className="text-xs text-purple-500">
                          {currentMatch.denomination}
                        </Text>
                      </Badge>
                    )}
                  </View>

                  {currentMatch.location_city &&
                    currentMatch.location_state && (
                      <Text className="text-xs text-slate-500 mb-2">
                        {currentMatch.location_city},{' '}
                        {currentMatch.location_state}
                      </Text>
                    )}

                  {currentMatch.bio && (
                    <Text className="text-sm text-slate-600 mb-4 leading-relaxed">
                      "{currentMatch.bio}"
                    </Text>
                  )}

                  <View className="gap-4">
                    {currentMatch.occupation && (
                      <View className="bg-gradient-to-r from-ocean-50 to-ocean-100 p-3 rounded-xl border border-purple-200/50">
                        <Text className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                          Occupation
                        </Text>
                        <Text className="text-sm font-medium text-slate-800">
                          {currentMatch.occupation}
                        </Text>
                      </View>
                    )}

                    {currentMatch.height_cm && (
                      <View>
                        <Text className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                          Height
                        </Text>
                        <Badge
                          variant="outline"
                          className="border-purple-200 bg-purple-50 self-start"
                        >
                          <Text className="text-xs text-purple-500">
                            {Math.floor(currentMatch.height_cm / 30.48)}'
                            {Math.round(
                              (currentMatch.height_cm % 30.48) / 2.54,
                            )}
                            "
                          </Text>
                        </Badge>
                      </View>
                    )}
                  </View>

                  <View className="flex-row gap-3 mt-6">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 bg-white"
                      onPress={() => handlePass(currentMatch.id)}
                    >
                      <View className="flex-row items-center gap-2">
                        <MessageCircle size={16} color="#8B5CF6" />
                        <Text className="text-purple-500 font-medium">
                          Pass
                        </Text>
                      </View>
                    </Button>
                    <Button
                      className="flex-1 h-12"
                      onPress={() => handleLike(currentMatch.id)}
                    >
                      <View className="flex-row items-center gap-2">
                        <Heart size={16} color="white" />
                        <Text className="text-white font-medium">Like</Text>
                      </View>
                    </Button>
                  </View>
                </CardContent>
              </Card>
            </>
          )}

          {/* Call to Action */}
          <Card className="overflow-hidden shadow-xl bg-white/95">
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <Heart size={20} color="#8B5CF6" />
                <CardTitle>Begin Your Journey</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <Text className="text-sm text-slate-600 mb-4 leading-relaxed">
                Let your authentic self shine through and discover meaningful
                connections that honor God
              </Text>
              <Button
                variant="outline"
                className="w-full h-12 bg-white"
                onPress={() => router.replace('/profile/video')}
              >
                <Text className="text-purple-500 font-medium">
                  Complete Your Story
                </Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}