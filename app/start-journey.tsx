import { useState, useCallback, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { LogOut } from "lucide-react-native"
import { userService } from "../lib/services/user.service"
import { useAuth } from "../contexts/auth-context"
import { EquallyYokedQuestionnaire } from "../components/equally-yoked-questionnaire"
import type { QuestionnaireResponse } from "../lib/services/user.service"

export default function StartJourneyScreen() {
  const router = useRouter()
  const { user, logout, onboardingProgress, loadOnboardingProgress, refreshUser } = useAuth()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [profileData, setProfileData] = useState({
    dateOfBirth: "",
    gender: "",
    locationCity: "",
    locationState: "",
  })

  const [questionnaireResponses, setQuestionnaireResponses] = useState<QuestionnaireResponse[]>([])

  const [preferences, setPreferences] = useState({
    lookingFor: "",
    denomination: "",
    churchAttendance: "",
    location: "",
    ageRangeMin: "25",
    ageRangeMax: "35",
    maxDistance: "50",
  })

  useEffect(() => {
    if (onboardingProgress) {
      console.log("[Anointed Innovations] Restoring onboarding progress:", onboardingProgress)
      setStep(onboardingProgress.currentStep || 1)
      if (onboardingProgress.basicInfo) {
        setProfileData(onboardingProgress.basicInfo)
      }
      if (onboardingProgress.questionnaireResponses) {
        setQuestionnaireResponses(onboardingProgress.questionnaireResponses)
      }
      if (onboardingProgress.preferences) {
        setPreferences({
          lookingFor: onboardingProgress.preferences.lookingFor || "",
          denomination: onboardingProgress.preferences.denomination || "",
          churchAttendance: onboardingProgress.preferences.churchAttendance || "",
          location: onboardingProgress.preferences.location || "",
          ageRangeMin: onboardingProgress.preferences.ageRange?.min?.toString() || "25",
          ageRangeMax: onboardingProgress.preferences.ageRange?.max?.toString() || "35",
          maxDistance: onboardingProgress.preferences.maxDistance?.toString() || "50",
        })
      }
    }
  }, [onboardingProgress])

  useEffect(() => {
    const saveProgress = async () => {
      if (step === 1 && !user?.profileComplete) {
        await saveOnboardingProgress()
      }
    }
    const debounceTimer = setTimeout(saveProgress, 2000)
    return () => clearTimeout(debounceTimer)
  }, [profileData, step])

  const saveOnboardingProgress = async () => {
    try {
      setIsSaving(true)
      await userService.saveOnboardingProgress({
        currentStep: step,
        basicInfo: profileData,
        questionnaireResponses: questionnaireResponses.length > 0 ? questionnaireResponses : undefined,
        preferences:
          step >= 3
            ? {
                lookingFor: preferences.lookingFor,
                denomination: preferences.denomination,
                churchAttendance: preferences.churchAttendance,
                location: preferences.location,
                ageRange: {
                  min: Number.parseInt(preferences.ageRangeMin),
                  max: Number.parseInt(preferences.ageRangeMax),
                },
                maxDistance: Number.parseInt(preferences.maxDistance),
              }
            : undefined,
        lastUpdated: new Date().toISOString(),
      })
      console.log("[Anointed Innovations] Onboarding progress saved")
    } catch (error) {
      console.error("[Anointed Innovations] Error saving progress:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert(
      "Save Progress & Logout",
      "Your progress will be saved. You can continue where you left off when you return.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await saveOnboardingProgress()
            await logout()
          },
        },
      ],
    )
  }

  const handleQuestionnaireComplete = useCallback(async (responses: QuestionnaireResponse[]) => {
    console.log("[Anointed Innovations] Questionnaire completed with", responses.length, "responses")
    setQuestionnaireResponses(responses)
    setStep(3)
    await saveOnboardingProgress()
  }, [])

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

      await userService.updateProfile({ profileComplete: true })

      const { authService } = await import("../lib/services/auth.service")
      await authService.updateCurrentUser({
        profileComplete: true,
        profile_complete: true,
      } as any)

      await userService.clearOnboardingProgress()

      await refreshUser()

      console.log("[Anointed Innovations] Profile complete, navigating to tabs")

      await new Promise((resolve) => setTimeout(resolve, 100))
      router.replace("/(tabs)")
    } catch (error: any) {
      console.error("[Anointed Innovations] Error completing profile:", error)
      Alert.alert("Error", error.message || "Failed to save preferences")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBasicInfoComplete = async () => {
    if (!profileData.dateOfBirth || !profileData.gender || !profileData.locationCity || !profileData.locationState) {
      Alert.alert("Missing Information", "Please complete all required fields")
      return
    }
    console.log("[Anointed Innovations] Moving to questionnaire step")
    setStep(2)
    await saveOnboardingProgress()
  }

  return (
    <LinearGradient colors={["#E0F2FE", "#F0F9FF"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-12">
        {/* Header with Logout */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground mb-2">
                {step === 1 ? "Basic Information" : step === 2 ? "Equally Yoked Questionnaire" : "Your Preferences"}
              </Text>
              <Text className="text-base text-muted-foreground">
                {step === 1
                  ? "Tell us a bit about yourself"
                  : step === 2
                    ? "Help us understand your faith and values"
                    : "Help us find your perfect match"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              className="ml-4 p-3 bg-white rounded-full shadow-sm border border-slate-200"
            >
              <LogOut size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          {isSaving && <Text className="text-xs text-muted-foreground italic">Saving progress...</Text>}
        </View>

        {/* Progress */}
        <View className="flex-row items-center mb-8">
          <View className={`flex-1 h-2 rounded-full ${step >= 1 ? "bg-primary" : "bg-primary/30"}`} />
          <View className={`flex-1 h-2 rounded-full ml-2 ${step >= 2 ? "bg-primary" : "bg-primary/30"}`} />
          <View className={`flex-1 h-2 rounded-full ml-2 ${step >= 3 ? "bg-primary" : "bg-primary/30"}`} />
        </View>

        {/* Step 1: Basic Profile Info */}
        {step === 1 && (
          <View className="gap-6">
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Date of Birth</Text>
              <TextInput
                value={profileData.dateOfBirth}
                onChangeText={(text) => setProfileData({ ...profileData, dateOfBirth: text })}
                placeholder="MM/DD/YYYY"
                className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">Gender</Text>
              <View className="gap-3">
                {["Male", "Female"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setProfileData({ ...profileData, gender: option })}
                    className={`border-2 rounded-xl py-4 px-4 ${
                      profileData.gender === option ? "border-primary bg-primary/10" : "border-input bg-card"
                    }`}
                  >
                    <Text
                      className={`font-medium ${profileData.gender === option ? "text-primary" : "text-foreground"}`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">City</Text>
              <TextInput
                value={profileData.locationCity}
                onChangeText={(text) => setProfileData({ ...profileData, locationCity: text })}
                placeholder="e.g., Atlanta"
                className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">State</Text>
              <TextInput
                value={profileData.locationState}
                onChangeText={(text) => setProfileData({ ...profileData, locationState: text })}
                placeholder="e.g., GA"
                className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
              />
            </View>

            <TouchableOpacity
              onPress={handleBasicInfoComplete}
              disabled={
                !profileData.dateOfBirth ||
                !profileData.gender ||
                !profileData.locationCity ||
                !profileData.locationState
              }
              className={`bg-primary rounded-xl py-4 px-6 shadow-lg ${
                !profileData.dateOfBirth ||
                !profileData.gender ||
                !profileData.locationCity ||
                !profileData.locationState
                  ? "opacity-50"
                  : ""
              }`}
            >
              <Text className="text-primary-foreground text-center text-lg font-semibold">Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Equally Yoked Questionnaire */}
        {step === 2 && <EquallyYokedQuestionnaire onComplete={handleQuestionnaireComplete} />}

        {/* Step 3: Preferences */}
        {step === 3 && (
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
                onPress={() => setStep(2)}
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