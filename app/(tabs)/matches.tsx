import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Heart, MessageCircle, Play, Waves, X } from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import {
  matchService,
  type Match,
  type MatchDetails,
} from '@/lib/services/match.service';
import { useRouter } from 'expo-router';

export default function MatchesTab() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [unmatching, setUnmatching] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await matchService.getMatches();
      setMatches(response);
    } catch (error) {
      console.error('[Anointed Innovations] Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMatches();
    setRefreshing(false);
  };

  const handleMatchPress = async (match: Match) => {
    setSelectedMatch(match);
    setShowMatchModal(true);

    try {
      setLoadingDetails(true);
      const details = await matchService.getMatchDetails(match.match_id);
      setMatchDetails(details);
    } catch (error) {
      console.error(
        '[Anointed Innovations] Error fetching match details:',
        error,
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleChatNow = (match?: Match) => {
    const targetMatch = match || selectedMatch;
    if (targetMatch?.match_id) {
      setShowMatchModal(false);
      router.push(`/chat/${targetMatch.match_id}`);
    } else {
      console.error('[Anointed Innovations] No match ID available for chat', {
        match,
        selectedMatch,
        targetMatch,
      });
    }
  };

  const handleUnmatch = async () => {
    if (!selectedMatch?.match_id) return;

    try {
      setUnmatching(true);
      await matchService.unmatch(selectedMatch.match_id);
      setShowMatchModal(false);
      setSelectedMatch(null);
      setMatchDetails(null);
      await fetchMatches();
    } catch (error) {
      console.error('[Anointed Innovations] Error unmatching:', error);
    } finally {
      setUnmatching(false);
    }
  };

  return (
    <View className="flex-1 bg-linear-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="gap-6">
          <Card className="shadow-lg bg-white/95">
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <Waves size={20} color="#8B5CF6" />
                <CardTitle className="text-purple-500">
                  Flowing Conversations
                </CardTitle>
              </View>
              <Text className="text-sm text-slate-600">
                Gentle ways to connect hearts
              </Text>
            </CardHeader>
            <CardContent className="gap-3">
              <View className="p-4 bg-linear-to-r from-ocean-50 to-ocean-100 rounded-xl border border-purple-200/50">
                <Text className="text-sm font-medium text-purple-500">
                  "What brings you the deepest peace in your quiet moments with
                  God?"
                </Text>
              </View>
            </CardContent>
          </Card>

          <View className="gap-4">
            <View className="flex-row items-center gap-2">
              <Heart size={20} color="#8B5CF6" />
              <Text className="text-lg font-semibold text-purple-500">
                Your Connections
              </Text>
            </View>

            {loading ? (
              <View className="items-center justify-center py-10">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="text-slate-600 mt-4">
                  Loading your connections...
                </Text>
              </View>
            ) : matches.length === 0 ? (
              <Card className="shadow-lg bg-white/95">
                <CardContent className="p-6 items-center">
                  <Heart size={48} color="#8B5CF6" />
                  <Text className="text-lg font-semibold text-slate-800 mt-4 text-center">
                    No matches yet
                  </Text>
                  <Text className="text-sm text-slate-600 mt-2 text-center">
                    Keep exploring the Discover tab to find your divine
                    connection
                  </Text>
                </CardContent>
              </Card>
            ) : (
              matches.map((match, index) => (
                <TouchableOpacity
                  key={match.match_id || index}
                  onPress={() => handleMatchPress(match)}
                >
                  <Card className="shadow-lg bg-white/95">
                    <CardContent className="p-4">
                      <View className="flex-row items-center gap-4">
                        <View className="relative">
                          <Avatar className="ring-2 ring-purple-200/50">
                            {match.primary_photo ? (
                              <AvatarImage
                                source={{ uri: match.primary_photo }}
                              />
                            ) : null}
                            <AvatarFallback className="bg-linear-to-br from-ocean-400 to-primary">
                              <Text className="text-white text-lg font-semibold">
                                {match.first_name?.[0] || '?'}
                              </Text>
                            </AvatarFallback>
                          </Avatar>
                          {match.profile_video_thumbnail_url && (
                            <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-linear-to-r from-primary to-primary-light rounded-full items-center justify-center shadow-md">
                              <Play size={10} color="white" />
                            </View>
                          )}
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2 mb-1">
                            <Text className="font-semibold text-base text-slate-800">
                              {match.first_name}
                            </Text>
                            {match.match_score && (
                              <Badge className="bg-linear-to-r from-ocean-50 to-ocean-100 border-purple-200">
                                <Text className="text-xs text-purple-500">
                                  {Math.round(match.match_score)}% harmony
                                </Text>
                              </Badge>
                            )}
                          </View>
                          <Text className="text-sm text-slate-600">
                            {match.location_city}
                          </Text>
                          {match.profile_video_thumbnail_url && (
                            <Text className="text-xs text-purple-500 mt-1">
                              Shared their story
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                          className="h-10 w-10 bg-linear-to-r from-primary to-primary-light rounded-lg items-center justify-center shadow-md"
                          onPress={() => handleChatNow(match)}
                        >
                          <MessageCircle size={16} color="purple" />
                        </TouchableOpacity>
                      </View>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Match Details Modal */}
      <Modal visible={showMatchModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl flex-1 max-h-4/5">
            {/* Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-slate-200">
              <Text className="text-2xl font-bold text-slate-800">
                {selectedMatch?.first_name}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowMatchModal(false);
                  setMatchDetails(null);
                }}
              >
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            {loadingDetails ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="text-slate-600 mt-4">Loading profile...</Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1 px-6 py-4"
              >
                {/* Match Photo */}
                <View className="mb-4 rounded-2xl overflow-hidden h-64 bg-slate-200">
                  <Avatar className="w-full h-full">
                    {selectedMatch?.primary_photo && (
                      <AvatarImage
                        source={{ uri: selectedMatch.primary_photo }}
                      />
                    )}
                    <AvatarFallback className="bg-slate-200 w-full h-full items-center justify-center">
                      <Text className="text-slate-400 text-4xl font-bold">
                        {selectedMatch?.first_name?.[0] || '?'}
                      </Text>
                    </AvatarFallback>
                  </Avatar>
                </View>

                {/* Match Info */}
                <View className="gap-4 pb-6">
                  {/* Location */}
                  <View className="bg-linear-to-r from-ocean-50 to-ocean-100 rounded-xl p-4">
                    <Text className="text-xs text-slate-600 font-semibold mb-1 uppercase">
                      Location
                    </Text>
                    <Text className="text-base font-semibold text-slate-800">
                      {matchDetails?.location_city
                        ? `${matchDetails.location_city}${matchDetails?.location_state ? ', ' + matchDetails.location_state : ''}`
                        : 'Not specified'}
                    </Text>
                  </View>

                  {/* Personal Info */}
                  {(matchDetails?.gender ||
                    matchDetails?.date_of_birth ||
                    matchDetails?.height_cm) && (
                    <View className="bg-slate-50 rounded-xl p-4">
                      <Text className="text-xs text-slate-600 font-semibold mb-2 uppercase">
                        About
                      </Text>
                      <View className="gap-1">
                        {matchDetails?.gender && (
                          <Text className="text-sm text-slate-800">
                            {matchDetails.gender}
                          </Text>
                        )}
                        {matchDetails?.height_cm && (
                          <Text className="text-sm text-slate-800">
                            {Math.floor(matchDetails.height_cm / 30.48)}
                            {"'"}
                            {Math.round(
                              (matchDetails.height_cm % 30.48) / 2.54,
                            )}
                            {'"'}
                          </Text>
                        )}
                        {matchDetails?.occupation && (
                          <Text className="text-sm text-slate-800">
                            {matchDetails.occupation}
                          </Text>
                        )}
                        {matchDetails?.education_level && (
                          <Text className="text-sm text-slate-800">
                            {matchDetails.education_level}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Faith Info */}
                  {matchDetails?.denomination && (
                    <View className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                      <Text className="text-xs text-slate-600 font-semibold mb-1 uppercase">
                        Faith Journey
                      </Text>
                      <View className="gap-2">
                        {matchDetails?.denomination && (
                          <Text className="text-sm text-slate-800">
                            {matchDetails.denomination}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  {/* About */}
                  {matchDetails?.bio && (
                    <View className="bg-slate-50 rounded-xl p-4">
                      <Text className="text-xs text-slate-600 font-semibold mb-2 uppercase">
                        About {matchDetails?.first_name}
                      </Text>
                      <Text className="text-sm leading-relaxed text-slate-800">
                        {matchDetails.bio}
                      </Text>
                    </View>
                  )}

                  {/* Compatibility */}
                  {matchDetails?.match_score && (
                    <View className="bg-linear-to-r from-primary/10 to-primary-light/10 rounded-xl p-4 border border-primary/20">
                      <Text className="text-xs text-slate-600 font-semibold mb-2 uppercase">
                        Compatibility Match
                      </Text>
                      <View className="flex-row items-baseline gap-2">
                        <Text className="text-3xl font-bold text-primary">
                          {Math.round(matchDetails.match_score)}%
                        </Text>
                        <Text className="text-sm text-slate-600">harmony</Text>
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}

            {/* Action Buttons - Fixed at bottom */}
            <View className="gap-3 p-6 border-t border-slate-200 bg-white">
              <TouchableOpacity
                className="bg-linear-to-r from-primary to-primary-light rounded-xl p-4 flex items-center shadow-md"
                onPress={() => handleChatNow()}
              >
                <MessageCircle size={20} color="purple" />
                <Text className="text-purple font-semibold text-base">
                  Chat Now
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="border-2 border-slate-300 rounded-xl p-3 items-center"
                onPress={handleUnmatch}
                disabled={unmatching}
              >
                <Text className="text-slate-700 font-semibold text-base">
                  {unmatching ? 'Unmatching...' : 'Unmatch'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
