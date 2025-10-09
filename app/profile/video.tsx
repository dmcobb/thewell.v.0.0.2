import { useState, useEffect } from "react"
import { View, Text, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { Video, ResizeMode } from "expo-av"
import { ArrowLeft, Trash2, Upload, CheckCircle, Play } from "lucide-react-native"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { VideoRecorder } from "@/components/video-recorder"
import { mediaService } from "@/lib/services/media.service"
import { useAuth } from "@/contexts/auth-context"
import { LinearGradient } from "expo-linear-gradient"

export default function ProfileVideoScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null)
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    loadExistingVideo()
  }, [])

  const loadExistingVideo = async () => {
    try {
      // Load existing video from user profile
      if (user?.profile_video_url) {
        setExistingVideoUrl(user.profile_video_url)
      }
    } catch (error) {
      console.error("[v0] Error loading existing video:", error)
    }
  }

  const handleVideoRecorded = (uri: string) => {
    console.log("[v0] Video recorded:", uri)
    setRecordedVideoUri(uri)
    setUploadSuccess(false)
  }

  const handleUploadVideo = async () => {
    if (!recordedVideoUri) {
      Alert.alert("Error", "No video to upload")
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const response = await mediaService.uploadProfileVideo(recordedVideoUri, (progress) => {
        setUploadProgress(progress)
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      console.log("[v0] Video uploaded successfully:", response)

      // Update existing video URL
      setExistingVideoUrl(response.data.video_url)
      setRecordedVideoUri(null)
      setUploadSuccess(true)

      Alert.alert("Success", "Your video profile has been uploaded successfully!", [
        {
          text: "OK",
          onPress: () => {
            setUploadSuccess(false)
          },
        },
      ])
    } catch (error: any) {
      console.error("[v0] Upload error:", error)
      Alert.alert("Upload Failed", error.message || "Failed to upload video. Please try again.")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDeleteVideo = async () => {
    Alert.alert("Delete Video", "Are you sure you want to delete your profile video?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setIsDeleting(true)
            await mediaService.deleteProfileVideo()
            setExistingVideoUrl(null)
            setRecordedVideoUri(null)
            Alert.alert("Success", "Your profile video has been deleted")
          } catch (error: any) {
            console.error("[v0] Delete error:", error)
            Alert.alert("Error", error.message || "Failed to delete video")
          } finally {
            setIsDeleting(false)
          }
        },
      },
    ])
  }

  const handleCancelRecording = () => {
    setRecordedVideoUri(null)
    setUploadSuccess(false)
  }

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={["#0891B2", "#8B5CF6", "#0284C7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="pt-12 pb-6 px-4"
      >
        <View className="flex-row items-center gap-3 mb-2">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white flex-1">Video Profile</Text>
        </View>
        <Text className="text-white/90 text-sm">Share your story and let your personality shine</Text>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">
        {/* Existing Video Section */}
        {existingVideoUrl && !recordedVideoUri && (
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-slate-800">Current Video Profile</Text>
                <Button
                  onPress={handleDeleteVideo}
                  variant="outline"
                  size="sm"
                  disabled={isDeleting}
                  className="bg-transparent border-red-200"
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <View className="flex-row items-center gap-2">
                      <Trash2 size={14} color="#EF4444" />
                      <Text className="text-red-500 text-xs font-medium">Delete</Text>
                    </View>
                  )}
                </Button>
              </View>

              <View className="bg-black rounded-xl overflow-hidden aspect-video">
                <Video
                  source={{ uri: existingVideoUrl }}
                  style={{ width: "100%", height: "100%" }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                />
              </View>

              <View className="mt-3 p-3 bg-gradient-to-r from-ocean-50 via-purple-50 to-ocean-50 border border-purple-200/50 rounded-xl flex-row items-center gap-2">
                <CheckCircle size={16} color="#8B5CF6" />
                <Text className="text-sm text-purple-500 font-medium">Your video is live on your profile</Text>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Recording Instructions */}
        {!recordedVideoUri && !existingVideoUrl && (
          <Card className="shadow-lg border-2 border-purple-200/50">
            <CardContent className="p-4">
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 bg-gradient-to-br from-ocean-400 to-purple-500 rounded-full items-center justify-center">
                  <Play size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-slate-800 mb-2">Tips for a Great Video</Text>
                  <View className="gap-2">
                    <Text className="text-sm text-slate-600">• Find good lighting and a quiet space</Text>
                    <Text className="text-sm text-slate-600">• Share what makes you unique</Text>
                    <Text className="text-sm text-slate-600">• Be authentic and smile!</Text>
                    <Text className="text-sm text-slate-600">• Keep it under 60 seconds</Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Video Recorder */}
        {!existingVideoUrl && <VideoRecorder onVideoRecorded={handleVideoRecorded} maxDuration={60} />}

        {/* Upload Section */}
        {recordedVideoUri && !isUploading && !uploadSuccess && (
          <Card className="shadow-lg">
            <CardContent className="p-4 gap-3">
              <View className="flex-row items-center gap-2 mb-2">
                <CheckCircle size={20} color="#10B981" />
                <Text className="text-base font-semibold text-slate-800">Ready to Upload</Text>
              </View>

              <Button onPress={handleUploadVideo} className="bg-gradient-to-r from-ocean-500 to-purple-500">
                <View className="flex-row items-center gap-2">
                  <Upload size={16} color="white" />
                  <Text className="text-white font-semibold">Upload Video Profile</Text>
                </View>
              </Button>

              <Button onPress={handleCancelRecording} variant="outline" className="bg-transparent">
                <Text className="text-slate-600 font-medium">Cancel</Text>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <View className="items-center gap-3">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="text-base font-semibold text-slate-800">Uploading Your Video...</Text>
                <Progress value={uploadProgress} className="w-full h-3" />
                <Text className="text-sm text-slate-600">{uploadProgress}% complete</Text>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <Card className="shadow-lg border-2 border-green-200">
            <CardContent className="p-4">
              <View className="items-center gap-3">
                <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center">
                  <CheckCircle size={32} color="#10B981" />
                </View>
                <Text className="text-lg font-bold text-slate-800">Upload Successful!</Text>
                <Text className="text-sm text-slate-600 text-center">
                  Your video profile is now live and visible to potential matches
                </Text>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Replace Video Option */}
        {existingVideoUrl && !recordedVideoUri && (
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <Text className="text-base font-semibold text-slate-800 mb-3">Want to update your video?</Text>
              <Button
                onPress={() => setExistingVideoUrl(null)}
                variant="outline"
                className="bg-transparent border-purple-200"
              >
                <View className="flex-row items-center gap-2">
                  <Upload size={16} color="#8B5CF6" />
                  <Text className="text-purple-500 font-medium">Record New Video</Text>
                </View>
              </Button>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </View>
  )
}
