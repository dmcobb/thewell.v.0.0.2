import {
  View,
  Text,
  ScrollView,
  Linking,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Mail, Sparkles } from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';

export default function EquallyYokedTab() {
  const handleEmailPress = () => {
    Linking.openURL('mailto:info@the-wellapp.com');
  };

  return (
    <View className="flex-1 bg-linear-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      <ScrollView
        className="flex-1"
        // Switched to style for better cross-platform consistency with flexGrow
        contentContainerStyle={{ 
          paddingHorizontal: 24, 
          paddingTop: 20, 
          paddingBottom: 40,
          flexGrow: 1,
          justifyContent: 'center' // This works safely with flexGrow: 1
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6">
          {/* Coming Soon Header */}
          <LinearGradient
            colors={['#0891B2', '#0284C7', '#0369A1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-[32px] overflow-hidden shadow-xl"
          >
            <View className="p-8 items-center">
              <View className="bg-white/20 p-4 rounded-full mb-4">
                <Heart size={32} color="white" fill="white" />
              </View>
              <Text className="text-2xl font-bold text-white text-center tracking-tight">
                Equally Yoked
              </Text>
              <View className="flex-row items-center gap-2 mt-2 bg-black/10 px-3 py-1 rounded-full">
                <Sparkles size={14} color="white" />
                <Text className="text-xs font-bold text-white uppercase tracking-widest">
                  Coming Soon
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Main Message Card */}
          <Card className="shadow-md bg-white border-0 rounded-[32px] overflow-hidden">
            <CardContent className="p-8">
              <View className="gap-5">
                <Text className="text-lg font-bold text-slate-900 leading-tight">
                  Crafting a spiritual guide for your journey
                </Text>
                
                <Text className="text-[15px] text-slate-600 leading-6">
                  The Well App team is working diligently to bring you a thoughtful 
                  guide on what it truly looks like to be equally yoked in faith and love.
                </Text>

                <View className="bg-ocean-50/50 p-5 rounded-3xl border border-ocean-100">
                  <Text className="text-sm text-ocean-700 leading-relaxed font-medium">
                    Discover deeper spiritual foundations for meaningful Christian 
                    relationships and what harmony in faith truly means.
                  </Text>
                </View>

                <Text className="text-sm text-slate-500 italic leading-relaxed">
                  "Do not be yoked together with unbelievers. For what do righteousness 
                  and wickedness have in common?" — 2 Corinthians 6:14
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card className="shadow-sm bg-purple-50/50 border border-purple-100 rounded-[32px]">
            <CardContent className="p-6">
              <Text className="text-center text-sm font-bold text-purple-900 mb-4">
                Have thoughts or questions?
              </Text>
              <TouchableOpacity
                onPress={handleEmailPress}
                className="flex-row items-center justify-center gap-2 bg-ocean-600 rounded-2xl p-4 shadow-sm"
                activeOpacity={0.8}
              >
                <Mail size={18} color="white" />
                <Text className="text-white font-bold text-base">Get in Touch</Text>
              </TouchableOpacity>
              <Text className="text-center text-[11px] text-slate-500 mt-4">
                Reach out to our founders at{' '}
                <Text className="font-bold text-ocean-600">
                  info@the-wellapp.com
                </Text>
              </Text>
            </CardContent>
          </Card>

          {/* Encouragement Footer */}
          <View className="items-center px-6">
            <Text className="text-[11px] text-slate-400 text-center font-medium leading-4">
              Thank you for your patience as we build the perfect tools for your
              faith-centered journey.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}