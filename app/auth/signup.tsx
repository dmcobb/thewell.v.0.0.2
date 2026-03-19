import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Modal, ActivityIndicator } from "react-native"
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

  const calculateAge = (birthDate: Date): number => {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
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

    const age = calculateAge(formData.dateOfBirth)
    if (age < 18) {
      Alert.alert("Age Requirement", "You must be at least 18 years old to create an account.")
      return
    }

    setIsLoading(true)
    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        dateOfBirth: formData.dateOfBirth.toISOString().split("T")[0],
        gender: formData.gender as "male" | "female",
      })
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message || "Unable to create account.")
    } finally {
      setIsLoading(false)
    }
  }

  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 18)
  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - 120)

  const inputStyle = {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B'
  }

  const labelStyle = {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#475569',
    marginBottom: 6
  }

  return (
    <LinearGradient colors={["#F8FAFC", "#E0F2FE"]} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 60 }}>
        
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
          <Ionicons name="arrow-back" size={28} color="#0891B2" />
        </TouchableOpacity>

        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 }}>Create Account</Text>
          <Text style={{ fontSize: 16, color: '#64748B' }}>Begin your journey to find your partner</Text>
        </View>

        <View style={{ gap: 16, marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={labelStyle}>First Name</Text>
              <TextInput
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                placeholder="John"
                placeholderTextColor="#94A3B8"
                style={inputStyle}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={labelStyle}>Last Name</Text>
              <TextInput
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                placeholder="Doe"
                placeholderTextColor="#94A3B8"
                style={inputStyle}
              />
            </View>
          </View>

          <View>
            <Text style={labelStyle}>Email</Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="your.email@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              style={inputStyle}
            />
          </View>

          <View>
            <Text style={labelStyle}>Date of Birth</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={inputStyle}>
              <Text style={{ color: '#1E293B', fontSize: 16 }}>
                {formData.dateOfBirth.toLocaleDateString("en-US", {
                  month: "long", day: "numeric", year: "numeric",
                })}
              </Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text style={labelStyle}>Gender</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {["male", "female"].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setFormData({ ...formData, gender: g })}
                  style={{
                    flex: 1,
                    borderWidth: 2,
                    borderRadius: 12,
                    paddingVertical: 12,
                    backgroundColor: formData.gender === g ? '#F0E7FF' : 'white',
                    borderColor: formData.gender === g ? '#9B7EDE' : '#CBD5E1',
                  }}
                >
                  <Text style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: formData.gender === g ? '#9B7EDE' : '#64748B',
                    textTransform: 'capitalize'
                  }}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={labelStyle}>Password</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder="At least 8 characters"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                style={[inputStyle, { paddingRight: 50 }]}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 16, top: 12 }}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text style={labelStyle}>Confirm Password</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                placeholder="Re-enter password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirmPassword}
                style={[inputStyle, { paddingRight: 50 }]}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: 16, top: 12 }}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSignup}
          disabled={isLoading}
          style={{
            backgroundColor: '#9B7EDE',
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading && <ActivityIndicator color="white" style={{ marginRight: 8 }} />}
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 40 }}>
          <Text style={{ color: '#64748B' }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={{ color: '#9B7EDE', fontWeight: 'bold' }}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* iOS Date Picker Modal */}
        {Platform.OS === "ios" && (
          <Modal visible={showDatePicker} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
              <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={{ color: '#9B7EDE', fontWeight: 'bold' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={{ color: '#9B7EDE', fontWeight: 'bold' }}>Done</Text>
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
        )}

        {Platform.OS === "android" && showDatePicker && (
          <DateTimePicker
            value={formData.dateOfBirth}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={maxDate}
            minimumDate={minDate}
          />
        )}
      </ScrollView>
    </LinearGradient>
  )
}