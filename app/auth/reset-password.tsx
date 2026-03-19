import { useState } from "react"
import { View, Text, TouchableOpacity, Dimensions } from "react-native"
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

  // BRAND COLORS Mapped from your Tailwind Config
  const colors = {
    primary: "#9B7EDE",    // Brand Purple
    secondary: "#2C5F7F",  // Brand Ocean
    textMain: "#1E293B",   // Slate 800 (Foreground)
    textMuted: "#64748B",  // Slate 500 (Muted)
    ocean100: "#E0F2FE",   // Gradient Start
    purple50: "#F3E8FF",   // Gradient End
  }

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
    <LinearGradient 
      colors={[colors.ocean100, "#F0F9FF", colors.purple50]} 
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 60 }}>
        
        {/* Skip Button - Using Secondary Brand Color */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 }}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={{ color: colors.secondary, fontWeight: '700', fontSize: 16 }}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {/* Icon Container with 10% Opacity Primary Purple */}
          <View style={{ 
            backgroundColor: `${colors.primary}1A`, 
            borderRadius: 100, 
            padding: 30, 
            marginBottom: 40 
          }}>
            <Ionicons name={step.icon} size={80} color={colors.primary} />
          </View>

          <Text style={{ 
            fontSize: 28, 
            fontWeight: 'bold', 
            color: colors.textMain, 
            textAlign: 'center', 
            marginBottom: 16,
            paddingHorizontal: 10
          }}>
            {step.title}
          </Text>
          
          <Text style={{ 
            fontSize: 16, 
            color: colors.textMuted, 
            textAlign: 'center', 
            paddingHorizontal: 20,
            lineHeight: 24
          }}>
            {step.description}
          </Text>
        </View>

        {/* Progress Indicators */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={{
                height: 8,
                borderRadius: 4,
                width: index === currentStep ? 32 : 8,
                backgroundColor: index === currentStep ? colors.primary : `${colors.primary}4D`, // 30% Opacity
              }}
            />
          ))}
        </View>

        {/* Next/Get Started Button - Using Secondary Brand Color (Ocean) */}
        <TouchableOpacity 
          onPress={handleNext} 
          style={{ 
            backgroundColor: colors.secondary, 
            borderRadius: 12, 
            paddingVertical: 18, 
            shadowColor: colors.secondary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
            {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}