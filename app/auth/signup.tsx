import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Modal, ActivityIndicator, Linking } from "react-native"
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
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

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
    if (!agreedToTerms) {
      Alert.alert("Terms Required", "You must agree to the Terms of Use and Community Guidelines to create an account.")
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

        {/* Terms of Use Agreement */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24, paddingHorizontal: 4 }}>
          <TouchableOpacity
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            style={{
              width: 24, height: 24, borderRadius: 6, borderWidth: 2,
              borderColor: agreedToTerms ? '#9B7EDE' : '#CBD5E1',
              backgroundColor: agreedToTerms ? '#9B7EDE' : 'white',
              alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 2
            }}
          >
            {agreedToTerms && <Ionicons name="checkmark" size={16} color="white" />}
          </TouchableOpacity>
          <Text style={{ flex: 1, color: '#64748B', fontSize: 13, lineHeight: 20 }}>
            I agree to The Well's{' '}
            <Text style={{ color: '#9B7EDE', fontWeight: 'bold' }} onPress={() => setShowTermsModal(true)}>Terms of Use & Community Guidelines</Text>
            {' '}which include zero tolerance for objectionable content or abusive behavior.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 40 }}>
          <Text style={{ color: '#64748B' }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={{ color: '#9B7EDE', fontWeight: 'bold' }}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Terms of Use Modal */}
        <Modal visible={showTermsModal} animationType="slide" presentationStyle="pageSheet">
          <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1E293B' }}>Terms of Use & Community Guidelines</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <Ionicons name="close" size={28} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1, padding: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 }}>Welcome to The Well</Text>
              <Text style={{ fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 16 }}>
                By using The Well, you agree to abide by these Terms of Use and Community Guidelines. These terms are designed to create a safe, respectful, and faith-centered environment for all users.
              </Text>

              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 }}>1. Community Standards</Text>
              <Text style={{ fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 16 }}>
                The Well has a zero-tolerance policy for objectionable content and abusive users. This includes but is not limited to:{"\n"}
                {"\u2022"} Harassment, bullying, or threatening behavior{"\n"}
                {"\u2022"} Hate speech or discriminatory content{"\n"}
                {"\u2022"} Sexually explicit or pornographic material{"\n"}
                {"\u2022"} Spam, scams, or fraudulent activity{"\n"}
                {"\u2022"} Impersonation or misleading profiles{"\n"}
                {"\u2022"} Any content that promotes violence or illegal activity
              </Text>

              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 }}>2. Content Moderation</Text>
              <Text style={{ fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 16 }}>
                All user-generated content is subject to review. Our moderation team actively monitors the platform and will act on reports of objectionable content within 24 hours. Violations may result in content removal, account suspension, or permanent ban.
              </Text>

              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 }}>3. Reporting & Blocking</Text>
              <Text style={{ fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 16 }}>
                Users can report objectionable content or abusive users directly from any profile or conversation. You may also block users at any time. Blocking immediately removes the user from your feed and notifies our moderation team for review.
              </Text>

              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 }}>4. Account Requirements</Text>
              <Text style={{ fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 16 }}>
                {"\u2022"} You must be at least 18 years old to use The Well{"\n"}
                {"\u2022"} You must provide accurate information in your profile{"\n"}
                {"\u2022"} You are responsible for maintaining the security of your account{"\n"}
                {"\u2022"} One account per person
              </Text>

              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 }}>5. Enforcement</Text>
              <Text style={{ fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 16 }}>
                Users who violate these terms will face consequences including:{"\n"}
                {"\u2022"} Warning for minor first-time offenses{"\n"}
                {"\u2022"} Temporary suspension for repeated violations{"\n"}
                {"\u2022"} Permanent ban and content removal for severe violations{"\n"}
                The developer will act on objectionable content reports within 24 hours by removing the content and ejecting the offending user.
              </Text>

              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 }}>6. Privacy</Text>
              <Text style={{ fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 16 }}>
                Your privacy is important to us. We collect and use your data only as described in our Privacy Policy. You may delete your account and all associated data at any time from the Settings screen.
              </Text>

              <TouchableOpacity
                onPress={() => { setAgreedToTerms(true); setShowTermsModal(false); }}
                style={{ backgroundColor: '#9B7EDE', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>I Agree to These Terms</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

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