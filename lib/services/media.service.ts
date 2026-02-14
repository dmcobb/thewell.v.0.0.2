import { apiClient } from "../api-client"
import { API_BASE_URL, API_ENDPOINTS } from "../constants"

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

      const uploadUrl = `${API_BASE_URL}${API_ENDPOINTS.MEDIA.UPLOAD_VIDEO}`

      const token = await this.getToken()

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

       const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        const textError = await response.text()
        console.error("[debug] uploadProfileVideo: Non-JSON response:", textError.substring(0, 200))
        throw new Error(`Server error (${response.status}): ${textError.substring(0, 100)}`)
      }


      const data = await response.json()

      if (!response.ok) {
        console.error("[debug] uploadProfileVideo: Upload failed with status", response.status)
        throw new Error(data.message || "Failed to upload video")
      }

      return data
    } catch (error) {
      console.error("[Anointed Innovations] Video upload error:", error)
      console.error("[debug] uploadProfileVideo: Error details:", error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  async getVideoStatus(videoId: string): Promise<VideoStatusResponse> {
    const result = await apiClient.get<VideoStatusResponse>(`${API_ENDPOINTS.MEDIA.UPLOAD_VIDEO}status/${videoId}`)
    return result
  }

  async deleteProfileVideo(): Promise<{ success: boolean; message: string }> {
    const result = await apiClient.delete<{ success: boolean; message: string }>(`${API_ENDPOINTS.MEDIA.UPLOAD_VIDEO}`)
    return result
  }

  async getVideoStreamUrl(videoKey: string): Promise<string> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.MEDIA.UPLOAD_VIDEO}${videoKey}`
    console.log("[debug] getVideoStreamUrl: Generated URL:", url)
    return url
  }

  private async getToken(): Promise<string> {
    const AsyncStorage = await import("@react-native-async-storage/async-storage")
    const token = await AsyncStorage.default.getItem("authToken")
    return token || ""
  }
}

export const mediaService = new MediaService()
