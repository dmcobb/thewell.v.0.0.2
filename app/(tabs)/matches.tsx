import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Image } from "expo-image"
import { Bell, Settings, Heart, MessageCircle, Play, Waves } from "lucide-react-native"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function MatchesTab() {
  const matches = [
    {
      name: "David",
      age: 30,
      church: "Methodist",
      distance: "3 miles",
      image: "D",
      compatibility: 89,
      hasVideo: true,
    },
    {
      name: "Michael",
      age: 32,
      church: "Presbyterian",
      distance: "5 miles",
      image: "M",
      compatibility: 94,
      hasVideo: true,
    },
  ]

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
          <Card className="shadow-lg bg-white/95">
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <Waves size={20} color="#8B5CF6" />
                <CardTitle className="text-purple-500">Flowing Conversations</CardTitle>
              </View>
              <Text className="text-sm text-slate-600">Gentle ways to connect hearts</Text>
            </CardHeader>
            <CardContent className="gap-3">
              <View className="p-4 bg-gradient-to-r from-ocean-50 to-ocean-100 rounded-xl border border-purple-200/50">
                <Text className="text-sm font-medium text-purple-500">
                  "What brings you the deepest peace in your quiet moments with God?"
                </Text>
              </View>
            </CardContent>
          </Card>

          <View className="gap-4">
            <View className="flex-row items-center gap-2">
              <Heart size={20} color="#8B5CF6" />
              <Text className="text-lg font-semibold text-purple-500">Your Connections</Text>
            </View>
            {matches.map((match, index) => (
              <Card key={index} className="shadow-lg bg-white/95">
                <CardContent className="p-4">
                  <View className="flex-row items-center gap-4">
                    <View className="relative">
                      <Avatar className="ring-2 ring-purple-200/50">
                        <AvatarFallback className="bg-gradient-to-br from-ocean-400 to-primary">
                          <Text className="text-white text-lg font-semibold">{match.image}</Text>
                        </AvatarFallback>
                      </Avatar>
                      {match.hasVideo && (
                        <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-primary to-primary-light rounded-full items-center justify-center shadow-md">
                          <Play size={10} color="white" />
                        </View>
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="font-semibold text-base text-slate-800">
                          {match.name}, {match.age}
                        </Text>
                        <Badge className="bg-gradient-to-r from-ocean-50 to-ocean-100 border-purple-200">
                          <Text className="text-xs text-purple-500">{match.compatibility}% harmony</Text>
                        </Badge>
                      </View>
                      <Text className="text-sm text-slate-600">
                        {match.church} • {match.distance}
                      </Text>
                      {match.hasVideo && <Text className="text-xs text-purple-500 mt-1">Shared their story</Text>}
                    </View>
                    <TouchableOpacity className="h-10 w-10 bg-gradient-to-r from-primary to-primary-light rounded-lg items-center justify-center shadow-md">
                      <MessageCircle size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
