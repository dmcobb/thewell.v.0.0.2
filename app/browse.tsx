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
  const [subscriptionModal, setSubscriptionModal] = useState(false);

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
        <ActivityIndicator size="large" color="#0891B2" />
        <Text className="mt-4 text-slate-600">Loading matches...</Text>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Card className="border-slate-200 w-full">
          <CardContent className="p-6 items-center">
            <Text className="text-2xl font-bold text-slate-800 mb-2">
              No more matches
            </Text>
            <Text className="text-slate-600 text-center mb-6">
              You've reviewed all available matches. Check back later for more!
            </Text>
            <TouchableOpacity
              className="bg-gradient-to-r from-primary to-primary-light px-6 py-3 rounded-full"
              onPress={fetchMatches}
            >
              <Text className="text-white font-semibold">Refresh</Text>
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
      <View className="bg-white border-b border-slate-200 px-4 py-4">
        <Text className="text-2xl font-bold text-slate-800">Discover</Text>
        <Text className="text-slate-600 text-sm">
          {currentIndex + 1} of {matches.length}
        </Text>
      </View>

      {/* Card Stack */}
      <View className="flex-1 items-center justify-center px-4 py-6">
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => handleMatchPress(currentMatch)}
          className="w-full"
        >
          <Card className="border-0 shadow-lg overflow-hidden">
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
                <View className="w-full h-full bg-slate-300 items-center justify-center rounded-lg">
                  <Users size={48} color="#94a3b8" />
                </View>
              )}

              {/* Overlay Info */}
              <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <Text className="text-white text-2xl font-bold">
                  {currentMatch?.first_name}, {currentMatch?.age || 'N/A'}
                </Text>
                <Text className="text-white/80 text-sm">
                  {currentMatch?.location_city}
                </Text>
                <Text className="text-white/70 text-xs mt-2 line-clamp-2">
                  {currentMatch?.bio}
                </Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View className="flex-row gap-6 mt-8 justify-center items-center">
          <TouchableOpacity
            className="w-14 h-14 rounded-full bg-white border-2 border-red-500 items-center justify-center shadow-md"
            onPress={handleDislike}
          >
            <X size={24} color="#ef4444" />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary-light items-center justify-center shadow-lg"
            onPress={() => handleLike(currentMatch.id)}
          >
            <Heart size={28} color="white" fill="white" />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-14 h-14 rounded-full bg-white border-2 border-slate-300 items-center justify-center shadow-md"
            onPress={() => {
              setSelectedMatchId(currentMatch.id);
              setChatModalVisible(true);
            }}
          >
            <MessageCircle size={24} color="#0891B2" />
          </TouchableOpacity>
        </View>

        {/* Stack Counter */}
        <View className="mt-6 flex-row gap-2">
          {matches
            .slice(currentIndex, Math.min(currentIndex + 3, matches.length))
            .map((_, idx) => (
              <View
                key={idx}
                className="h-1 bg-slate-300 rounded-full flex-1"
                style={{ opacity: 1 - idx * 0.3 }}
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
        <View className="flex-1 bg-white pt-12">
          <TouchableOpacity
            className="px-4 py-2"
            onPress={() => setModalVisible(false)}
          >
            <Text className="text-primary font-semibold text-lg">Close</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            {selectedMatch?.primary_photo && (
              <View className="w-full bg-slate-200" style={{ height: 400 }}>
                <Image
                  source={{ uri: selectedMatch.primary_photo }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
            )}

            <View className="px-4 py-6">
              <Text className="text-3xl font-bold text-slate-800 mb-2">
                {selectedMatch?.first_name}, {selectedMatch?.age}
              </Text>
              <Text className="text-slate-600 mb-4">
                {selectedMatch?.location_city}
              </Text>

              {selectedMatch?.bio && (
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-slate-700 mb-2">
                    About
                  </Text>
                  <Text className="text-slate-600 leading-relaxed">
                    {selectedMatch.bio}
                  </Text>
                </View>
              )}

              {selectedMatch?.interests &&
                selectedMatch.interests.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-sm font-semibold text-slate-700 mb-3">
                      Interests
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {selectedMatch.interests.map(
                        (interest: string, idx: number) => (
                          <View
                            key={idx}
                            className="bg-primary/10 px-3 py-2 rounded-full border border-primary/20"
                          >
                            <Text className="text-primary text-sm font-medium">
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
          <View className="border-t border-slate-200 px-4 py-4 flex-row gap-4">
            <TouchableOpacity
              className="flex-1 border-2 border-red-500 rounded-full py-3 items-center"
              onPress={() => {
                setModalVisible(false);
                handleDislike();
              }}
            >
              <X size={24} color="#ef4444" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-gradient-to-r from-primary to-primary-light rounded-full py-3 items-center"
              onPress={() => {
                setModalVisible(false);
                handleLike(selectedMatch.id);
              }}
            >
              <Heart size={24} color="white" fill="white" />
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
        <View className="flex-1 bg-black/50 items-center justify-center">
          <Card className="border-slate-200 mx-6">
            <CardContent className="p-6">
              <Text className="text-2xl font-bold text-slate-800 mb-2 text-center">
                It's a Match!
              </Text>
              <Text className="text-slate-600 text-center mb-6">
                You and {selectedMatch?.first_name} liked each other. Start
                chatting now!
              </Text>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 border border-slate-300 rounded-full py-3"
                  onPress={() => setChatModalVisible(false)}
                >
                  <Text className="text-slate-800 font-semibold text-center">
                    Later
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-gradient-to-r from-primary to-primary-light rounded-full py-3"
                  onPress={handleChatNow}
                >
                  <Text className="text-white font-semibold text-center">
                    Chat Now
                  </Text>
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>
        </View>
      </Modal>
    </View>
  );
}
