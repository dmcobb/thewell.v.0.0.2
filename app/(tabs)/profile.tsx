import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Image } from "expo-image"
import { Bell, Settings, Play, Shield, LogOut } from "lucide-react-native"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { VideoPlayer } from "@/components/video-player"
import { useAuth } from "@/contexts/auth-context"
import { router } from "expo-router"

export default function ProfileTab() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout()
          router.push("/")
        },
      },
    ])
  }

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
              <TouchableOpacity onPress={handleLogout}>
                <LogOut size={20} color="white" opacity={0.9} />
              </TouchableOpacity>
            </View>
          </View>
          <Text className="text-purple-100 text-sm mt-2">Where Hearts Flow Together</Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-6">
        <View className="gap-6">
          <Card className="shadow-lg bg-white/95">
            <CardContent className="p-6 items-center">
              <Avatar className="w-24 h-24 mb-4 ring-4 ring-purple-200/30">
                <AvatarImage source={{ uri: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200" }} />
                <AvatarFallback className="bg-gradient-to-br from-ocean-400 to-primary">
                  <Text className="text-white text-2xl font-semibold">{user?.first_name?.[0] || "U"}</Text>
                </AvatarFallback>
              </Avatar>
              <Text className="text-xl font-semibold text-slate-800">
                {user?.first_name} {user?.last_name}
              </Text>
              <Text className="text-slate-600 mt-1">
                {user?.denomination} • {user?.age || "28"} years old
              </Text>
              <Badge className="mt-3 bg-gradient-to-r from-ocean-50 to-ocean-100 border-purple-200">
                <View className="flex-row items-center gap-1">
                  <Shield size={12} color="#8B5CF6" />
                  <Text className="text-xs text-purple-500 font-medium">
                    {user?.is_verified ? "Verified Soul" : "Unverified"}
                  </Text>
                </View>
              </Badge>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white/95">
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <Play size={20} color="#8B5CF6" />
                <CardTitle className="text-purple-500">Your Story Flows</CardTitle>
              </View>
              <Text className="text-sm text-slate-600">Share your heart in 60 seconds</Text>
            </CardHeader>
            <CardContent>
              <View className="aspect-video rounded-xl overflow-hidden mb-4 shadow-md">
                <VideoPlayer
                  videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  poster="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
                  className="h-full"
                />
              </View>
              <Button variant="outline" className="w-full h-12 bg-white">
                <Text className="text-purple-500 font-medium">Update Your Story</Text>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white/95">
            <CardHeader>
              <CardTitle className="text-purple-500">Trust & Verification</CardTitle>
              <Text className="text-sm text-slate-600">Build bridges of trust with others</Text>
            </CardHeader>
            <CardContent>
              <Button className="w-full h-12 mb-4">
                <Text className="text-white font-medium">Verify Your Heart</Text>
              </Button>
              <View className="gap-3">
                <Text className="font-semibold text-purple-500">Why Verify Your Journey?</Text>
                <View className="gap-3">
                  <View className="flex-row items-center gap-3 p-2 bg-gradient-to-r from-ocean-50 to-ocean-100 rounded-lg">
                    <View className="w-2 h-2 bg-ocean-400 rounded-full" />
                    <Text className="text-sm text-slate-600 flex-1">
                      Create deeper trust with potential connections
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3 p-2 bg-gradient-to-r from-ocean-100 to-ocean-50 rounded-lg">
                    <View className="w-2 h-2 bg-ocean-400 rounded-full" />
                    <Text className="text-sm text-slate-600 flex-1">Let your authentic self shine brighter</Text>
                  </View>
                  <View className="flex-row items-center gap-3 p-2 bg-gradient-to-r from-ocean-50 to-ocean-100 rounded-lg">
                    <View className="w-2 h-2 bg-ocean-400 rounded-full" />
                    <Text className="text-sm text-slate-600 flex-1">Navigate with confidence and peace</Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-white/95">
            <CardContent className="p-4">
              <Button variant="outline" className="w-full h-12 border-red-200 bg-red-50" onPress={handleLogout}>
                <View className="flex-row items-center gap-2">
                  <LogOut size={18} color="#DC2626" />
                  <Text className="text-red-600 font-medium">Logout</Text>
                </View>
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </View>
  )
}