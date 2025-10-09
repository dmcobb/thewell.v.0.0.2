import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { authService } from "../../lib/services/auth.service"

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address")
      return
    }

    setIsLoading(true)
    try {
      await authService.forgotPassword(email.toLowerCase().trim())
      setEmailSent(true)
      Alert.alert("Success", "Password reset instructions have been sent to your email")
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send reset email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LinearGradient colors={["#E0F2FE", "#F0F9FF"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-12">
        <TouchableOpacity onPress={() => router.back()} className="mb-8">
          <Ionicons name="arrow-back" size={28} color="#0891B2" />
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">Forgot Password?</Text>
          <Text className="text-base text-muted-foreground">
            Enter your email and we'll send you instructions to reset your password
          </Text>
        </View>

        {!emailSent ? (
          <>
            <View className="mb-6">
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

            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={isLoading}
              className={`bg-primary rounded-xl py-4 px-6 shadow-lg ${isLoading ? "opacity-50" : ""}`}
            >
              <Text className="text-primary-foreground text-center text-lg font-semibold">
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View className="items-center py-8">
            <View className="bg-primary/10 rounded-full p-6 mb-6">
              <Ionicons name="mail" size={60} color="#0891B2" />
            </View>
            <Text className="text-xl font-semibold text-foreground mb-2 text-center">Check Your Email</Text>
            <Text className="text-base text-muted-foreground text-center mb-8">
              We've sent password reset instructions to {email}
            </Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")} className="bg-primary rounded-xl py-4 px-6">
              <Text className="text-primary-foreground text-center text-lg font-semibold">Back to Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  )
}
