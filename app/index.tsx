import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "../contexts/auth-context"
import { useEffect } from "react"

export default function SplashScreen() {
  const router = useRouter()
  const { isLoading, isAuthenticated } = useAuth()

  // Failsafe: If the AuthProvider doesn't redirect and we aren't loading,
  // we are on the splash screen as a guest.
  useEffect(() => {
    console.log('[Index] Splash screen mounted. Loading:', isLoading);
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a' }}>
        <ActivityIndicator size="large" color="#9B7EDE" />
        <Text style={{ color: 'white', marginTop: 16, fontSize: 16 }}>Initializing...</Text>
      </View>
    )
  }

  return (
    <LinearGradient 
      colors={["#9B7EDE", "#E891E8", "#2C5F7F"]} 
      style={{ flex: 1 }}
    >
      <View className="flex-1 justify-between px-6 py-12">
        <View className="flex-1 justify-center items-center">
          <Image 
            source={require("../assets/icon.png")} 
            className="w-48 h-48 mb-8" 
            resizeMode="contain" 
          />
          <Text className="text-2xl text-white/90 text-center px-4 font-semibold">
            Where Kingdom Singles Meet
          </Text>
          <Text className="text-base text-white/70 text-center mt-4 px-8">
            Faith-centered connections for marriage-minded believers
          </Text>
        </View>

        <View className="gap-4 mb-8">
          <TouchableOpacity
            onPress={() => router.push("/auth/signup")}
            className="bg-white rounded-xl py-4 px-6"
            activeOpacity={0.8}
          >
            <Text className="text-purple-700 text-center text-lg font-semibold">Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/auth/login")}
            className="bg-white/20 border-2 border-white rounded-xl py-4 px-6"
            activeOpacity={0.8}
          >
            <Text className="text-white text-center text-lg font-semibold">Sign In</Text>
          </TouchableOpacity>

          <Text className="text-white/60 text-center text-sm mt-2">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}