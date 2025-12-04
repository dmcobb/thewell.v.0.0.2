import { View, Text, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Image } from "expo-image"
import { Bell, Settings, Play, Shield, Sparkles, Heart, MessageCircle } from "lucide-react-native"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VideoPlayer } from "@/components/video-player"

export default function DiscoverTab() {
  return (
    <View className="flex-1 bg-gradient-to-b from-ocean-100 via-ocean-50 to-ocean-100">
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

      {/* Main Content - Scrollable */}
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-6">
        <View className="gap-6">
          {/* Welcome Card */}
          <Card className="shadow-lg bg-white/95">
            <CardContent className="p-4">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-12 h-12 rounded-xl overflow-hidden shadow-lg">
                  <Image source={require("../../assets/icon.png")} className="w-full h-full" contentFit="cover" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-slate-800">Welcome to The Well</Text>
                  <Text className="text-sm text-slate-600">Where faithful hearts find their home</Text>
                </View>
              </View>
              <Text className="text-sm text-slate-600 leading-relaxed">
                Discover meaningful connections rooted in faith, guided by love, and blessed by God's perfect timing.
              </Text>
            </CardContent>
          </Card>

          {/* AI Matchmaker Teaser */}
          <Card className="shadow-lg bg-white/95">
            <CardContent className="p-4">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-full items-center justify-center shadow-lg">
                  <Sparkles size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-slate-800">AI Matchmaker</Text>
                  <Text className="text-sm text-slate-600">3 new soul connections found</Text>
                </View>
                <Button size="sm">
                  <Text className="text-white font-medium">Explore</Text>
                </Button>
              </View>
            </CardContent>
          </Card>

          {/* Main Profile Card */}
          <Card className="overflow-hidden shadow-xl bg-white/95">
            <View className="relative h-72">
              <VideoPlayer
                videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                poster="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
                className="h-full"
              />
              <View className="absolute top-4 left-4">
                <Badge className="bg-gradient-to-r from-primary to-primary-light">
                  <View className="flex-row items-center gap-1">
                    <Play size={12} color="white" />
                    <Text className="text-white text-xs font-medium">Video Story</Text>
                  </View>
                </Badge>
              </View>
              <View className="absolute top-4 right-4 flex-row gap-2">
                <Badge variant="secondary" className="bg-white/90 border-purple-200">
                  <View className="flex-row items-center gap-1">
                    <Shield size={12} color="#0891B2" />
                    <Text className="text-primary text-xs font-medium">Verified</Text>
                  </View>
                </Badge>
                <Badge className="bg-gradient-to-r from-ocean-400 to-ocean-300">
                  <View className="flex-row items-center gap-1">
                    <Sparkles size={12} color="white" />
                    <Text className="text-white text-xs font-medium">Soul Match</Text>
                  </View>
                </Badge>
              </View>
            </View>
            <CardContent className="p-6 bg-gradient-to-b from-white to-slate-50">
              <View className="flex-row items-center gap-3 mb-4">
                <Text className="text-2xl font-semibold text-slate-800">Sarah, 28</Text>
                <Badge variant="outline" className="border-purple-200 bg-purple-50">
                  <Text className="text-xs text-purple-500">Baptist</Text>
                </Badge>
              </View>
              <Text className="text-sm text-slate-600 mb-4 leading-relaxed">
                "A gentle soul seeking God's plan for love. I find peace in worship, joy in nature's beauty, and purpose
                in serving others."
              </Text>
              <View className="gap-4">
                <View className="bg-gradient-to-r from-ocean-50 to-ocean-100 p-3 rounded-xl border border-purple-200/50">
                  <Text className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                    Favorite Verse
                  </Text>
                  <Text className="text-sm font-medium text-slate-800">
                    "Be still and know that I am God" - Psalm 46:10
                  </Text>
                </View>
                <View>
                  <Text className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Interests</Text>
                  <View className="flex-row flex-wrap gap-2">
                    <Badge variant="outline" className="border-purple-200 bg-purple-50">
                      <Text className="text-xs text-purple-500">Ocean Walks</Text>
                    </Badge>
                    <Badge variant="outline" className="border-purple-200 bg-purple-50">
                      <Text className="text-xs text-purple-500">Worship Music</Text>
                    </Badge>
                    <Badge variant="outline" className="border-purple-200 bg-purple-50">
                      <Text className="text-xs text-purple-500">Volunteering</Text>
                    </Badge>
                    <Badge variant="outline" className="border-purple-200 bg-purple-50">
                      <Text className="text-xs text-purple-500">Meditation</Text>
                    </Badge>
                  </View>
                </View>
              </View>
              <View className="flex-row gap-3 mt-6">
                <Button variant="outline" className="flex-1 h-12 bg-white">
                  <View className="flex-row items-center gap-2">
                    <MessageCircle size={16} color="#8B5CF6" />
                    <Text className="text-purple-500 font-medium">Connect</Text>
                  </View>
                </Button>
                <Button className="flex-1 h-12">
                  <View className="flex-row items-center gap-2">
                    <Heart size={16} color="white" />
                    <Text className="text-white font-medium">Like</Text>
                  </View>
                </Button>
              </View>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="shadow-lg bg-gradient-to-br from-ocean-50 via-white to-ocean-100">
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <Heart size={20} color="#8B5CF6" />
                <CardTitle>Begin Your Journey</CardTitle>
              </View>
            </CardHeader>
            <CardContent>
              <Text className="text-sm text-slate-600 mb-4 leading-relaxed">
                Let your authentic self shine through and discover meaningful connections that honor God
              </Text>
              <Button variant="outline" className="w-full h-12 bg-white">
                <Text className="text-purple-500 font-medium">Complete Your Story</Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </View>
  )
}
