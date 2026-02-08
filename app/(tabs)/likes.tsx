import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import {
  Bell,
  Settings,
  Heart,
  Trash2,
  AlertCircle,
} from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { matchService, type LikedUser } from '@/lib/services/match.service';

export default function LikesTab() {
  const [likedUsers, setLikedUsers] = useState<LikedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unlikingId, setUnlikingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLikedUsers();
  }, []);

  const fetchLikedUsers = async () => {
    try {
      setLoading(true);
      const response = await matchService.getLikedUsers();
      setLikedUsers(response);
    } catch (error) {
      console.error(
        '[Anointed Innovations] Error fetching liked users:',
        error,
      );
      Alert.alert('Error', 'Failed to load your likes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLikedUsers();
    setRefreshing(false);
  };

  const handleUnlike = (user: LikedUser) => {
    Alert.alert(
      'Unlike User',
      `Remove your like for ${user.first_name}? You can always like them again later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlike',
          style: 'destructive',
          onPress: async () => {
            try {
              setUnlikingId(user.id);
              await matchService.unlikeUser(user.id);
              setLikedUsers(likedUsers.filter((u) => u.id !== user.id));
              Alert.alert(
                'Success',
                `Your like for ${user.first_name} has been removed.`,
              );
            } catch (error) {
              console.error(
                '[Anointed Innovations] Error unliking user:',
                error,
              );
              Alert.alert('Error', 'Failed to unlike user. Please try again.');
            } finally {
              setUnlikingId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-ocean-100 via-ocean-50 to-ocean-100">
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
                <Heart size={20} color="#8B5CF6" />
                <CardTitle className="text-purple-500">Your Likes</CardTitle>
              </View>
              <Text className="text-sm text-slate-600">
                People who have captured your heart
              </Text>
            </CardHeader>
          </Card>

          {loading ? (
            <View className="items-center justify-center py-10">
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text className="text-slate-600 mt-4">Loading your likes...</Text>
            </View>
          ) : likedUsers.length === 0 ? (
            <Card className="shadow-lg bg-white/95">
              <CardContent className="p-6 items-center gap-3">
                <Heart size={48} color="#8B5CF6" opacity={0.5} />
                <Text className="text-lg font-semibold text-slate-800 text-center">
                  No likes yet
                </Text>
                <Text className="text-sm text-slate-600 text-center">
                  Start exploring in the Discover tab to express your interest
                  in others
                </Text>
              </CardContent>
            </Card>
          ) : (
            <View className="gap-4">
              {likedUsers.map((user) => (
                <Card
                  key={user.id}
                  className="shadow-lg bg-white/95 overflow-hidden"
                >
                  <CardContent className="p-4">
                    <View className="gap-3">
                      {/* User Info Header */}
                      <View className="flex-row items-center gap-3">
                        <Avatar className="ring-2 ring-purple-200/50">
                          {!!user.primary_photo && (
                            <AvatarImage source={{ uri: user.primary_photo }} />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-ocean-400 to-primary">
                            <Text className="text-white text-lg font-semibold">
                              {user.first_name?.[0] || '?'}
                            </Text>
                          </AvatarFallback>
                        </Avatar>

                        <View className="flex-1">
                          <View className="flex-row items-center gap-2 mb-1">
                            <Text className="font-semibold text-base text-slate-800">
                              {user.first_name} {user.last_name}
                            </Text>
                            {/* Force match_score to boolean to avoid rendering '0' */}
                            {!!user.match_score && (
                              <Badge className="bg-gradient-to-r from-ocean-50 to-ocean-100 border-purple-200">
                                <Text className="text-xs text-purple-500">
                                  {Math.round(user.match_score)}% harmony
                                </Text>
                              </Badge>
                            )}
                          </View>
                          <Text className="text-sm text-slate-600">
                            {user.location_city}
                          </Text>
                        </View>

                        <TouchableOpacity
                          disabled={unlikingId === user.id}
                          onPress={() => handleUnlike(user)}
                          className="h-10 w-10 rounded-lg items-center justify-center bg-red-50 border border-red-200"
                        >
                          {unlikingId === user.id ? (
                            <ActivityIndicator size="small" color="#DC2626" />
                          ) : (
                            <Trash2 size={16} color="#DC2626" />
                          )}
                        </TouchableOpacity>
                      </View>

                      {/* Bio Section */}
                      {!!user.bio && (
                        <View className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <Text className="text-sm text-slate-700 leading-relaxed">
                            {user.bio}
                          </Text>
                        </View>
                      )}

                      {/* Details Row */}
                      <View className="flex-row flex-wrap gap-2">
                        {!!user.denomination && (
                          <Badge variant="outline" className="bg-white">
                            <Text className="text-xs text-slate-600">
                              {user.denomination}
                            </Text>
                          </Badge>
                        )}
                        {!!user.occupation && (
                          <Badge variant="outline" className="bg-white">
                            <Text className="text-xs text-slate-600">
                              {user.occupation}
                            </Text>
                          </Badge>
                        )}
                        {/* Height calculation - strict null/undefined check */}
                        {user.height_cm != null && (
                          <Badge variant="outline" className="bg-white">
                            <Text className="text-xs text-slate-600">
                              {`${(user.height_cm / 30.48).toFixed(1)}'`}
                            </Text>
                          </Badge>
                        )}
                        {!!user.liked_at && (
                          <Badge
                            variant="outline"
                            className="bg-purple-50 border-purple-200"
                          >
                            <Text className="text-xs text-purple-600">
                              {`Liked ${new Date(user.liked_at).toLocaleDateString()}`}
                            </Text>
                          </Badge>
                        )}
                      </View>

                      {/* Info Box */}
                      <View className="flex-row gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <AlertCircle size={16} color="#3B82F6" />
                        <View className="flex-1">
                          <Text className="text-xs text-blue-700">
                            You can unlike at any time. They won't be notified
                            about this action.
                          </Text>
                        </View>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
