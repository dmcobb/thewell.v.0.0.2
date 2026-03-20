import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, X, MessageCircle, Users } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { matchService } from '@/lib/services/match.service';
import { useAuth } from '@/contexts/auth-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function BrowseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await matchService.getDiscoverMatches(50, 0);
      setMatches(response);
    } catch (error) {
      console.error('[Anointed Innovations] Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (matchId: string) => {
    try {
      const result = await matchService.likeUser(matchId);
      if (result.isMatch) {
        setSelectedMatchId(matchId);
        setChatModalVisible(true);
      }
      handleSwipeNext();
    } catch (error) {
      console.error('[Anointed Innovations] Error liking user:', error);
    }
  };

  const handleDislike = () => {
    handleSwipeNext();
  };

  const handleSwipeNext = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setMatches([]);
      setCurrentIndex(0);
    }
  };

  const handleMatchPress = (matchData: any) => {
    setSelectedMatch(matchData);
    setModalVisible(true);
  };

  const handleChatNow = () => {
    if (selectedMatchId) {
      setChatModalVisible(false);
      router.push(`/chat/${selectedMatchId}`);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#9B7EDE" />
        <Text className="mt-4 text-slate-600">Loading matches...</Text>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-4">
        <Card className="border-slate-200 w-full bg-white shadow-sm">
          <CardContent className="p-8 items-center">
            <View className="bg-purple-50 p-4 rounded-full mb-4">
              <Users size={48} color="#9B7EDE" />
            </View>
            <Text className="text-2xl font-bold text-slate-800 mb-2">
              No more matches
            </Text>
            <Text className="text-slate-600 text-center mb-6">
              You've reviewed all available matches. Check back later for more!
            </Text>
            <TouchableOpacity
              onPress={fetchMatches}
              className="w-full"
            >
              <LinearGradient
                colors={['#9B7EDE', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 999, paddingVertical: 14 }}
              >
                <Text className="text-white font-bold text-center">Refresh</Text>
              </LinearGradient>
            </TouchableOpacity>
          </CardContent>
        </Card>
      </View>
    );
  }

  const currentMatch = matches[currentIndex];

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white border-b border-slate-200 px-6 pt-14 pb-4">
        <Text className="text-2xl font-bold text-slate-800">Discover</Text>
        <Text className="text-slate-500 text-sm font-medium">
          Showing {currentIndex + 1} of {matches.length} matches
        </Text>
      </View>

      {/* Card Stack */}
      <View className="flex-1 items-center justify-center px-4 py-6">
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => handleMatchPress(currentMatch)}
          className="w-full"
        >
          <Card className="border-0 shadow-xl overflow-hidden bg-white rounded-[32px]">
            <View
              className="relative w-full bg-slate-200"
              style={{ height: 500 }}
            >
              {currentMatch?.primary_photo ? (
                <Image
                  source={{ uri: currentMatch.primary_photo }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-slate-100 items-center justify-center">
                  <Users size={64} color="#CBD5E1" />
                </View>
              )}

              {/* Overlay Info */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                className="absolute bottom-0 left-0 right-0 p-6 pt-12"
              >
                <Text className="text-white text-3xl font-bold">
                  {currentMatch?.first_name}, {currentMatch?.age || 'N/A'}
                </Text>
                <Text className="text-purple-200 text-base font-medium">
                  {currentMatch?.location_city}
                </Text>
                <Text className="text-white/90 text-sm mt-3 line-clamp-2 leading-5">
                  {currentMatch?.bio}
                </Text>
              </LinearGradient>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View className="flex-row gap-8 mt-10 justify-center items-center">
          <TouchableOpacity
            className="w-16 h-16 rounded-full bg-white items-center justify-center shadow-lg border border-slate-100"
            onPress={handleDislike}
          >
            <X size={28} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleLike(currentMatch.id)}
            style={{ shadowColor: '#9B7EDE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}
          >
            <LinearGradient
              colors={['#9B7EDE', '#8B5CF6']}
              className="w-20 h-20 rounded-full items-center justify-center"
            >
              <Heart size={36} color="white" fill="white" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-16 h-16 rounded-full bg-white items-center justify-center shadow-lg border border-slate-100"
            onPress={() => {
              setSelectedMatchId(currentMatch.id);
              setChatModalVisible(true);
            }}
          >
            <MessageCircle size={28} color="#9B7EDE" />
          </TouchableOpacity>
        </View>

        {/* Stack Counter */}
        <View className="mt-8 flex-row gap-2 px-10">
          {matches
            .slice(currentIndex, Math.min(currentIndex + 3, matches.length))
            .map((_, idx) => (
              <View
                key={idx}
                className="h-1.5 rounded-full flex-1"
                style={{ 
                  backgroundColor: idx === 0 ? '#9B7EDE' : '#E2E8F0',
                  opacity: 1 - idx * 0.3 
                }}
              />
            ))}
        </View>
      </View>

      {/* Match Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          <View className="pt-14 px-4 flex-row items-center justify-between border-b border-slate-100 pb-4">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-primary font-bold text-lg">Back</Text>
            </TouchableOpacity>
            <Text className="font-bold text-slate-800 text-lg">Profile Details</Text>
            <View className="w-10" />
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {selectedMatch?.primary_photo && (
              <View className="w-full bg-slate-100" style={{ height: 450 }}>
                <Image
                  source={{ uri: selectedMatch.primary_photo }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
            )}

            <View className="px-6 py-6">
              <Text className="text-3xl font-bold text-slate-800 mb-1">
                {selectedMatch?.first_name}, {selectedMatch?.age}
              </Text>
              <Text className="text-slate-500 text-lg mb-6">
                {selectedMatch?.location_city}
              </Text>

              {selectedMatch?.bio && (
                <View className="mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <Text className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">
                    About
                  </Text>
                  <Text className="text-slate-700 text-lg leading-relaxed">
                    {selectedMatch.bio}
                  </Text>
                </View>
              )}

              {selectedMatch?.interests &&
                selectedMatch.interests.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3">
                      Interests
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {selectedMatch.interests.map(
                        (interest: string, idx: number) => (
                          <View
                            key={idx}
                            className="bg-purple-50 px-4 py-2 rounded-full border border-purple-100"
                          >
                            <Text className="text-primary text-sm font-semibold">
                              {interest}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>
                  </View>
                )}
            </View>
          </ScrollView>

          {/* Action Buttons at Bottom of Modal */}
          <View className="absolute bottom-0 left-0 right-0 bg-white/90 border-t border-slate-100 px-6 py-6 flex-row gap-4">
            <TouchableOpacity
              className="flex-1 bg-slate-100 rounded-2xl py-4 items-center"
              onPress={() => {
                setModalVisible(false);
                handleDislike();
              }}
            >
              <X size={28} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-2 rounded-2xl overflow-hidden"
              onPress={() => {
                setModalVisible(false);
                handleLike(selectedMatch.id);
              }}
            >
              <LinearGradient
                colors={['#9B7EDE', '#8B5CF6']}
                className="py-4 items-center"
              >
                <View className="flex-row items-center gap-2">
                  <Heart size={24} color="white" fill="white" />
                  <Text className="text-white font-bold text-lg">Like</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Chat Match Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={chatModalVisible}
        onRequestClose={() => setChatModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <Card className="border-0 bg-white rounded-[40px] w-full overflow-hidden">
            <View className="p-8 items-center">
              <View className="bg-purple-100 p-4 rounded-full mb-4">
                <Heart size={48} color="#9B7EDE" fill="#9B7EDE" />
              </View>
              <Text className="text-3xl font-bold text-slate-800 mb-2 text-center">
                It's a Match!
              </Text>
              <Text className="text-slate-600 text-center mb-8 text-lg">
                You and {selectedMatch?.first_name} liked each other.
              </Text>

              <View className="w-full gap-4">
                <TouchableOpacity
                  onPress={handleChatNow}
                >
                  <LinearGradient
                    colors={['#9B7EDE', '#8B5CF6']}
                    className="py-4 rounded-2xl items-center"
                  >
                    <Text className="text-white font-bold text-lg">
                      Chat Now
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  className="py-2"
                  onPress={() => setChatModalVisible(false)}
                >
                  <Text className="text-slate-400 font-semibold text-center">
                    Maybe Later
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}