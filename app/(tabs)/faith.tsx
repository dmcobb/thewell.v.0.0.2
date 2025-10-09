import { View, Text, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Image } from "expo-image"
import { Bell, Settings, Waves, BookOpen, Heart } from "lucide-react-native"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FaithTab() {
  return (
    <View className="flex-1 bg-gradient-to-b from-ocean-100 via-ocean-50 via-purple-50 to-ocean-100">
      {/* Header with Logo */}
      <LinearGradient
        colors={["#0891B2", "#0284C7", "#8B5CF6", "#0369A1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <View className="px-4 pt-12 pb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-lg overflow-hidden shadow-lg bg-white">
                <Image
                  source={require("../../assets/icon.png")}
                  className="w-full h-full"
                  contentFit="cover"
                  priority="high"
                />
              </View>
              <View>
                <Text className="text-xl font-bold text-white">The Well</Text>
                <Text className="text-purple-100 text-xs">Christian Dating</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-3">
              <Bell size={20} color="white" opacity={0.9} />
              <Settings size={20} color="white" opacity={0.9} />
            </View>
          </View>
          <Text className="text-purple-100 text-sm mt-2">Where Hearts Flow Together</Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-6">
        <View className="gap-6">
          <LinearGradient
            colors={["#0891B2", "#0284C7", "#0369A1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-xl overflow-hidden shadow-xl"
          >
            <View className="p-4">
              <View className="flex-row items-center gap-2 mb-1">
                <Waves size={24} color="white" />
                <Text className="text-xl font-bold text-white">Daily Tides of Faith</Text>
              </View>
              <Text className="text-sm text-white/90">Let His peace wash over your journey</Text>
            </View>
          </LinearGradient>

          <Card className="shadow-lg bg-white/95">
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <BookOpen size={20} color="#8B5CF6" />
                <CardTitle className="text-purple-500">Today's Gentle Word</CardTitle>
              </View>
              <Text className="text-xs text-slate-500">Tuesday, July 30</Text>
            </CardHeader>
            <CardContent>
              <View className="bg-gradient-to-r from-ocean-50 to-ocean-100 p-4 rounded-xl border border-purple-200/50 mb-4">
                <Text className="text-base italic text-purple-500 leading-relaxed text-center">
                  "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your
                  hearts be troubled and do not be afraid."
                </Text>
                <Text className="text-xs text-center text-slate-600 mt-2">- John 14:27</Text>
              </View>
              <Text className="text-sm text-slate-600 leading-relaxed">
                Like gentle waves upon the shore, let God's peace flow through your heart as you seek love. Trust in His
                perfect timing and rest in His endless grace.
              </Text>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white/95">
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <Heart size={20} color="#8B5CF6" />
                <CardTitle className="text-purple-500">Prayer for Love's Journey</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <View className="bg-gradient-to-r from-ocean-100 to-ocean-50 p-4 rounded-xl border border-purple-200/50">
                <Text className="text-sm italic leading-relaxed text-purple-500">
                  "Heavenly Father, as the ocean meets the shore in perfect rhythm, guide my heart to find the one
                  You've prepared for me. Let Your love flow through me like gentle tides, bringing peace to my waiting
                  and wisdom to my choices. In Your perfect timing, may two hearts become one in Your grace. Amen."
                </Text>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </View>
  )
}
