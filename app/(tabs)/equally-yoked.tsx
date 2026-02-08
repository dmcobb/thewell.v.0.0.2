import {
  View,
  Text,
  ScrollView,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Bell, Settings, Heart, Mail } from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';

export default function EquallyYokedTab() {
  const handleEmailPress = () => {
    Linking.openURL('mailto:info@the-wellapp.com');
  };

  return (
    <View className="flex-1 bg-linear-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-6 flex-grow justify-center"
      >
        <View className="gap-6">
          {/* Coming Soon Header */}
          <LinearGradient
            colors={['#0891B2', '#0284C7', '#0369A1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-xl overflow-hidden shadow-xl"
          >
            <View className="p-6 items-center">
              <Heart size={32} color="white" strokeWidth={1.5} />
              <Text className="text-2xl font-bold text-white text-center mt-3">
                Equally Yoked
              </Text>
              <Text className="text-sm text-white/90 text-center mt-1">
                Coming Soon
              </Text>
            </View>
          </LinearGradient>

          {/* Main Message Card */}
          <Card className="shadow-lg bg-white/95">
            <CardContent className="p-6">
              <View className="gap-4">
                <Text className="text-base text-slate-700 leading-relaxed">
                  We're crafting something special for you! The Well App team is
                  working diligently to bring you a thoughtful guide on what it
                  truly feels and looks like to be equally yoked in faith and
                  love.
                </Text>

                <View className="bg-linear-to-r from-ocean-50 to-ocean-100 p-4 rounded-xl border border-purple-200/50">
                  <Text className="text-sm text-slate-600 leading-relaxed">
                    This feature will help you understand the deeper spiritual
                    foundations for meaningful Christian relationships and what
                    harmony in faith truly means.
                  </Text>
                </View>

                <Text className="text-sm text-slate-600 leading-relaxed">
                  We believe this tool will enrich your journey toward finding a
                  partner who shares your spiritual values and commitment to
                  Christ.
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card className="shadow-lg bg-linear-to-br from-purple-50 to-ocean-50 border border-purple-200/50">
            <CardContent className="p-6">
              <Text className="text-center text-sm font-semibold text-slate-700 mb-3">
                Have thoughts or questions?
              </Text>
              <TouchableOpacity
                onPress={handleEmailPress}
                className="flex-row items-center justify-center gap-2 bg-linear-to-r from-ocean-400 to-ocean-500 rounded-lg p-3"
              >
                <Mail size={18} color="white" />
                <Text className="text-white font-semibold">Contact Us</Text>
              </TouchableOpacity>
              <Text className="text-center text-xs text-slate-600 mt-3">
                Reach out to us at{' '}
                <Text className="font-semibold text-ocean-600">
                  info@the-wellapp.com
                </Text>
              </Text>
            </CardContent>
          </Card>

          {/* Encouragement Footer */}
          <View className="items-center">
            <Text className="text-xs text-slate-500 text-center italic">
              Thank you for your patience as we build the perfect tools for your
              faith-centered journey.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
