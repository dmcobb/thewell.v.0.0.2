import { View, Text, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Image } from "expo-image"
import { Bell, Settings, Sparkles, Brain, MessageCircle, Heart, Waves } from "lucide-react-native"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { VideoPlayer } from "@/components/video-player"

export default function AIMatchTab() {
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
                <Brain size={24} color="white" />
                <Text className="text-xl font-bold text-white">Soul Compass AI</Text>
              </View>
              <Text className="text-sm text-white/90">Guided by faith, powered by understanding</Text>
            </View>
          </LinearGradient>

          <Card className="shadow-lg bg-white/95">
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <Sparkles size={20} color="#8B5CF6" />
                <CardTitle className="text-purple-500">Divine Connection</CardTitle>
              </View>
              <Text className="text-sm text-slate-600">A heart that resonates with yours</Text>
            </CardHeader>
            <CardContent className="gap-4">
              <View className="flex-row items-center gap-3 mb-3">
                <Avatar className="ring-2 ring-purple-200/50">
                  <AvatarImage source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" }} />
                  <AvatarFallback className="bg-gradient-to-br from-ocean-400 to-primary">
                    <Text className="text-white text-lg font-semibold">M</Text>
                  </AvatarFallback>
                </Avatar>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-semibold text-base text-slate-800">Michael, 32</Text>
                    <Badge className="bg-gradient-to-r from-ocean-50 to-ocean-100 border-purple-200">
                      <Text className="text-xs text-purple-500">94% harmony</Text>
                    </Badge>
                  </View>
                  <Text className="text-sm text-slate-600">Presbyterian • 5 miles away</Text>
                </View>
              </View>

              <View className="aspect-video rounded-xl overflow-hidden shadow-md">
                <VideoPlayer
                  videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  poster="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
                  className="h-full"
                />
              </View>

              <View className="bg-gradient-to-r from-ocean-50 to-ocean-100 p-4 rounded-xl border border-purple-200/50">
                <Text className="text-sm text-purple-500 font-medium mb-2">Soul Resonance Analysis</Text>
                <Text className="text-xs text-slate-600 leading-relaxed">
                  Your hearts beat in harmony through shared faith values, complementary life goals, and a mutual love
                  for worship and service.
                </Text>
              </View>

              <View className="flex-row gap-3">
                <Button variant="outline" className="flex-1 h-10 bg-white">
                  <View className="flex-row items-center gap-2">
                    <MessageCircle size={16} color="#8B5CF6" />
                    <Text className="text-purple-500 font-medium">Connect</Text>
                  </View>
                </Button>
                <Button className="flex-1 h-10">
                  <View className="flex-row items-center gap-2">
                    <Heart size={16} color="white" />
                    <Text className="text-white font-medium">Like</Text>
                  </View>
                </Button>
              </View>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white/95">
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <Waves size={20} color="#8B5CF6" />
                <CardTitle className="text-purple-500">Harmony Levels</CardTitle>
              </View>
            </CardHeader>
            <CardContent className="gap-4">
              <View className="items-center">
                <Text className="text-3xl font-bold text-purple-500 mb-2">92%</Text>
                <Text className="text-sm text-slate-600">Deep Connection</Text>
              </View>

              <View className="gap-4">
                <View className="bg-gradient-to-r from-ocean-50 to-ocean-100 p-3 rounded-xl">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm text-slate-600">Faith Foundation</Text>
                    <Text className="text-sm text-purple-500 font-medium">95%</Text>
                  </View>
                  <Progress value={95} className="h-2 bg-white/50" />
                </View>

                <View className="bg-gradient-to-r from-ocean-100 to-ocean-50 p-3 rounded-xl">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm text-slate-600">Life Vision</Text>
                    <Text className="text-sm text-purple-500 font-medium">88%</Text>
                  </View>
                  <Progress value={88} className="h-2 bg-white/50" />
                </View>

                <View className="bg-gradient-to-r from-ocean-50 to-ocean-100 p-3 rounded-xl">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm text-slate-600">Heart Interests</Text>
                    <Text className="text-sm text-purple-500 font-medium">93%</Text>
                  </View>
                  <Progress value={93} className="h-2 bg-white/50" />
                </View>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </View>
  )
}
