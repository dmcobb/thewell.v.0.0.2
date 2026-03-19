import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native"
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
      // Navigation is handled by the useEffect in AuthContext
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LinearGradient colors={["#F8FAFC", "#E0F2FE"]} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 60 }}>
        
        {/* Header */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ marginBottom: 32, width: 40, height: 40, justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={28} color="#0891B2" />
        </TouchableOpacity>

        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 }}>
            Welcome Back
          </Text>
          <Text style={{ fontSize: 16, color: '#64748B' }}>
            Sign in to continue your journey
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: 20, marginBottom: 24 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={{
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#CBD5E1',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: '#1E293B'
              }}
            />
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 }}>
              Password
            </Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={{
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: '#CBD5E1',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: '#1E293B',
                  paddingRight: 50
                }}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                style={{ position: 'absolute', right: 16, top: 14 }}
              >
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push("/auth/forgot-password")}>
            <Text style={{ color: '#0891B2', fontSize: 14, fontWeight: '600', textAlign: 'right' }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          style={{
            backgroundColor: '#9B7EDE', // Matching your splash screen purple
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            marginBottom: 24,
            opacity: isLoading ? 0.6 : 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {isLoading && <ActivityIndicator color="white" style={{ marginRight: 10 }} />}
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#64748B' }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/signup")}>
            <Text style={{ color: '#9B7EDE', fontWeight: 'bold' }}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}