import { useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

const onboardingSteps = [
  {
    title: "Welcome to The Well",
    description: "A faith-centered community where kingdom singles meet their equally yoked partner",
    icon: "water" as const,
  },
  {
    title: "AI-Powered Matching",
    description: "Our intelligent system finds compatible matches based on your faith, values, and life goals",
    icon: "sparkles" as const,
  },
  {
    title: "Equally Yoked Questionnaire",
    description: "Complete our comprehensive questionnaire to help us understand your faith journey and preferences",
    icon: "heart" as const,
  },
  {
    title: "Video Profiles",
    description: "Share your story through video to create authentic connections with potential matches",
    icon: "videocam" as const,
  },
  {
    title: "Community Features",
    description: "Join prayer circles, attend faith-based events, and grow together in community",
    icon: "people" as const,
  },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.replace("/start-journey")
    }
  }

  const handleSkip = () => {
    router.replace("/start-journey")
  }

  const step = onboardingSteps[currentStep]

  return (
    <LinearGradient colors={["#E0F2FE", "#F0F9FF", "#F3E8FF"]} className="flex-1">
      <View className="flex-1 px-6 py-12">
        {/* Skip Button */}
        <View className="flex-row justify-end mb-8">
          <TouchableOpacity onPress={handleSkip}>
            <Text className="text-primary font-semibold text-base">Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 justify-center items-center">
          <View className="bg-primary/10 rounded-full p-8 mb-8">
            <Ionicons name={step.icon} size={80} color="#0891B2" />
          </View>

          <Text className="text-3xl font-bold text-foreground text-center mb-4 text-balance px-4">{step.title}</Text>
          <Text className="text-base text-muted-foreground text-center px-8 text-pretty">{step.description}</Text>
        </View>

        {/* Progress Indicators */}
        <View className="flex-row justify-center gap-2 mb-8">
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full ${index === currentStep ? "w-8 bg-primary" : "w-2 bg-primary/30"}`}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity onPress={handleNext} className="bg-primary rounded-xl py-4 px-6 shadow-lg">
          <Text className="text-primary-foreground text-center text-lg font-semibold">
            {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}
