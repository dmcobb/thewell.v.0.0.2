import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Platform,
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
      console.error('[Anointed Innovations] Error fetching match details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleChatNow = (match?: Match) => {
    const targetMatch = match || selectedMatch;
    if (targetMatch?.match_id) {
      setShowMatchModal(false);
      router.push(`/chat/${targetMatch.match_id}`);
    }
  };

  const handleUnmatch = async () => {
    if (!selectedMatch?.match_id) return;
    try {
      setUnmatching(true);
      await matchService.unmatch(selectedMatch.match_id);
      setShowMatchModal(false);
      setSelectedMatch(null);
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
        // iOS padding adjustment for the status bar
        contentContainerStyle={{ 
          paddingHorizontal: 24, 
          paddingTop: Platform.OS === 'ios' ? 60 : 32, 
          paddingBottom: 40 
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
        }
      >
        <View className="gap-6">
          {/* Header Card */}
          <Card className="shadow-sm bg-white/90 border-0">
            <CardHeader className="pb-2">
              <View className="flex-row items-center gap-2">
                <Waves size={20} color="#8B5CF6" />
                <CardTitle className="text-purple-600 font-bold">
                  Flowing Conversations
                </CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <View className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <Text className="text-sm font-medium text-purple-700 italic">
                  "What brings you the deepest peace in your quiet moments with God?"
                </Text>
              </View>
            </CardContent>
          </Card>

          <View className="gap-4">
            <View className="flex-row items-center gap-2 px-1">
              <Heart size={18} color="#8B5CF6" fill="#8B5CF6" />
              <Text className="text-lg font-bold text-slate-800">
                Your Connections
              </Text>
            </View>

            {loading ? (
              <View className="items-center justify-center py-20">
                <ActivityIndicator size="large" color="#8B5CF6" />
              </View>
            ) : matches.length === 0 ? (
              <Card className="shadow-md bg-white/95 border-0 rounded-3xl">
                <CardContent className="p-10 items-center">
                  <View className="w-20 h-20 bg-purple-50 rounded-full items-center justify-center mb-4">
                    <Heart size={40} color="#8B5CF6" />
                  </View>
                  <Text className="text-xl font-bold text-slate-800 text-center">No matches yet</Text>
                  <Text className="text-sm text-slate-500 mt-2 text-center leading-5">
                    Keep exploring to find your divine connection.
                  </Text>
                </CardContent>
              </Card>
            ) : (
              matches.map((match, index) => (
                <TouchableOpacity
                  key={match.match_id || index}
                  onPress={() => handleMatchPress(match)}
                  activeOpacity={0.7} // Better tactile feedback for iOS
                >
                  <Card className="shadow-sm bg-white border-0 rounded-2xl overflow-hidden">
                    <CardContent className="p-4">
                      <View className="flex-row items-center gap-4">
                        <View className="relative">
                          <Avatar className="w-16 h-16 border-2 border-purple-100">
                            <AvatarImage source={{ uri: match.primary_photo }} />
                            <AvatarFallback className="bg-slate-200">
                              <Text className="text-slate-500 font-bold">{match.first_name?.[0]}</Text>
                            </AvatarFallback>
                          </Avatar>
                          {match.profile_video_thumbnail_url && (
                            <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full items-center justify-center border-2 border-white shadow-sm">
                              <Play size={10} color="white" fill="white" />
                            </View>
                          )}
                        </View>
                        
                        <View className="flex-1">
                          <Text className="font-bold text-lg text-slate-900 leading-tight">
                            {match.first_name}
                          </Text>
                          <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            {match.location_city}
                          </Text>
                          {match.match_score && (
                            <View className="flex-row">
                              <Badge className="bg-cyan-50 border-0 px-2 py-0.5">
                                <Text className="text-[10px] font-bold text-cyan-700">
                                  {Math.round(match.match_score)}% HARMONY
                                </Text>
                              </Badge>
                            </View>
                          )}
                        </View>

                        <TouchableOpacity
                          className="h-12 w-12 bg-purple-600 rounded-2xl items-center justify-center shadow-sm"
                          onPress={() => handleChatNow(match)}
                        >
                          <MessageCircle size={22} color="white" />
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

      {/* Profile Detail Modal */}
      <Modal 
        visible={showMatchModal} 
        transparent 
        animationType="slide"
        // This is key for iOS to make it feel like a system-native sheet
        presentationStyle="overFullScreen" 
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-[40px] h-[90%] shadow-2xl">
            {/* Grabber Handle for iOS Feel */}
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mt-4 mb-2" />

            <View className="flex-row items-center justify-between px-8 py-4">
              <Text className="text-3xl font-bold text-slate-900">
                {selectedMatch?.first_name}
              </Text>
              <TouchableOpacity
                className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
                onPress={() => setShowMatchModal(false)}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {loadingDetails ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator color="#8B5CF6" />
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-8">
                {/* Profile Visual */}
                <View className="rounded-[32px] overflow-hidden h-80 bg-slate-100 mb-6 shadow-sm">
                  <Avatar className="w-full h-full rounded-none">
                    <AvatarImage source={{ uri: selectedMatch?.primary_photo }} className="w-full h-full" />
                    <AvatarFallback className="w-full h-full items-center justify-center">
                      <Text className="text-4xl font-bold text-slate-300">{selectedMatch?.first_name?.[0]}</Text>
                    </AvatarFallback>
                  </Avatar>
                </View>

                {/* Content Sections */}
                <View className="gap-5 pb-10">
                  <View className="flex-row flex-wrap gap-2">
                    {matchDetails?.denomination && (
                      <Badge className="bg-purple-100 border-0 px-4 py-1.5 rounded-full">
                        <Text className="text-purple-700 font-bold">{matchDetails.denomination}</Text>
                      </Badge>
                    )}
                    {matchDetails?.occupation && (
                      <Badge className="bg-slate-100 border-0 px-4 py-1.5 rounded-full">
                        <Text className="text-slate-600 font-bold">{matchDetails.occupation}</Text>
                      </Badge>
                    )}
                  </View>

                  {matchDetails?.bio && (
                    <View>
                      <Text className="text-[15px] leading-6 text-slate-700 font-medium italic">
                        "{matchDetails.bio}"
                      </Text>
                    </View>
                  )}

                  <View className="h-[1px] bg-slate-100 w-full my-2" />

                  {/* Harmony Score */}
                  {matchDetails?.match_score && (
                    <View className="bg-cyan-50 rounded-3xl p-6 flex-row items-center justify-between">
                      <View>
                        <Text className="text-cyan-800 font-bold text-lg leading-tight">Soul Harmony</Text>
                        <Text className="text-cyan-600 text-sm font-medium">Faith-based compatibility</Text>
                      </View>
                      <Text className="text-4xl font-bold text-cyan-600">{Math.round(matchDetails.match_score)}%</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}

            {/* Sticky Actions */}
            <View className="p-8 pt-4 pb-12 border-t border-slate-50 gap-4">
              <TouchableOpacity
                className="bg-purple-600 h-16 rounded-2xl flex-row items-center justify-center shadow-lg"
                onPress={() => handleChatNow()}
               activeOpacity={0.8}
              >
                <MessageCircle size={22} color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg">Message {selectedMatch?.first_name}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="h-12 items-center justify-center"
                onPress={handleUnmatch}
                disabled={unmatching}
              >
                <Text className="text-slate-400 font-bold text-base">
                  {unmatching ? 'Removing Connection...' : 'Unmatch Connection'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}