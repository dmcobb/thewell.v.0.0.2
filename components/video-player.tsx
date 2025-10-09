import { useState, useRef } from "react"
import { View, TouchableOpacity, Text } from "react-native"
import { Video, ResizeMode, type AVPlaybackStatus } from "expo-av"
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react-native"
import { Progress } from "@/components/ui/progress"
import { LinearGradient } from "expo-linear-gradient"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  videoUrl: string
  poster?: string
  className?: string
}

export function VideoPlayer({ videoUrl, poster, className = "" }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef<Video>(null)

  const togglePlay = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync()
      } else {
        await videoRef.current.playAsync()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = async () => {
    if (videoRef.current) {
      await videoRef.current.setIsMutedAsync(!isMuted)
      setIsMuted(!isMuted)
    }
  }

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis / 1000)
      setDuration(status.durationMillis ? status.durationMillis / 1000 : 0)
      setIsPlaying(status.isPlaying)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <View className={cn("relative bg-black rounded-xl overflow-hidden", className)}>
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={{ width: "100%", height: "100%" }}
        resizeMode={ResizeMode.COVER}
        isMuted={isMuted}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        useNativeControls={false}
      />

      {/* Play Button Overlay */}
      {!isPlaying && (
        <LinearGradient
          colors={["rgba(8, 145, 178, 0.3)", "rgba(139, 92, 246, 0.2)", "rgba(0, 0, 0, 0.2)", "transparent"]}
          className="absolute inset-0 items-center justify-center"
        >
          <TouchableOpacity
            onPress={togglePlay}
            className="bg-white/95 rounded-full w-16 h-16 items-center justify-center shadow-lg"
            activeOpacity={0.7}
          >
            <Play size={32} color="#8B5CF6" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* Controls */}
      {showControls && (
        <LinearGradient
          colors={["rgba(8, 145, 178, 0.8)", "rgba(139, 92, 246, 0.6)", "transparent"]}
          className="absolute bottom-0 left-0 right-0 p-4"
        >
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={togglePlay} className="p-2" activeOpacity={0.7}>
              {isPlaying ? <Pause size={16} color="white" /> : <Play size={16} color="white" />}
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleMute} className="p-2" activeOpacity={0.7}>
              {isMuted ? <VolumeX size={16} color="white" /> : <Volume2 size={16} color="white" />}
            </TouchableOpacity>

            <View className="flex-1 flex-row items-center gap-2">
              <Text className="text-white text-xs">{formatTime(currentTime)}</Text>
              <View className="flex-1">
                <Progress value={progressPercentage} className="h-1 bg-white/30" />
              </View>
              <Text className="text-white text-xs">{formatTime(duration)}</Text>
            </View>

            <TouchableOpacity className="p-2" activeOpacity={0.7}>
              <Maximize2 size={16} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      )}
    </View>
  )
}
