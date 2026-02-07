import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Bell, Settings, Waves, BookOpen, Heart } from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      console.error('Error loading devotional:', error);
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
    <View className="flex-1 bg-gradient-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      {/* Header in layout */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="gap-6">
          <LinearGradient
            colors={['#0891B2', '#0284C7', '#0369A1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-xl overflow-hidden shadow-xl"
          >
            <View className="p-4">
              <View className="flex-row items-center gap-2 mb-1">
                <Waves size={24} color="white" />
                <Text className="text-xl font-bold text-white">
                  Daily Tides of Faith
                </Text>
              </View>
              <Text className="text-sm text-white/90">
                Let His peace wash over your journey
              </Text>
            </View>
          </LinearGradient>

          {loading && !devotional ? (
            <Card className="shadow-lg bg-white/95">
              <CardContent>
                <Text className="text-center text-slate-500 py-8">
                  Loading today's devotional...
                </Text>
              </CardContent>
            </Card>
          ) : devotional ? (
            <>
              <Card className="shadow-lg bg-white/95">
                <CardHeader>
                  <View className="flex-row items-center gap-2">
                    <BookOpen size={20} color="#8B5CF6" />
                    <CardTitle className="text-purple-500">
                      Today's Gentle Word
                    </CardTitle>
                  </View>
                  <Text className="text-xs text-slate-500">
                    {devotional.date}
                  </Text>
                </CardHeader>
                <CardContent>
                  <View className="bg-gradient-to-r from-ocean-50 to-ocean-100 p-4 rounded-xl border border-purple-200/50 mb-4">
                    <Text className="text-base italic text-purple-500 leading-relaxed text-center">
                      "{devotional.text}"
                    </Text>
                    <Text className="text-xs text-center text-slate-600 mt-2">
                      - {devotional.reference}
                    </Text>
                  </View>
                  <Text className="text-sm text-slate-600 leading-relaxed">
                    {devotional.reflection}
                  </Text>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-white/95">
                <CardHeader>
                  <View className="flex-row items-center gap-2">
                    <Heart size={20} color="#8B5CF6" />
                    <CardTitle className="text-purple-500">
                      Prayer for Love's Journey
                    </CardTitle>
                  </View>
                </CardHeader>
                <CardContent>
                  <View className="bg-gradient-to-r from-ocean-100 to-ocean-50 p-4 rounded-xl border border-purple-200/50">
                    <Text className="text-sm italic leading-relaxed text-purple-500">
                      "{devotional.prayer}"
                    </Text>
                  </View>
                </CardContent>
              </Card>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
