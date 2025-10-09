import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { userService } from "../lib/services/user.service"

export default function StartJourneyScreen() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    lookingFor: "",
    denomination: "",
    churchAttendance: "",
    location: "",
    ageRangeMin: "25",
    ageRangeMax: "35",
    maxDistance: "50",
  })

  const handleComplete = async () => {
    if (!preferences.lookingFor || !preferences.denomination || !preferences.churchAttendance) {
      Alert.alert("Missing Information", "Please complete all required fields")
      return
    }

    setIsLoading(true)
    try {
      await userService.updatePreferences({
        lookingFor: preferences.lookingFor,
        denomination: preferences.denomination,
        churchAttendance: preferences.churchAttendance,
        location: preferences.location,
        ageRange: {
          min: Number.parseInt(preferences.ageRangeMin),
          max: Number.parseInt(preferences.ageRangeMax),
        },
        maxDistance: Number.parseInt(preferences.maxDistance),
      })

      // Mark profile as complete
      await userService.updateProfile({ profileComplete: true })

      router.replace("/(tabs)")
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save preferences")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LinearGradient colors={["#E0F2FE", "#F0F9FF"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-12">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">Start Your Journey</Text>
          <Text className="text-base text-muted-foreground">
            Help us find your perfect match by sharing your preferences
          </Text>
        </View>

        {/* Progress */}
        <View className="flex-row items-center mb-8">
          <View className={`flex-1 h-2 rounded-full ${step >= 1 ? "bg-primary" : "bg-primary/30"}`} />
          <View className={`flex-1 h-2 rounded-full ml-2 ${step >= 2 ? "bg-primary" : "bg-primary/30"}`} />
        </View>

        {step === 1 ? (
          <View className="gap-6">
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">What are you looking for?</Text>
              <View className="gap-3">
                {["Serious Relationship", "Marriage", "Friendship First"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setPreferences({ ...preferences, lookingFor: option })}
                    className={`border-2 rounded-xl py-4 px-4 ${
                      preferences.lookingFor === option ? "border-primary bg-primary/10" : "border-input bg-card"
                    }`}
                  >
                    <Text
                      className={`font-medium ${preferences.lookingFor === option ? "text-primary" : "text-foreground"}`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Your Denomination</Text>
              <View className="gap-3">
                {["Non-Denominational", "Baptist", "Pentecostal", "Methodist", "Catholic", "Other"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setPreferences({ ...preferences, denomination: option })}
                    className={`border-2 rounded-xl py-4 px-4 ${
                      preferences.denomination === option ? "border-primary bg-primary/10" : "border-input bg-card"
                    }`}
                  >
                    <Text
                      className={`font-medium ${preferences.denomination === option ? "text-primary" : "text-foreground"}`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Church Attendance</Text>
              <View className="gap-3">
                {["Weekly", "Bi-Weekly", "Monthly", "Occasionally"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setPreferences({ ...preferences, churchAttendance: option })}
                    className={`border-2 rounded-xl py-4 px-4 ${
                      preferences.churchAttendance === option ? "border-primary bg-primary/10" : "border-input bg-card"
                    }`}
                  >
                    <Text
                      className={`font-medium ${preferences.churchAttendance === option ? "text-primary" : "text-foreground"}`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setStep(2)}
              disabled={!preferences.lookingFor || !preferences.denomination || !preferences.churchAttendance}
              className={`bg-primary rounded-xl py-4 px-6 shadow-lg ${
                !preferences.lookingFor || !preferences.denomination || !preferences.churchAttendance
                  ? "opacity-50"
                  : ""
              }`}
            >
              <Text className="text-primary-foreground text-center text-lg font-semibold">Continue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-6">
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Your Location (City, State)</Text>
              <TextInput
                value={preferences.location}
                onChangeText={(text) => setPreferences({ ...preferences, location: text })}
                placeholder="e.g., Atlanta, GA"
                className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Preferred Age Range</Text>
              <View className="flex-row gap-4 items-center">
                <TextInput
                  value={preferences.ageRangeMin}
                  onChangeText={(text) => setPreferences({ ...preferences, ageRangeMin: text })}
                  placeholder="Min"
                  keyboardType="number-pad"
                  className="flex-1 bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
                />
                <Text className="text-muted-foreground">to</Text>
                <TextInput
                  value={preferences.ageRangeMax}
                  onChangeText={(text) => setPreferences({ ...preferences, ageRangeMax: text })}
                  placeholder="Max"
                  keyboardType="number-pad"
                  className="flex-1 bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Maximum Distance (miles)</Text>
              <TextInput
                value={preferences.maxDistance}
                onChangeText={(text) => setPreferences({ ...preferences, maxDistance: text })}
                placeholder="50"
                keyboardType="number-pad"
                className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
              />
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setStep(1)}
                className="flex-1 border-2 border-primary rounded-xl py-4 px-6"
              >
                <Text className="text-primary text-center text-lg font-semibold">Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleComplete}
                disabled={isLoading}
                className={`flex-1 bg-primary rounded-xl py-4 px-6 shadow-lg ${isLoading ? "opacity-50" : ""}`}
              >
                <Text className="text-primary-foreground text-center text-lg font-semibold">
                  {isLoading ? "Saving..." : "Complete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  )
}
