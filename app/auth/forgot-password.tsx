import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native"
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
      // We keep the alert for clear feedback on Android/iOS
      Alert.alert("Success", "Password reset instructions have been sent to your email")
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send reset email")
    } finally {
      setIsLoading(false)
    }
  }

  // Common styles to ensure consistency
  const inputStyle = {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B'
  }

  const primaryButtonStyle = {
    backgroundColor: '#9B7EDE', // Purple from splash
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }

  return (
    <LinearGradient colors={["#F8FAFC", "#E0F2FE"]} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 60 }}>
        
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ marginBottom: 32, width: 40, height: 40, justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={28} color="#0891B2" />
        </TouchableOpacity>

        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 }}>
            Forgot Password?
          </Text>
          <Text style={{ fontSize: 16, color: '#64748B', lineHeight: 22 }}>
            Enter your email and we'll send you instructions to reset your password
          </Text>
        </View>

        {!emailSent ? (
          <>
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
                Email Address
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your.email@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={inputStyle}
              />
            </View>

            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={isLoading}
              style={[primaryButtonStyle, { opacity: isLoading ? 0.6 : 1 }]}
            >
              {isLoading && <ActivityIndicator color="white" style={{ marginRight: 10 }} />}
              <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <View style={{ backgroundColor: '#E0F2FE', borderRadius: 50, padding: 24, marginBottom: 24 }}>
              <Ionicons name="mail-open" size={60} color="#0891B2" />
            </View>
            
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 12, textAlign: 'center' }}>
              Check Your Email
            </Text>
            
            <Text style={{ fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 32, lineHeight: 24 }}>
              We've sent password reset instructions to{"\n"}
              <Text style={{ fontWeight: 'bold', color: '#1E293B' }}>{email}</Text>
            </Text>
            
            <TouchableOpacity 
              onPress={() => router.push("/auth/login")} 
              style={[primaryButtonStyle, { width: '100%' }]}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                Back to Login
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setEmailSent(false)} 
              style={{ marginTop: 20 }}
            >
              <Text style={{ color: '#0891B2', fontWeight: '600' }}>Try a different email</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  )
}