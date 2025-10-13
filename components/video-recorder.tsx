import { useState, useRef } from "react"
import { View, Text, Alert } from "react-native"
import { CameraView, useCameraPermissions } from "expo-camera"
import { Audio } from "expo-av"
import { Play, Square, RotateCcw, Check, AlertCircle, Waves, CheckCircle } from "lucide-react-native"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { LinearGradient } from "expo-linear-gradient"
import { cn } from "@/lib/utils"

interface VideoRecorderProps {
  onVideoRecorded?: (uri: string) => void
  maxDuration?: number
  className?: string
}

export function VideoRecorder({ onVideoRecorded, maxDuration = 60, className = "" }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedUri, setRecordedUri] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [cameraPermission, requestCameraPermission] = useCameraPermissions()
  const [audioPermission, setAudioPermission] = useState<boolean | null>(null)
  const cameraRef = useRef<CameraView>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useState(() => {
    requestAudioPermission()
  })

  const requestAudioPermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync()
      setAudioPermission(status === "granted")
    } catch (error) {
      console.error("[Anointed Innovations] Error requesting audio permission:", error)
      setAudioPermission(false)
    }
  }

  const startRecording = async () => {
    if (!cameraRef.current) return

    if (!cameraPermission?.granted) {
      Alert.alert("Permission Required", "Camera access is needed to record video")
      return
    }

    if (!audioPermission) {
      Alert.alert("Permission Required", "Microphone access is needed to record audio")
      await requestAudioPermission()
      return
    }

    try {
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          if (newTime >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          return newTime
        })
      }, 1000)

      const video = await cameraRef.current.recordAsync({
        maxDuration,
      })

      if (video) {
        console.log("[Anointed Innovations] Video recorded:", video.uri)
        setRecordedUri(video.uri)
        onVideoRecorded?.(video.uri)
      }
    } catch (error) {
      console.error("[Anointed Innovations] Error recording video:", error)
      Alert.alert("Error", "Failed to record video. Please try again.")
      setIsRecording(false)
    }
  }

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      try {
        await cameraRef.current.stopRecording()
      } catch (error) {
        console.error("[Anointed Innovations] Error stopping recording:", error)
      }
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const resetRecording = () => {
    setRecordedUri(null)
    setRecordingTime(0)
  }

  const confirmRecording = () => {
    if (recordedUri) {
      // Video is already passed via onVideoRecorded callback
      // This button just provides visual confirmation
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!cameraPermission || audioPermission === null) {
    return (
      <Card className={cn("shadow-lg", className)}>
        <CardContent className="p-4">
          <View className="aspect-video bg-ocean-50 rounded-xl items-center justify-center">
            <Waves size={48} color="#8B5CF6" />
            <Text className="text-sm text-slate-600 mt-2">Loading camera...</Text>
          </View>
        </CardContent>
      </Card>
    )
  }

  if (!cameraPermission.granted || !audioPermission) {
    return (
      <Card className={cn("shadow-lg", className)}>
        <CardContent className="p-4">
          <View className="aspect-video bg-red-50 rounded-xl items-center justify-center p-4">
            <AlertCircle size={48} color="#EF4444" />
            <Text className="text-sm text-red-600 text-center mt-2 mb-4">
              {!cameraPermission.granted && !audioPermission
                ? "Camera and microphone access needed"
                : !cameraPermission.granted
                  ? "Camera access needed"
                  : "Microphone access needed"}
            </Text>
            <Button
              onPress={async () => {
                if (!cameraPermission.granted) await requestCameraPermission()
                if (!audioPermission) await requestAudioPermission()
              }}
              size="sm"
            >
              Allow Access
            </Button>
          </View>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("shadow-lg", className)}>
      <CardContent className="p-4">
        <View className="relative bg-black rounded-xl overflow-hidden aspect-video mb-4">
          {!recordedUri ? (
            <>
              <CameraView ref={cameraRef} style={{ width: "100%", height: "100%" }} facing="front" mode="video" />

              {isRecording && (
                <LinearGradient
                  colors={["#0891B2", "#8B5CF6", "#0284C7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="absolute top-4 left-4 flex-row items-center gap-2 px-3 py-1 rounded-full"
                >
                  <View className="w-2 h-2 bg-white rounded-full" />
                  <Text className="text-white text-sm font-medium">Recording {formatTime(recordingTime)}</Text>
                </LinearGradient>
              )}

              {isRecording && (
                <View className="absolute bottom-4 left-4 right-4">
                  <Progress value={(recordingTime / maxDuration) * 100} className="h-2 bg-white/30" />
                </View>
              )}
            </>
          ) : (
            <View className="w-full h-full items-center justify-center bg-slate-800">
              <CheckCircle size={48} color="#10B981" />
              <Text className="text-white text-sm mt-2">Video recorded successfully!</Text>
              <Text className="text-white/70 text-xs mt-1">{formatTime(recordingTime)}</Text>
            </View>
          )}
        </View>

        <View className="gap-3">
          {!recordedUri ? (
            <Button
              onPress={isRecording ? stopRecording : startRecording}
              className={isRecording ? "bg-gradient-to-r from-primary via-secondary to-primary-light" : ""}
            >
              {isRecording ? (
                <View className="flex-row items-center gap-2">
                  <Square size={16} color="white" />
                  <Text className="text-white font-medium">Complete Story ({maxDuration - recordingTime}s left)</Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-2">
                  <Play size={16} color="white" />
                  <Text className="text-white font-medium">Share Your Story</Text>
                </View>
              )}
            </Button>
          ) : (
            <View className="flex-row gap-3">
              <Button onPress={resetRecording} variant="outline" className="flex-1 bg-transparent">
                <View className="flex-row items-center gap-2">
                  <RotateCcw size={16} color="#8B5CF6" />
                  <Text className="text-purple-500 font-medium">Re-record</Text>
                </View>
              </Button>
            </View>
          )}
        </View>

        {recordedUri && (
          <View className="mt-3 p-3 bg-gradient-to-r from-ocean-50 via-purple-50 to-ocean-50 border border-purple-200/50 rounded-xl flex-row items-center gap-2">
            <Check size={16} color="#8B5CF6" />
            <Text className="text-sm text-purple-500 font-medium">
              Your story flows beautifully! ({formatTime(recordingTime)})
            </Text>
          </View>
        )}
      </CardContent>
    </Card>
  )
}
