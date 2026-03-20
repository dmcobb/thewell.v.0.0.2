import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
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

  const currentMatch = matches && matches.length > 0 ? matches[currentIndex] : null;

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <View className="flex-1 bg-linear-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      <ScrollView
        className="flex-1"
        // Improved iOS safe area and spacing
        contentContainerStyle={{ 
          paddingHorizontal: 24, 
          paddingTop: Platform.OS === 'ios' ? 64 : 32, 
          paddingBottom: 40 
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadMatches(true)}
            tintColor="#0891B2" // Better spinner visibility on iOS
          />
        }
      >
        <View className="gap-6">
          {/* Welcome Card */}
          <Card className="shadow-lg bg-white/95 border-0">
            <CardContent className="p-5">
              <View className="flex-row items-center gap-4 mb-3">
                <View className="w-14 h-14 rounded-2xl overflow-hidden shadow-md">
                  <Image
                    source={require('../../assets/icon.png')}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-slate-900 text-lg leading-tight">
                    Welcome to The Well
                  </Text>
                  <Text className="text-sm text-slate-500 font-medium">
                    Faith-centered connections
                  </Text>
                </View>
              </View>
              <Text className="text-[15px] text-slate-600 leading-5">
                Discover meaningful connections rooted in faith and guided by love.
              </Text>
            </CardContent>
          </Card>

          {loading && (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#0891B2" />
              <Text className="text-slate-500 mt-4 font-semibold">Finding your matches...</Text>
            </View>
          )}

          {!loading && !error && currentMatch && (
            <>
              {/* AI Matchmaker Teaser */}
              <Card className="shadow-md bg-white/95 border-0">
                <CardContent className="p-4">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-purple-600 rounded-full items-center justify-center shadow-sm">
                      <Sparkles size={20} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-slate-800 text-base">AI Matchmaker</Text>
                      <Text className="text-xs text-slate-500 font-medium">Soul connection found</Text>
                    </View>
                    <Badge className="bg-purple-600 px-3 py-1">
                      <Text className="text-white text-xs font-bold">
                        {currentMatch.match_score}% Match
                      </Text>
                    </Badge>
                  </View>
                </CardContent>
              </Card>

              {/* Main Profile Card */}
              <Card className="overflow-hidden shadow-2xl bg-white border-0">
                <View className="relative h-80">
                  {currentMatch.profile_video_url ? (
                    <VideoPlayer
                      videoUrl={currentMatch.profile_video_url}
                      poster={currentMatch.profile_video_thumbnail_url || undefined}
                      className="h-full w-full"
                    />
                  ) : currentMatch.photos && currentMatch.photos.length > 0 ? (
                    <Image
                      source={{ uri: currentMatch.photos.find((p) => p.is_primary)?.photo_url || currentMatch.photos[0].photo_url }}
                      className="w-full h-full"
                      contentFit="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-slate-100 items-center justify-center">
                      <Users size={64} color="#CBD5E1" />
                    </View>
                  )}
                  
                  {/* Floating Header Badges */}
                  <View className="absolute top-4 left-4 right-4 flex-row justify-between">
                    <Badge className="bg-black/30 border-0 px-3">
                      <View className="flex-row items-center gap-1.5">
                        <Play size={10} color="white" fill="white" />
                        <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Video Story</Text>
                      </View>
                    </Badge>
                    <Badge className="bg-cyan-600 border-0 px-3">
                      <View className="flex-row items-center gap-1">
                        <Shield size={10} color="white" />
                        <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Verified</Text>
                      </View>
                    </Badge>
                  </View>
                </View>

                <CardContent className="p-6">
                  <View className="flex-row items-baseline gap-2 mb-1">
                    <Text className="text-2xl font-bold text-slate-900">
                      {currentMatch.first_name}, {calculateAge(currentMatch.date_of_birth)}
                    </Text>
                    {currentMatch.denomination && (
                      <Text className="text-purple-600 font-bold text-xs uppercase tracking-tighter">
                        • {currentMatch.denomination}
                      </Text>
                    )}
                  </View>

                  {currentMatch.location_city && (
                    <Text className="text-sm text-slate-500 font-semibold mb-4">
                      {currentMatch.location_city}, {currentMatch.location_state}
                    </Text>
                  )}

                  {currentMatch.bio && (
                    <Text className="text-base text-slate-700 mb-6 leading-6 italic">
                      "{currentMatch.bio}"
                    </Text>
                  )}

                  {/* Redesigned Buttons for iOS Tactile Feel */}
                  <View className="flex-row gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 h-14 bg-slate-50 border-slate-200 rounded-2xl"
                      onPress={() => handlePass(currentMatch.id)}
                    >
                      <View className="flex-row items-center gap-2">
                        <MessageCircle size={20} color="#64748B" />
                        <Text className="text-slate-600 font-bold text-lg">Pass</Text>
                      </View>
                    </Button>
                    <Button
                      className="flex-1 h-14 bg-purple-600 rounded-2xl shadow-md"
                      onPress={() => handleLike(currentMatch.id)}
                    >
                      <View className="flex-row items-center gap-2">
                        <Heart size={20} color="white" fill="white" />
                        <Text className="text-white font-bold text-lg">Like</Text>
                      </View>
                    </Button>
                  </View>
                </CardContent>
              </Card>
            </>
          )}

          {/* Bottom CTA */}
          <Card className="overflow-hidden shadow-lg bg-slate-900 border-0 mb-8">
            <CardContent className="p-6">
              <View className="flex-row items-center gap-2 mb-2">
                <Heart size={20} color="#A78BFA" />
                <Text className="text-white font-bold text-lg">Begin Your Journey</Text>
              </View>
              <Text className="text-slate-400 text-sm mb-5 leading-5">
                Let your authentic self shine through and discover connections that honor God.
              </Text>
              <Button
                className="w-full h-12 bg-white rounded-xl"
                onPress={() => router.replace('/profile/video')}
              >
                <Text className="text-slate-900 font-bold">Complete Your Story</Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}