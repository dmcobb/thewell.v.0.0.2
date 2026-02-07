import { View, Text, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Image } from "expo-image"
import { Bell, Settings } from "lucide-react-native"
import { EquallyYokedQuestionnaire } from "@/components/equally-yoked-questionnaire"

export default function EquallyYokedTab() {
  return (
    <View className="flex-1 bg-gradient-to-b from-ocean-100 via-ocean-50 to-ocean-100">
      {/* Header in layout */}
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-6">
        <EquallyYokedQuestionnaire />
      </ScrollView>
    </View>
  )
}
