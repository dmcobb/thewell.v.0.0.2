import { View, Text, TouchableOpacity, Image } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "../contexts/auth-context"
import { useEffect } from "react"

export default function SplashScreen() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (!user.profileComplete) {
        router.replace("/onboarding")
      } else {
        router.replace("/(tabs)")
      }
    }
  }, [isAuthenticated, isLoading, user])

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-primary text-lg">Loading...</Text>
      </View>
    )
  }

  return (
    <LinearGradient colors={["#9B7EDE", "#E891E8", "#2C5F7F"]} className="flex-1">
      <View className="flex-1 justify-between px-6 py-12">
        {/* Logo and Tagline */}
        <View className="flex-1 justify-center items-center">
          <Image source={require("../assets/icon.png")} className="w-48 h-48 mb-8" resizeMode="contain" />
          <Text className="text-2xl text-white/90 text-center text-balance px-4 font-semibold">
            Where Kingdom Singles Meet
          </Text>
          <Text className="text-base text-white/70 text-center mt-4 px-8 text-pretty">
            Faith-centered connections for marriage-minded believers
          </Text>
        </View>

        {/* CTA Buttons */}
        <View className="gap-4 mb-8">
          <TouchableOpacity
            onPress={() => router.push("/auth/signup")}
            className="bg-white rounded-xl py-4 px-6 shadow-lg"
          >
            <Text className="text-purple-700 text-center text-lg font-semibold">Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            className="bg-white/20 border-2 border-white rounded-xl py-4 px-6 backdrop-blur-sm"
          >
            <Text className="text-white text-center text-lg font-semibold">Sign In</Text>
          </TouchableOpacity>

          <Text className="text-white/60 text-center text-sm mt-2">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </LinearGradient>
  )
}
