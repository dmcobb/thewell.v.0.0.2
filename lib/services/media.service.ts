import { apiClient } from "../api-client"

interface VideoUploadResponse {
  success: boolean
  data: {
    video_url: string
    thumbnail_url: string
    duration: number
  }
}

interface VideoStatusResponse {
  success: boolean
  data: {
    status: "processing" | "completed" | "failed"
    progress?: number
  }
}

class MediaService {
  async uploadProfileVideo(videoUri: string, onProgress?: (progress: number) => void): Promise<VideoUploadResponse> {
    try {
      // Create form data with video file
      const formData = new FormData()

      // Extract filename from URI
      const filename = videoUri.split("/").pop() || "profile-video.mp4"

      // @ts-ignore - React Native FormData accepts this format
      formData.append("video", {
        uri: videoUri,
        type: "video/mp4",
        name: filename,
      })

      const response = await fetch(`${apiClient["baseURL"]}/media/video/profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload video")
      }

      return data
    } catch (error) {
      console.error("[Anointed Innovations] Video upload error:", error)
      throw error
    }
  }

  async getVideoStatus(videoId: string): Promise<VideoStatusResponse> {
    return apiClient.get(`/media/video/status/${videoId}`)
  }

  async deleteProfileVideo(): Promise<{ success: boolean; message: string }> {
    return apiClient.delete("/media/video/profile")
  }

  async getVideoStreamUrl(videoKey: string): Promise<string> {
    return `${apiClient["baseURL"]}/media/video/stream/${videoKey}`
  }

  private async getToken(): Promise<string> {
    const AsyncStorage = await import("@react-native-async-storage/async-storage")
    return (await AsyncStorage.default.getItem("authToken")) || ""
  }
}

export const mediaService = new MediaService()
