import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, X, MessageCircle, Users, ArrowLeft, Flag, ShieldOff, MoreVertical } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { matchService, DiscoverUser } from '@/lib/services/match.service';
import { adService, type Ad } from '@/lib/services/ad.service';
import { subscriptionService } from '@/lib/services/subscription.service';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/button';
import { EventAd } from '@/components/event-ad';
import { CampaignAd } from '@/components/campaign-ad';
import { activityLoggerService } from '@/lib/services/activity-logger.service';
import { useAuth } from '@/contexts/auth-context';
import { userService } from '@/lib/services/user.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BrowseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [matches, setMatches] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState<DiscoverUser | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [hasAdFree, setHasAdFree] = useState(false);
  const [adsLoading, setAdsLoading] = useState(true);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string | null>(null);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);

  useEffect(() => {
    fetchMatches();
    fetchAds();
    checkSubscription();
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
      // Log activity
      if (user?.id) {
        await activityLoggerService.logActivity(user.id, 'like', {
          target_user_id: matchId,
          action: 'like',
          is_match: result.isMatch,
        });
      }
      if (result.isMatch) {
        const matchedProfile = matches.find(m => m.id === matchId);
        setSelectedMatch(matchedProfile || null);
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

  const handleMatchPress = (matchData: DiscoverUser) => {
    // Log profile view
    if (user?.id) {
      activityLoggerService.logActivity(user.id, 'profile_view', {
        target_user_id: matchData.id,
        action: 'view_profile',
      });
    }
    setSelectedMatch(matchData);
    setModalVisible(true);
  };

  const handleChatNow = () => {
    if (selectedMatchId) {
      setChatModalVisible(false);
      router.push({
        pathname: "/chat/[matchId]",
        params: { matchId: selectedMatchId }
      });
    }
  };

  const fetchAds = async () => {
    if (hasAdFree) return;
    
    try {
      setAdsLoading(true);
      const fetchedAds = await adService.getAds();
      setAds(fetchedAds);
    } catch (err) {
      console.error('[Anointed Innovations] Error loading ads:', err);
    } finally {
      setAdsLoading(false);
    }
  };

  const checkSubscription = async () => {
    try {
      const adFreeStatus = await subscriptionService.hasAdFreeSubscription();
      setHasAdFree(adFreeStatus);
    } catch (err) {
      console.error('[Anointed Innovations] Error checking ad-free status:', err);
    }
  };

  const handleAdImpression = (adId: string) => {
    adService.trackImpression(adId);
  };

  const handleAdClick = (adId: string) => {
    adService.trackClick(adId);
  };

  // FINAL ROUTING FIX:
  // Uses router.canGoBack() to check the stack defined in your _layout.tsx.
  // If false (no history), it redirects to /(tabs) to prevent the crash.
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)');
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

  const currentMatch = matches[currentIndex];

  return (
    <View className="flex-1 bg-slate-50">
      {/* Persistent Header - Now handles the Back action safely */}
      <LinearGradient
        colors={['#0891B2', '#0284C7', '#8B5CF6', '#0369A1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <View className="px-6 py-8">
          <View className="flex-row items-center gap-3">
            <Button variant="ghost" size="sm" onPress={handleBack}>
              <ArrowLeft size={24} color="white" />
            </Button>
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">Browse</Text>
              {matches.length > 0 && (
                <Text className="text-white/80 text-sm">
                  {currentIndex + 1} of {matches.length}
                </Text>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content Area */}
      {matches.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Card className="border-slate-200 w-full">
            <CardContent className="p-6 items-center">
              <Text className="text-2xl font-bold text-slate-800 mb-2">
                No more matches
              </Text>
              <Text className="text-slate-600 text-center mb-6">
                You've reviewed all available matches. Check back later for more!
              </Text>
              <TouchableOpacity
                className="bg-primary px-6 py-3 rounded-full"
                onPress={fetchMatches}
              >
                <Text className="text-white font-semibold">Refresh</Text>
              </TouchableOpacity>
            </CardContent>
          </Card>
        </View>
      ) : (
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

                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  className="absolute bottom-0 left-0 right-0 p-4"
                >
                  <Text className="text-white text-2xl font-bold">
                    {currentMatch?.first_name}, {currentMatch?.age || 'N/A'}
                  </Text>
                  <Text className="text-white/80 text-sm">
                    {currentMatch?.location_city}
                  </Text>
                  <Text className="text-white/70 text-xs mt-2 line-clamp-2">
                    {currentMatch?.bio}
                  </Text>
                </LinearGradient>
              </View>
            </Card>
          </TouchableOpacity>

          {/* Swipe Buttons */}
          <View className="flex-row gap-6 mt-8 justify-center items-center">
            <TouchableOpacity
              className="w-14 h-14 rounded-full bg-white border-2 border-red-500 items-center justify-center shadow-md"
              onPress={handleDislike}
            >
              <X size={24} color="#ef4444" />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-16 h-16 rounded-full bg-primary items-center justify-center shadow-lg"
              onPress={() => handleLike(currentMatch.id)}
            >
              <Heart size={28} color="white" fill="white" />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-14 h-14 rounded-full bg-white border-2 border-slate-300 items-center justify-center shadow-md"
              onPress={() => {
                setSelectedMatch(currentMatch);
                setSelectedMatchId(currentMatch.id);
                setChatModalVisible(true);
              }}
            >
              <MessageCircle size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Ads Section - Show every 5th profile card if user doesn't have ad-free */}
          {!hasAdFree && !loading && currentIndex > 0 && currentIndex % 5 === 0 && (
            <>
              {adsLoading ? (
                <View className="py-8 items-center">
                  <ActivityIndicator size="large" color="#0891B2" />
                  <Text className="text-slate-600 mt-2">Loading ads...</Text>
                </View>
              ) : (
                <View className="gap-4 mb-6">
                  {ads.slice(0, 2).map((ad) => (
                    <View key={ad.id}>
                      {adService.isEventAd(ad) ? (
                        <EventAd
                          ad={ad}
                          onImpression={handleAdImpression}
                          onClick={handleAdClick}
                        />
                      ) : adService.isCampaignAd(ad) ? (
                        <CampaignAd
                          ad={ad}
                          onImpression={handleAdImpression}
                          onClick={handleAdClick}
                        />
                      ) : null}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* Profile Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-white pt-12">
          <View className="flex-row justify-between items-center px-4 py-2">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-primary font-semibold text-lg">Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActionMenuVisible(true)}
              className="p-2"
            >
              <MoreVertical size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <View style={{ height: 450 }} className="bg-slate-200">
              {selectedMatch?.photos && selectedMatch.photos.length > 0 ? (
                <ScrollView 
                  horizontal 
                  pagingEnabled 
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                >
                  {selectedMatch.photos.map((photo, index) => (
                    <View key={photo.id || index} style={{ width: SCREEN_WIDTH, height: 450 }}>
                      <Image
                        source={{ uri: photo.photo_url }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                      <View className="absolute bottom-4 right-4 bg-black/50 px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-bold">
                          {index + 1} / {selectedMatch.photos?.length || 0}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                selectedMatch?.primary_photo && (
                  <Image
                    source={{ uri: selectedMatch.primary_photo }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                )
              )}
            </View>

            <View className="px-4 py-6">
              <Text className="text-3xl font-bold text-slate-800 mb-2">
                {selectedMatch?.first_name}, {selectedMatch?.age}
              </Text>
              <Text className="text-slate-600 mb-4">
                {selectedMatch?.location_city}
              </Text>

              {selectedMatch?.bio && (
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-slate-700 mb-2">About</Text>
                  <Text className="text-slate-600 leading-relaxed">{selectedMatch.bio}</Text>
                </View>
              )}

              {selectedMatch?.interests && selectedMatch.interests.length > 0 && (
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-slate-700 mb-3">Interests</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {selectedMatch.interests.map((interest: string, idx: number) => (
                      <View key={idx} className="bg-primary/10 px-3 py-2 rounded-full border border-primary/20">
                        <Text className="text-primary text-sm font-medium">{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

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
              className="flex-1 bg-primary rounded-full py-3 items-center"
              onPress={() => {
                setModalVisible(false);
                if (selectedMatch) handleLike(selectedMatch.id);
              }}
            >
              <Heart size={24} color="white" fill="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Action Menu Modal (Report/Block) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={actionMenuVisible}
        onRequestClose={() => setActionMenuVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setActionMenuVisible(false)}
        >
          <View className="bg-white rounded-t-3xl px-6 py-8">
            <Text className="text-lg font-bold text-slate-800 mb-4">Actions</Text>

            <TouchableOpacity
              className="flex-row items-center py-4 border-b border-slate-100"
              onPress={() => {
                setActionMenuVisible(false);
                setReportModalVisible(true);
              }}
            >
              <Flag size={22} color="#f59e0b" />
              <View className="ml-4 flex-1">
                <Text className="text-base font-semibold text-slate-800">Report User</Text>
                <Text className="text-sm text-slate-500">Flag objectionable content or behavior</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-4 border-b border-slate-100"
              onPress={() => {
                setActionMenuVisible(false);
                if (!selectedMatch) return;
                Alert.alert(
                  'Block User',
                  `Are you sure you want to block ${selectedMatch.first_name}? They will be removed from your feed immediately and our moderation team will be notified.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Block',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          await userService.blockUser(selectedMatch.id, 'Blocked from browse');
                          if (user?.id) {
                            await activityLoggerService.logBlock(user.id, selectedMatch.id, 'Blocked from browse');
                          }
                          Alert.alert('Blocked', `${selectedMatch.first_name} has been blocked and removed from your feed.`);
                          setModalVisible(false);
                          handleSwipeNext();
                        } catch (error: any) {
                          Alert.alert('Error', error.message || 'Failed to block user. Please try again.');
                        }
                      },
                    },
                  ]
                );
              }}
            >
              <ShieldOff size={22} color="#ef4444" />
              <View className="ml-4 flex-1">
                <Text className="text-base font-semibold text-red-600">Block User</Text>
                <Text className="text-sm text-slate-500">Remove from your feed and notify moderators</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 bg-slate-100 rounded-full py-3 items-center"
              onPress={() => setActionMenuVisible(false)}
            >
              <Text className="text-slate-600 font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Report Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl px-6 py-8 max-h-[80%]">
            <Text className="text-xl font-bold text-slate-800 mb-2">Report {selectedMatch?.first_name}</Text>
            <Text className="text-sm text-slate-500 mb-6">Select a reason for your report. Our team will review it within 24 hours.</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { key: 'inappropriate_content', label: 'Inappropriate Content', desc: 'Sexually explicit or offensive material' },
                { key: 'harassment', label: 'Harassment or Bullying', desc: 'Threatening or abusive behavior' },
                { key: 'fake_profile', label: 'Fake Profile', desc: 'Impersonation or misleading information' },
                { key: 'spam', label: 'Spam or Scam', desc: 'Unsolicited or fraudulent activity' },
                { key: 'hate_speech', label: 'Hate Speech', desc: 'Discriminatory or hateful content' },
                { key: 'other', label: 'Other', desc: 'Another reason not listed above' },
              ].map((reason) => (
                <TouchableOpacity
                  key={reason.key}
                  className={`py-4 px-4 border rounded-xl mb-3 ${
                    selectedReportReason === reason.key
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200'
                  }`}
                  onPress={() => setSelectedReportReason(reason.key)}
                >
                  <Text className={`text-base font-semibold ${
                    selectedReportReason === reason.key ? 'text-primary' : 'text-slate-800'
                  }`}>{reason.label}</Text>
                  <Text className="text-sm text-slate-500">{reason.desc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                className="flex-1 bg-slate-100 rounded-full py-3 items-center"
                onPress={() => {
                  setReportModalVisible(false);
                  setSelectedReportReason(null);
                }}
              >
                <Text className="text-slate-600 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 rounded-full py-3 items-center ${selectedReportReason ? 'bg-red-500' : 'bg-slate-300'}`}
                disabled={!selectedReportReason}
                onPress={async () => {
                  if (!selectedMatch || !selectedReportReason) return;
                  try {
                    await userService.reportUser(selectedMatch.id, selectedReportReason, `Reported from browse profile`);
                    if (user?.id) {
                      await activityLoggerService.logReport(user.id, selectedMatch.id, selectedReportReason, 'Reported from browse profile');
                    }
                    Alert.alert('Report Submitted', 'Thank you for helping keep The Well safe. Our team will review your report within 24 hours.');
                    setReportModalVisible(false);
                    setSelectedReportReason(null);
                  } catch (error: any) {
                    Alert.alert('Error', error.message || 'Failed to submit report. Please try again.');
                  }
                }}
              >
                <Text className="text-white font-semibold">Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Match Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={chatModalVisible}
        onRequestClose={() => setChatModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center">
          <Card className="border-slate-200 mx-6">
            <CardContent className="p-6">
              <Text className="text-2xl font-bold text-slate-800 mb-2 text-center">It's a Match!</Text>
              <Text className="text-slate-600 text-center mb-6">
                You and {selectedMatch?.first_name} liked each other. Start chatting now!
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 border border-slate-300 rounded-full py-3"
                  onPress={() => setChatModalVisible(false)}
                >
                  <Text className="text-slate-800 font-semibold text-center">Later</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-primary rounded-full py-3"
                  onPress={handleChatNow}
                >
                  <Text className="text-white font-semibold text-center">Chat Now</Text>
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>
        </View>
      </Modal>
    </View>
  );
}