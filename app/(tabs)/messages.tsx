import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, ChevronRight } from 'lucide-react-native';
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
      if (!refreshing) setLoading(true);
      const response = await matchService.getMatches();
      setMatches(response);
    } catch (error) {
      console.error('[Anointed Innovations] Error fetching matches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const handleChatPress = (matchId: string) => {
    if (!matchId) return;
    router.push(`/chat/${matchId}`);
  };

  const renderMatchItem = ({ item }: { item: Match }) => (
    <TouchableOpacity 
      onPress={() => handleChatPress(item.match_id)}
      activeOpacity={0.7}
      className="px-6" // Padding moved here to keep list scrollbar at the edge
    >
      <Card className="shadow-sm bg-white border-0 rounded-2xl mb-3 overflow-hidden">
        <CardContent className="p-4">
          <View className="flex-row items-center gap-4">
            <Avatar className="w-12 h-12">
              {item.primary_photo ? (
                <AvatarImage source={{ uri: item.primary_photo }} />
              ) : null}
              <AvatarFallback className="bg-linear-to-br from-ocean-400 to-primary">
                <Text className="text-white font-bold">
                  {item.first_name?.[0] || '?'}
                </Text>
              </AvatarFallback>
            </Avatar>
            <View className="flex-1">
              <Text className="font-bold text-slate-900">
                {item.first_name} {item.last_name}
              </Text>
              <Text className="text-xs text-slate-500">
                {item.location_city}
              </Text>
            </View>
            <ChevronRight size={16} color="#CBD5E1" />
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-linear-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      {/* Fixed Header */}
      <LinearGradient
        colors={['#0891B2', '#0284C7', '#0369A1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View className="px-6 py-4">
          <Text className="text-xl font-bold text-white">Messages</Text>
          <Text className="text-cyan-50 text-xs opacity-80">
            Your meaningful connections
          </Text>
        </View>
      </LinearGradient>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.match_id}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor="#8B5CF6" 
            />
          }
          ListEmptyComponent={
            <View className="px-6 items-center mt-10">
              <Card className="w-full shadow-sm bg-white border-0 rounded-[32px] p-10 items-center">
                <MessageCircle size={40} color="#94a3b8" />
                <Text className="text-slate-800 font-bold mt-4">No messages yet</Text>
                <Text className="text-slate-500 text-center mt-2 text-sm">
                  Your matches will appear here once you both connect.
                </Text>
              </Card>
            </View>
          }
        />
      )}
    </View>
  );
}