import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Heart,
  Trash2,
  AlertCircle,
} from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { matchService, type LikedUser } from '@/lib/services/match.service';
import { activityLoggerService } from '@/lib/services/activity-logger.service';
import { useAuth } from '@/contexts/auth-context';

export default function LikesTab() {
  const { user } = useAuth();
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
      `Remove your like for ${user.first_name}?`,
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
              // Log activity
              if (user?.id) {
                await activityLoggerService.logActivity(user.id, 'unlike', {
                  target_user_id: user.id,
                  action: 'unlike',
                  user_id: user.id,
                });
              }
            } catch (error) {
              console.error('[Anointed Innovations] Error unliking user:', error);
              Alert.alert('Error', 'Failed to unlike user.');
            } finally {
              setUnlikingId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-linear-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      <ScrollView
        className="flex-1"
        // Using style for padding to ensure consistent behavior across ScrollView implementations
        contentContainerStyle={{ 
          paddingHorizontal: 24, 
          paddingTop: 16, 
          paddingBottom: 40 
        }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#8B5CF6" // Required for visibility on iOS light backgrounds
          />
        }
      >
        <View className="gap-6">
          <Card className="shadow-lg bg-white/95 border-0 rounded-3xl">
            <CardHeader className="pb-4">
              <View className="flex-row items-center gap-2">
                <Heart size={22} color="#8B5CF6" fill="#8B5CF6" />
                <CardTitle className="text-purple-600 font-bold text-xl">
                  Your Likes
                </CardTitle>
              </View>
              <Text className="text-sm text-slate-500 font-medium">
                People who have captured your heart
              </Text>
            </CardHeader>
          </Card>

          {loading && !refreshing ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text className="text-slate-500 font-medium mt-4">Loading your likes...</Text>
            </View>
          ) : likedUsers.length === 0 ? (
            <View className="py-20 items-center gap-4">
              <View className="w-20 h-20 bg-purple-50 rounded-full items-center justify-center">
                 <Heart size={40} color="#8B5CF6" opacity={0.3} />
              </View>
              <Text className="text-lg font-bold text-slate-800 text-center px-10">
                No likes yet
              </Text>
              <Text className="text-sm text-slate-500 text-center px-10 leading-5">
                Start exploring in the Discover tab to express your interest
                in others.
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {likedUsers.map((user) => (
                <Card
                  key={user.id}
                  className="shadow-md bg-white border-0 rounded-[24px] overflow-hidden"
                >
                  <CardContent className="p-5">
                    <View className="gap-4">
                      <View className="flex-row items-center gap-4">
                        <Avatar className="w-14 h-14 border border-purple-100">
                          {!!user.primary_photo ? (
                            <AvatarImage source={{ uri: user.primary_photo }} />
                          ) : (
                            <AvatarFallback className="bg-slate-200">
                              <Text className="text-slate-600 font-bold">
                                {user.first_name?.[0]}
                              </Text>
                            </AvatarFallback>
                          )}
                        </Avatar>

                        <View className="flex-1">
                          <Text className="font-bold text-lg text-slate-900">
                            {user.first_name} {user.last_name}
                          </Text>
                          <Text className="text-sm text-slate-500 font-medium">
                            {user.location_city}
                          </Text>
                        </View>

                        <TouchableOpacity
                          disabled={unlikingId === user.id}
                          onPress={() => handleUnlike(user)}
                          className="h-10 w-10 rounded-xl items-center justify-center bg-red-50"
                          activeOpacity={0.7}
                        >
                          {unlikingId === user.id ? (
                            <ActivityIndicator size="small" color="#DC2626" />
                          ) : (
                            <Trash2 size={18} color="#DC2626" />
                          )}
                        </TouchableOpacity>
                      </View>

                      {!!user.bio && (
                        <View className="p-4 bg-slate-50 rounded-2xl">
                          <Text className="text-[13px] text-slate-600 leading-5 italic">
                            "{user.bio}"
                          </Text>
                        </View>
                      )}

                      <View className="flex-row flex-wrap gap-2">
                        {!!user.match_score && (
                          <Badge className="bg-purple-600 border-0">
                            <Text className="text-[10px] font-bold text-white uppercase">
                              {Math.round(user.match_score)}% Harmony
                            </Text>
                          </Badge>
                        )}
                        {!!user.denomination && (
                          <Badge variant="outline" className="bg-white border-slate-200">
                            <Text className="text-[11px] text-slate-600 font-medium">
                              {user.denomination}
                            </Text>
                          </Badge>
                        )}
                      </View>

                      <View className="flex-row gap-2 items-center">
                        <AlertCircle size={14} color="#3B82F6" />
                        <Text className="text-[11px] text-blue-600 font-medium">
                          Private: They won't be notified if you unlike.
                        </Text>
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