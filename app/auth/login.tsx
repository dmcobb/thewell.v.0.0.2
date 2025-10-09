import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "../../contexts/auth-context"
import { Ionicons } from "@expo/vector-icons"

export default function LoginScreen() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      await login(email.toLowerCase().trim(), password)
      // Navigation handled by AuthContext
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LinearGradient colors={["#E0F2FE", "#F0F9FF"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-12">
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} className="mb-8">
          <Ionicons name="arrow-back" size={28} color="#0891B2" />
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">Welcome Back</Text>
          <Text className="text-base text-muted-foreground">Sign in to continue your journey</Text>
        </View>

        {/* Form */}
        <View className="gap-4 mb-6">
          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Password</Text>
            <View className="relative">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground pr-12"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-4 top-3">
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push("/auth/forgot-password")}>
            <Text className="text-primary text-sm font-medium text-right">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          className={`bg-primary rounded-xl py-4 px-6 shadow-lg mb-6 ${isLoading ? "opacity-50" : ""}`}
        >
          <Text className="text-primary-foreground text-center text-lg font-semibold">
            {isLoading ? "Signing In..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View className="flex-row justify-center items-center">
          <Text className="text-muted-foreground">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/signup")}>
            <Text className="text-primary font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
