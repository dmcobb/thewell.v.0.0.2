import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Waves, BookOpen, Heart } from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import {
  devotionalService,
  type Devotional,
} from '@/lib/services/devotional.service';

export default function FaithTab() {
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDevotional = async () => {
    try {
      setLoading(true);
      const data = await devotionalService.getDailyDevotional();
      setDevotional(data);
    } catch (error) {
      console.error('[Anointed Innovations] Error loading devotional:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDevotional();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDevotional();
  }, []);

  return (
    <View className="flex-1 bg-linear-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ 
          paddingHorizontal: 24, 
          paddingTop: 20, 
          paddingBottom: 40 
        }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#8B5CF6" // Ensures visibility on iOS light backgrounds
          />
        }
      >
        <View className="gap-6">
          {/* Main Title Header */}
          <LinearGradient
            colors={['#0891B2', '#0284C7', '#0369A1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-[32px] overflow-hidden shadow-lg"
          >
            <View className="p-6">
              <View className="flex-row items-center gap-3 mb-2">
                <Waves size={28} color="white" />
                <Text className="text-2xl font-bold text-white tracking-tight">
                  Daily Tides of Faith
                </Text>
              </View>
              <Text className="text-sm text-white/80 font-medium">
                Let His peace wash over your journey
              </Text>
            </View>
          </LinearGradient>

          {loading && !devotional ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text className="text-slate-500 mt-4 font-medium">Preparing your daily bread...</Text>
            </View>
          ) : devotional ? (
            <>
              {/* Scripture & Reflection Card */}
              <Card className="shadow-md bg-white border-0 rounded-[32px] overflow-hidden">
                <CardHeader className="pb-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <BookOpen size={20} color="#8B5CF6" />
                      <CardTitle className="text-purple-600 font-bold">
                        Today's Gentle Word
                      </CardTitle>
                    </View>
                    <Badge variant="outline" className="border-purple-100 bg-purple-50">
                       <Text className="text-[10px] text-purple-600 font-bold">
                        {devotional.date}
                      </Text>
                    </Badge>
                  </View>
                </CardHeader>
                <CardContent className="p-6">
                  <View className="bg-ocean-50/50 p-6 rounded-2xl border border-ocean-100 mb-6">
                    <Text className="text-lg italic text-slate-800 leading-relaxed text-center">
                      "{devotional.text}"
                    </Text>
                    <View className="h-px bg-ocean-200 w-12 self-center my-3" />
                    <Text className="text-xs text-center text-slate-500 font-bold uppercase tracking-widest">
                      {devotional.reference}
                    </Text>
                  </View>
                  
                  <Text className="text-[15px] text-slate-600 leading-6 font-medium">
                    {devotional.reflection}
                  </Text>
                </CardContent>
              </Card>

              {/* Prayer Card */}
              <Card className="shadow-md bg-white border-0 rounded-[32px] overflow-hidden mb-8">
                <CardHeader>
                  <View className="flex-row items-center gap-2">
                    <Heart size={20} color="#8B5CF6" fill="#8B5CF6" />
                    <CardTitle className="text-purple-600 font-bold">
                      Prayer for Love's Journey
                    </CardTitle>
                  </View>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <View className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                    <Text className="text-[14px] italic leading-6 text-purple-700 font-medium">
                      "{devotional.prayer}"
                    </Text>
                  </View>
                </CardContent>
              </Card>
            </>
          ) : (
            <View className="py-12 items-center">
              <Text className="text-slate-400">Unable to load devotional. Pull down to refresh.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}