import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { ArrowLeft, Save, Camera } from "lucide-react-native"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { userService } from "@/lib/services/user.service"
import { router } from "expo-router"
import { useState, useEffect } from "react"

export default function AccountEditScreen() {
  const { user, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    location_city: "",
    location_state: "",
    denomination: "",
    church_name: "",
    occupation: "",
    education_level: "",
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      const profile = await userService.getCurrentUser()
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        bio: profile.bio || "",
        location_city: profile.location_city || "",
        location_state: profile.location_state || "",
        denomination: profile.denomination || "",
        church_name: profile.church_name || "",
        occupation: profile.occupation || "",
        education_level: profile.education_level || "",
      })
    } catch (error) {
      console.error("[Anointed Innovations] Error loading profile:", error)
      Alert.alert("Error", "Failed to load your profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await userService.updateProfile(formData)
      await refreshUser()
      Alert.alert("Success", "Your profile has been updated")
      router.back()
    } catch (error) {
      console.error("[Anointed Innovations] Error saving profile:", error)
      Alert.alert("Error", "Failed to update your profile")
    } finally {
      setIsSaving(false)
    }
  }

  const primaryPhoto = user?.photos?.find((p: any) => p.is_primary)?.photo_url || user?.photos?.[0]?.photo_url

  return (
    <View className="flex-1 bg-slate-50">
      <LinearGradient
        colors={['#9B7EDE', '#8B5CF6', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <View className="px-6 pt-14 pb-6">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="bg-white/20 p-2 rounded-full"
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white">Edit Account</Text>
            <TouchableOpacity 
              onPress={handleSave} 
              disabled={isSaving}
              className="bg-white/20 p-2 rounded-full"
            >
              <Save size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-5 pb-10">
        {isLoading ? (
          <View className="items-center justify-center py-12">
            <Text className="text-slate-400 font-medium">Loading your profile...</Text>
          </View>
        ) : (
          <View className="gap-6">
            <Card className="shadow-xl bg-white border-0 rounded-[24px] overflow-hidden">
              <CardHeader>
                <CardTitle className="text-slate-800">Profile Photo</CardTitle>
              </CardHeader>
              <CardContent className="items-center">
                <View className="relative">
                    <Avatar className="w-32 h-32 mb-4 border-4 border-purple-50">
                    {primaryPhoto ? <AvatarImage source={{ uri: primaryPhoto }} /> : null}
                    <AvatarFallback className="bg-primary">
                        <Text className="text-white text-3xl font-bold">{formData.first_name?.[0] || "U"}</Text>
                    </AvatarFallback>
                    </Avatar>
                </View>
                <Button variant="outline" className="border-purple-100 bg-purple-50 rounded-xl">
                  <Camera size={16} color="#8B5CF6" />
                  <Text className="ml-2 text-primary font-bold">Change Photo</Text>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-xl bg-white border-0 rounded-[24px]">
              <CardHeader>
                <CardTitle className="text-slate-800">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <View>
                  <Label className="text-slate-500 font-bold ml-1">First Name</Label>
                  <TextInput
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 mt-2 text-slate-800 font-medium"
                    value={formData.first_name}
                    onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                    placeholder="Enter your first name"
                  />
                </View>
                <View>
                  <Label className="text-slate-500 font-bold ml-1">Last Name</Label>
                  <TextInput
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 mt-2 text-slate-800 font-medium"
                    value={formData.last_name}
                    onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                    placeholder="Enter your last name"
                  />
                </View>
                <View>
                  <Label className="text-slate-500 font-bold ml-1">Bio</Label>
                  <TextInput
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 mt-2 text-slate-800 font-medium"
                    value={formData.bio}
                    onChangeText={(text) => setFormData({ ...formData, bio: text })}
                    placeholder="Tell us about yourself"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </CardContent>
            </Card>

            <Card className="shadow-xl bg-white border-0 rounded-[24px]">
              <CardHeader>
                <CardTitle className="text-slate-800">Location</CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <View>
                  <Label className="text-slate-500 font-bold ml-1">City</Label>
                  <TextInput
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 mt-2 text-slate-800 font-medium"
                    value={formData.location_city}
                    onChangeText={(text) => setFormData({ ...formData, location_city: text })}
                    placeholder="Enter your city"
                  />
                </View>
                <View>
                  <Label className="text-slate-500 font-bold ml-1">State</Label>
                  <TextInput
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 mt-2 text-slate-800 font-medium"
                    value={formData.location_state}
                    onChangeText={(text) => setFormData({ ...formData, location_state: text })}
                    placeholder="Enter your state"
                  />
                </View>
              </CardContent>
            </Card>

            <Card className="shadow-xl bg-white border-0 rounded-[24px]">
              <CardHeader>
                <CardTitle className="text-slate-800">Faith & Career</CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <View>
                  <Label className="text-slate-500 font-bold ml-1">Denomination</Label>
                  <TextInput
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 mt-2 text-slate-800 font-medium"
                    value={formData.denomination}
                    onChangeText={(text) => setFormData({ ...formData, denomination: text })}
                    placeholder="Enter your denomination"
                  />
                </View>
                <View>
                  <Label className="text-slate-500 font-bold ml-1">Church Name</Label>
                  <TextInput
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 mt-2 text-slate-800 font-medium"
                    value={formData.church_name}
                    onChangeText={(text) => setFormData({ ...formData, church_name: text })}
                    placeholder="Enter your church name"
                  />
                </View>
                <View>
                  <Label className="text-slate-500 font-bold ml-1">Occupation</Label>
                  <TextInput
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 mt-2 text-slate-800 font-medium"
                    value={formData.occupation}
                    onChangeText={(text) => setFormData({ ...formData, occupation: text })}
                    placeholder="Enter your occupation"
                  />
                </View>
                <View>
                  <Label className="text-slate-500 font-bold ml-1">Education Level</Label>
                  <TextInput
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 mt-2 text-slate-800 font-medium"
                    value={formData.education_level}
                    onChangeText={(text) => setFormData({ ...formData, education_level: text })}
                    placeholder="Enter your education level"
                  />
                </View>
              </CardContent>
            </Card>

            <Button 
              className="w-full h-14 rounded-2xl bg-primary shadow-lg" 
              onPress={handleSave} 
              disabled={isSaving}
            >
              <Text className="text-white font-bold text-lg">{isSaving ? "Saving..." : "Save Changes"}</Text>
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  )
}