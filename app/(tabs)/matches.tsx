import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native"
import { Heart, MessageCircle, Play, Waves } from "lucide-react-native"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { matchService } from "@/lib/services/match.service"

export default function MatchesTab() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await matchService.getMatches()
      setMatches(response)
    } catch (error) {
      console.error("[Anointed Innovations] Error fetching matches:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchMatches()
    setRefreshing(false)
  }

  return (
    <View className="flex-1 bg-gradient-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      {/* Header in layout */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
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

            {loading ? (
              <View className="items-center justify-center py-10">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="text-slate-600 mt-4">Loading your connections...</Text>
              </View>
            ) : matches.length === 0 ? (
              <Card className="shadow-lg bg-white/95">
                <CardContent className="p-6 items-center">
                  <Heart size={48} color="#8B5CF6" />
                  <Text className="text-lg font-semibold text-slate-800 mt-4 text-center">No matches yet</Text>
                  <Text className="text-sm text-slate-600 mt-2 text-center">
                    Keep exploring the Discover tab to find your divine connection
                  </Text>
                </CardContent>
              </Card>
            ) : (
              matches.map((match, index) => (
                <Card key={match.id || index} className="shadow-lg bg-white/95">
                  <CardContent className="p-4">
                    <View className="flex-row items-center gap-4">
                      <View className="relative">
                        <Avatar className="ring-2 ring-purple-200/50">
                          {match.photos?.[0] ? <AvatarImage source={{ uri: match.photos[0].photo_url }} /> : null}
                          <AvatarFallback className="bg-linear-to-br from-ocean-400 to-primary">
                            <Text className="text-white text-lg font-semibold">{match.first_name?.[0] || "?"}</Text>
                          </AvatarFallback>
                        </Avatar>
                        {match.profile_video_url && (
                          <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-primary to-primary-light rounded-full items-center justify-center shadow-md">
                            <Play size={10} color="white" />
                          </View>
                        )}
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="font-semibold text-base text-slate-800">
                            {match.first_name}, {match.age}
                          </Text>
                          {match.compatibility_score && (
                            <Badge className="bg-gradient-to-r from-ocean-50 to-ocean-100 border-purple-200">
                              <Text className="text-xs text-purple-500">
                                {Math.round(match.compatibility_score)}% harmony
                              </Text>
                            </Badge>
                          )}
                        </View>
                        <Text className="text-sm text-slate-600">
                          {match.denomination} • {match.distance ? `${Math.round(match.distance)} miles` : "Nearby"}
                        </Text>
                        {match.profile_video_url && (
                          <Text className="text-xs text-purple-500 mt-1">Shared their story</Text>
                        )}
                      </View>
                      <TouchableOpacity className="h-10 w-10 bg-gradient-to-r from-primary to-primary-light rounded-lg items-center justify-center shadow-md">
                        <MessageCircle size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  </CardContent>
                </Card>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}