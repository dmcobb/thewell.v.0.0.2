import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, X } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { matchService, type Match } from '@/lib/services/match.service';
import { LinearGradient } from 'expo-linear-gradient';

export default function MessagesScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

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

  const handleChatPress = (matchId: string) => {
    router.push(`/chat/${matchId}`);
  };

  const renderMatchItem = ({ item }: { item: Match }) => (
    <TouchableOpacity onPress={() => handleChatPress(item.matched_user_id)}>
      <Card className="shadow-lg bg-white/95 mb-3">
        <CardContent className="p-4">
          <View className="flex-row items-center gap-4">
            <Avatar className="ring-2 ring-purple-200/50">
              {item.primary_photo ? (
                <AvatarImage source={{ uri: item.primary_photo }} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-ocean-400 to-primary">
                <Text className="text-white text-lg font-semibold">
                  {item.first_name?.[0] || '?'}
                </Text>
              </AvatarFallback>
            </Avatar>
            <View className="flex-1">
              <Text className="font-semibold text-base text-slate-800">
                {item.first_name} {item.last_name}
              </Text>
              <Text className="text-sm text-slate-600">
                {item.location_city}
              </Text>
              {item.last_message_at && (
                <Text className="text-xs text-slate-500 mt-1">
                  {new Date(item.last_message_at).toLocaleDateString()}
                </Text>
              )}
            </View>
            <View className="bg-gradient-to-r from-primary to-primary-light rounded-lg p-2">
              <MessageCircle size={20} color="white" />
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gradient-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      <LinearGradient
        colors={['#0891B2', '#0284C7', '#8B5CF6', '#0369A1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <View className="px-4 pt-4 pb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">Messages</Text>
              <Text className="text-purple-100 text-xs">
                Stay connected with your matches
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-6">
        {loading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#0891B2" />
            <Text className="text-slate-600 mt-4">
              Loading your messages...
            </Text>
          </View>
        ) : matches.length === 0 ? (
          <Card className="shadow-lg bg-white/95">
            <CardContent className="p-6 items-center">
              <MessageCircle size={48} color="#94a3b8" />
              <Text className="text-slate-800 font-semibold text-lg mt-4">
                No messages yet
              </Text>
              <Text className="text-slate-600 text-center mt-2">
                Once you match with someone, you can start messaging them here
              </Text>
            </CardContent>
          </Card>
        ) : (
          <FlatList
            data={matches}
            renderItem={renderMatchItem}
            keyExtractor={(item) => item.id || item.matched_user_id}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </View>
  );
}
