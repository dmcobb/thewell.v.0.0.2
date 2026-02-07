import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Modal } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "../../contexts/auth-context"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"

export default function SignupScreen() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: new Date(2000, 0, 1),
    gender: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Production-ready age calculation that accounts for month and day
  const calculateAge = (birthDate: Date): number => {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    // If birthday hasn't occurred yet this year, subtract 1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false)
    }
    if (selectedDate) {
      setFormData({ ...formData, dateOfBirth: selectedDate })
    }
  }

  const handleSignup = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.gender) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters")
      return
    }

    // Production-ready age check (must be 18+)
    const age = calculateAge(formData.dateOfBirth)
    if (age < 18) {
      Alert.alert("Age Requirement", "You must be at least 18 years old to create an account on The Well.")
      return
    }

    // Additional validation: reasonable age range (18-120)
    if (age > 120) {
      Alert.alert("Invalid Date", "Please enter a valid date of birth.")
      return
    }

    setIsLoading(true)
    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        dateOfBirth: formData.dateOfBirth.toISOString().split("T")[0], // YYYY-MM-DD format
        gender: formData.gender as "male" | "female", // Type assertion for enum
      })
      // Navigation handled by AuthContext
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message || "Unable to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate minimum date (must be at least 18 years old)
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 18)

  // Calculate maximum date (reasonable limit of 120 years)
  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - 120)

  return (
    <LinearGradient colors={["#E0F2FE", "#F0F9FF"]} className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="px-6 py-12">
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} className="mb-8">
          <Ionicons name="arrow-back" size={28} color="#0891B2" />
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">Create Account</Text>
          <Text className="text-base text-muted-foreground">Begin your journey to find your equally yoked partner</Text>
        </View>

        {/* Form */}
        <View className="gap-4 mb-6">
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground mb-2">First Name</Text>
              <TextInput
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                placeholder="John"
                autoCapitalize="words"
                className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground mb-2">Last Name</Text>
              <TextInput
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                placeholder="Doe"
                autoCapitalize="words"
                className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
              />
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Email</Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Date of Birth</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-card border border-input rounded-xl px-4 py-3"
            >
              <Text className="text-base text-foreground">
                {formData.dateOfBirth.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </TouchableOpacity>
            <Text className="text-xs text-muted-foreground mt-1">You must be at least 18 years old</Text>
          </View>

          {/* iOS Date Picker Modal */}
          {Platform.OS === "ios" ? (
            <Modal visible={showDatePicker} transparent animationType="slide">
              <View className="flex-1 justify-end bg-black/50">
                <View className="bg-card rounded-t-3xl p-4">
                  <View className="flex-row justify-between items-center mb-4">
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text className="text-primary font-medium">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="text-foreground font-semibold">Select Date of Birth</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text className="text-primary font-medium">Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={formData.dateOfBirth}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={maxDate}
                    minimumDate={minDate}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            showDatePicker && (
              <DateTimePicker
                value={formData.dateOfBirth}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={maxDate}
                minimumDate={minDate}
              />
            )
          )}

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Gender</Text>
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, gender: "male" })}
                className={`flex-1 border-2 rounded-xl py-3 px-4 ${
                  formData.gender === "male" ? "border-primary bg-primary/10" : "border-input bg-card"
                }`}
              >
                <Text
                  className={`text-center font-medium ${formData.gender === "male" ? "text-primary" : "text-foreground"}`}
                >
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, gender: "female" })}
                className={`flex-1 border-2 rounded-xl py-3 px-4 ${
                  formData.gender === "female" ? "border-primary bg-primary/10" : "border-input bg-card"
                }`}
              >
                <Text
                  className={`text-center font-medium ${formData.gender === "female" ? "text-primary" : "text-foreground"}`}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Password</Text>
            <View className="relative">
              <TextInput
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder="At least 8 characters"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground pr-12"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-4 top-3">
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-foreground mb-2">Confirm Password</Text>
            <View className="relative">
              <TextInput
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                placeholder="Re-enter your password"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                className="bg-card border border-input rounded-xl px-4 py-3 text-base text-foreground pr-12"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3"
              >
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Signup Button */}
        <TouchableOpacity
          onPress={handleSignup}
          disabled={isLoading}
          className={`bg-white rounded-xl py-4 px-6 shadow-lg mb-6 ${isLoading ? "opacity-50" : ""}`}
        >
          <Text className="text-purple-700 text-center text-lg font-semibold">
            {isLoading ? "Creating Account..." : "Create Account"}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View className="flex-row justify-center items-center mb-8">
          <Text className="text-muted-foreground">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text className="text-primary font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}