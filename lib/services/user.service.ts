import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/constants"
import AsyncStorage from "@react-native-async-storage/async-storage"

export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  bio: string
  location_city: string
  location_state: string
  date_of_birth: string
  gender: string
  denomination: string
  church_name: string
  occupation: string
  education_level: string
  height_cm: number
  has_children: boolean
  children_count: number
  wants_children: boolean
  profile_video_url: string | null
  profile_video_thumbnail_url: string | null
  photos: Array<{
    id: string
    photo_url: string
    is_primary: boolean
    display_order: number
  }> | null
  is_verified: boolean
  is_active: boolean
  last_active_at: string
  created_at: string
  profileComplete?: boolean
}

export interface UpdateProfileData {
  first_name?: string
  last_name?: string
  bio?: string
  location_city?: string
  location_state?: string
  denomination?: string
  church_name?: string
  occupation?: string
  education_level?: string
  height_cm?: number
  has_children?: boolean
  children_count?: number
  wants_children?: boolean
  profileComplete?: boolean
}

export interface QuestionnaireResponse {
  section: string
  question_id: string
  question_text: string
  response_type: string
  response_value: string
  response_scale: number | null
}

export interface UserPreferences {
  lookingFor?: string
  denomination?: string
  sameDenomination?: boolean
  churchAttendance?: string
  location?: string
  ageRange?: {
    min: number
    max: number
  }
  racePreference?: string
  maxDistance?: number
}

export interface OnboardingProgress {
  currentStep: number
  basicInfo?: {
    gender: string
    locationCity: string
    locationState: string
    phoneNumber?: string
    profileImage?: string | null
  }
  questionnaireResponses?: QuestionnaireResponse[]
  preferences?: UserPreferences
  lastUpdated: string
}

class UserService {
  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<{ success: boolean; data: UserProfile }>(API_ENDPOINTS.USERS.PROFILE)
    return response.data
  }

  async updateProfile(data: UpdateProfileData): Promise<{ success: boolean; message: string; user?: UserProfile }> {
    const response = await apiClient.put<{ success: boolean; message: string; user?: UserProfile }>(
      API_ENDPOINTS.USERS.UPDATE_PROFILE,
      data,
    )

    if (response.user) {
      const userStr = await AsyncStorage.getItem("user")
      if (userStr) {
        const currentUser = JSON.parse(userStr)
        const updatedUser = { ...currentUser, ...response.user }
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser))
      }
    }

    return response
  }

  async uploadPhotos(files: any[]): Promise<Array<{ id: string; photo_url: string; is_primary: boolean }>> {
    const response = await apiClient.uploadFile<{
      success: boolean
      data: Array<{ id: string; photo_url: string; is_primary: boolean }>
    }>(API_ENDPOINTS.USERS.UPLOAD_PHOTOS, files)
    return response.data
  }

  async deletePhoto(photoId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(API_ENDPOINTS.USERS.DELETE_PHOTO(photoId))
  }

  async setPrimaryPhoto(photoId: string): Promise<{ success: boolean; data: any }> {
    return apiClient.put(API_ENDPOINTS.USERS.SET_PRIMARY_PHOTO(photoId), {})
  }

  async getUserById(userId: string): Promise<UserProfile> {
    const response = await apiClient.get<{ success: boolean; data: UserProfile }>(API_ENDPOINTS.USERS.GET_USER(userId))
    return response.data
  }

  async submitQuestionnaire(responses: QuestionnaireResponse[]): Promise<{ success: boolean; message: string }> {
    return apiClient.post(API_ENDPOINTS.USERS.SUBMIT_QUESTIONNAIRE, { responses })
  }

  async getQuestionnaire(): Promise<QuestionnaireResponse[]> {
    const response = await apiClient.get<{ success: boolean; data: QuestionnaireResponse[] }>(
      API_ENDPOINTS.USERS.GET_QUESTIONNAIRE,
    )
    return response.data
  }

  async updatePreferences(preferences: UserPreferences): Promise<{ success: boolean; message: string }> {
    return apiClient.put(API_ENDPOINTS.USERS.UPDATE_PREFERENCES, preferences)
  }

  async getPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get<{ success: boolean; data: UserPreferences }>(API_ENDPOINTS.USERS.PREFERENCES)
    return response.data
  }

  async deactivateAccount(): Promise<{ success: boolean; message: string }> {
    return apiClient.put(API_ENDPOINTS.USERS.DEACTIVATE, {})
  }

  async deleteAccount(password: string, reason?: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(API_ENDPOINTS.USERS.DELETE, { password, reason })
  }

  async saveOnboardingProgress(progress: OnboardingProgress): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient.post(API_ENDPOINTS.USERS.SAVE_ONBOARDING_PROGRESS, progress)
    } catch (error: any) {
      if (
        error.message?.includes("404") ||
        error.message?.includes("Route not found") ||
        error.message?.includes("HTML instead of JSON")
      ) {
        return { success: false, message: "Endpoint not available" }
      }
      throw error
    }
  }

  async getOnboardingProgress(): Promise<OnboardingProgress | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: OnboardingProgress | null }>(
        API_ENDPOINTS.USERS.GET_ONBOARDING_PROGRESS,
      )
      return response.data
    } catch (error: any) {
      if (
        error.message?.includes("404") ||
        error.message?.includes("Route not found") ||
        error.message?.includes("HTML instead of JSON")
      ) {
        return null
      }
      return null
    }
  }

  async clearOnboardingProgress(): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient.delete(API_ENDPOINTS.USERS.SAVE_ONBOARDING_PROGRESS)
    } catch (error: any) {
      if (
        error.message?.includes("404") ||
        error.message?.includes("Route not found") ||
        error.message?.includes("HTML instead of JSON")
      ) {
        return { success: true, message: "Nothing to clear" }
      }
      throw error
    }
  }
}

export const userService = new UserService()
