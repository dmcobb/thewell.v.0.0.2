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
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={["#0891B2", "#0284C7", "#8B5CF6", "#0369A1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <View className="px-4 pt-12 pb-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white">Edit Account</Text>
            <Button variant="ghost" size="sm" onPress={handleSave} disabled={isSaving}>
              <Save size={20} color="white" />
            </Button>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-6">
        {isLoading ? (
          <View className="items-center justify-center py-12">
            <Text className="text-muted-foreground">Loading your profile...</Text>
          </View>
        ) : (
          <View className="gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
              </CardHeader>
              <CardContent className="items-center">
                <Avatar className="w-32 h-32 mb-4">
                  {primaryPhoto ? <AvatarImage source={{ uri: primaryPhoto }} /> : null}
                  <AvatarFallback className="bg-primary">
                    <Text className="text-white text-3xl font-semibold">{formData.first_name?.[0] || "U"}</Text>
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline">
                  <Camera size={16} />
                  <Text className="ml-2">Change Photo</Text>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <View>
                  <Label>First Name</Label>
                  <TextInput
                    className="border border-input rounded-lg px-4 py-3 mt-2"
                    value={formData.first_name}
                    onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                    placeholder="Enter your first name"
                  />
                </View>
                <View>
                  <Label>Last Name</Label>
                  <TextInput
                    className="border border-input rounded-lg px-4 py-3 mt-2"
                    value={formData.last_name}
                    onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                    placeholder="Enter your last name"
                  />
                </View>
                <View>
                  <Label>Bio</Label>
                  <TextInput
                    className="border border-input rounded-lg px-4 py-3 mt-2"
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

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <View>
                  <Label>City</Label>
                  <TextInput
                    className="border border-input rounded-lg px-4 py-3 mt-2"
                    value={formData.location_city}
                    onChangeText={(text) => setFormData({ ...formData, location_city: text })}
                    placeholder="Enter your city"
                  />
                </View>
                <View>
                  <Label>State</Label>
                  <TextInput
                    className="border border-input rounded-lg px-4 py-3 mt-2"
                    value={formData.location_state}
                    onChangeText={(text) => setFormData({ ...formData, location_state: text })}
                    placeholder="Enter your state"
                  />
                </View>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Faith & Career</CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <View>
                  <Label>Denomination</Label>
                  <TextInput
                    className="border border-input rounded-lg px-4 py-3 mt-2"
                    value={formData.denomination}
                    onChangeText={(text) => setFormData({ ...formData, denomination: text })}
                    placeholder="Enter your denomination"
                  />
                </View>
                <View>
                  <Label>Church Name</Label>
                  <TextInput
                    className="border border-input rounded-lg px-4 py-3 mt-2"
                    value={formData.church_name}
                    onChangeText={(text) => setFormData({ ...formData, church_name: text })}
                    placeholder="Enter your church name"
                  />
                </View>
                <View>
                  <Label>Occupation</Label>
                  <TextInput
                    className="border border-input rounded-lg px-4 py-3 mt-2"
                    value={formData.occupation}
                    onChangeText={(text) => setFormData({ ...formData, occupation: text })}
                    placeholder="Enter your occupation"
                  />
                </View>
                <View>
                  <Label>Education Level</Label>
                  <TextInput
                    className="border border-input rounded-lg px-4 py-3 mt-2"
                    value={formData.education_level}
                    onChangeText={(text) => setFormData({ ...formData, education_level: text })}
                    placeholder="Enter your education level"
                  />
                </View>
              </CardContent>
            </Card>

            <Button className="w-full h-12" onPress={handleSave} disabled={isSaving}>
              <Text className="text-white font-medium">{isSaving ? "Saving..." : "Save Changes"}</Text>
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  )
}