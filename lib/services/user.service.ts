import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../constants"
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
  profile_complete?: boolean
  profileComplete?: boolean // Frontend field
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
  profile_complete?: boolean
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
  churchAttendance?: string
  location?: string
  ageRange?: {
    min: number
    max: number
  }
  maxDistance?: number
}

export interface OnboardingProgress {
  currentStep: number
  basicInfo?: {
    dateOfBirth: string
    gender: string
    locationCity: string
    locationState: string
  }
  questionnaireResponses?: QuestionnaireResponse[]
  preferences?: UserPreferences
  lastUpdated: string
}

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

class UserService {
  private transformUserProfile(backendUser: UserProfile): any {
    // Ensure both profile_complete and profileComplete are synchronized
    const profileComplete = backendUser.profile_complete === true
    
    return {
      ...backendUser,
      profile_complete: profileComplete,
      profileComplete: profileComplete
    }
  }

  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<ApiResponse<UserProfile>>(API_ENDPOINTS.USERS.PROFILE)
    
    if (!response.data) {
      throw new Error("No user data received from server")
    }
    
    console.log("[Anointed Innovations] Raw user data from backend:", response.data)
    
    // Transform the user data to ensure profileComplete is properly set
    const transformedUser = this.transformUserProfile(response.data)
    
    // Update AsyncStorage with the transformed user
    const userStr = await AsyncStorage.getItem("user")
    if (userStr) {
      const currentUser = JSON.parse(userStr)
      const updatedUser = { ...currentUser, ...transformedUser }
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser))
    }
    
    return response.data
  }

  async updateProfile(data: UpdateProfileData): Promise<{ success: boolean; message: string; user?: UserProfile }> {
    // Sync profileComplete with profile_complete if provided
    const syncData = { ...data }
    if ('profileComplete' in syncData) {
      syncData.profile_complete = syncData.profileComplete
    }
    if ('profile_complete' in syncData) {
      syncData.profileComplete = syncData.profile_complete
    }

    const response = await apiClient.put<ApiResponse<{ user?: UserProfile }>>(
      API_ENDPOINTS.USERS.UPDATE_PROFILE,
      syncData,
    )

    if (response.data?.user) {
      const userStr = await AsyncStorage.getItem("user")
      if (userStr) {
        const currentUser = JSON.parse(userStr)
        
        // Transform the updated user data
        const transformedUser = this.transformUserProfile(response.data.user)
        const updatedUser = { ...currentUser, ...transformedUser }
        
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser))
        console.log("[Anointed Innovations] User profile updated in AsyncStorage with profileComplete:", transformedUser.profileComplete)
      }
    }

    return {
      success: response.success,
      message: response.message,
      user: response.data?.user
    }
  }

  async uploadPhotos(files: any[]): Promise<Array<{ id: string; photo_url: string; is_primary: boolean }>> {
    const response = await apiClient.uploadFile<ApiResponse<Array<{ id: string; photo_url: string; is_primary: boolean }>>>(
      API_ENDPOINTS.USERS.UPLOAD_PHOTOS, 
      files
    )
    
    if (!response.data) {
      throw new Error("No photo data received from server")
    }
    
    return response.data
  }

  async deletePhoto(photoId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<ApiResponse>(API_ENDPOINTS.USERS.DELETE_PHOTO(photoId))
    return {
      success: response.success,
      message: response.message
    }
  }

  async setPrimaryPhoto(photoId: string): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.put<ApiResponse>(API_ENDPOINTS.USERS.SET_PRIMARY_PHOTO(photoId), {})
    return {
      success: response.success,
      data: response.data
    }
  }

  async getUserById(userId: string): Promise<UserProfile> {
    const response = await apiClient.get<ApiResponse<UserProfile>>(API_ENDPOINTS.USERS.GET_USER(userId))
    
    if (!response.data) {
      throw new Error("No user data received from server")
    }
    
    return response.data
  }

  async submitQuestionnaire(responses: QuestionnaireResponse[]): Promise<{ success: boolean; message: string }> {
    const result = await apiClient.post<ApiResponse>(API_ENDPOINTS.USERS.SUBMIT_QUESTIONNAIRE, { responses })
    
    // After submitting questionnaire, mark profile as complete
    if (result.success) {
      try {
        await this.updateProfile({ profile_complete: true, profileComplete: true })
        console.log("[Anointed Innovations] Profile marked as complete after questionnaire submission")
      } catch (error) {
        console.error("[Anointed Innovations] Error marking profile as complete:", error)
      }
    }
    
    return {
      success: result.success,
      message: result.message
    }
  }

  async getQuestionnaire(): Promise<QuestionnaireResponse[]> {
    const response = await apiClient.get<ApiResponse<QuestionnaireResponse[]>>(
      API_ENDPOINTS.USERS.GET_QUESTIONNAIRE,
    )
    
    if (!response.data) {
      throw new Error("No questionnaire data received from server")
    }
    
    return response.data
  }

  async updatePreferences(preferences: UserPreferences): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put<ApiResponse>(API_ENDPOINTS.USERS.UPDATE_PREFERENCES, preferences)
    return {
      success: response.success,
      message: response.message
    }
  }

  async getPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get<ApiResponse<UserPreferences>>(API_ENDPOINTS.USERS.PREFERENCES)
    
    if (!response.data) {
      throw new Error("No preferences data received from server")
    }
    
    return response.data
  }

  async deactivateAccount(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put<ApiResponse>(API_ENDPOINTS.USERS.DEACTIVATE, {})
    return {
      success: response.success,
      message: response.message
    }
  }

  async deleteAccount(password: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<ApiResponse>(API_ENDPOINTS.USERS.DELETE, { password, reason })
    return {
      success: response.success,
      message: response.message
    }
  }

  async saveOnboardingProgress(progress: OnboardingProgress): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.USERS.SAVE_ONBOARDING_PROGRESS, progress)
      return {
        success: response.success,
        message: response.message
      }
    } catch (error: any) {
      if (
        error.message?.includes("404") ||
        error.message?.includes("Route not found") ||
        error.message?.includes("HTML instead of JSON")
      ) {
        console.log("[Anointed Innovations] Onboarding progress endpoint not available - progress not saved")
        return { success: false, message: "Endpoint not available" }
      }
      throw error
    }
  }

  async getOnboardingProgress(): Promise<OnboardingProgress | null> {
    try {
      const response = await apiClient.get<ApiResponse<OnboardingProgress | null>>(
        API_ENDPOINTS.USERS.GET_ONBOARDING_PROGRESS,
      )
      return response.data ?? null
    } catch (error: any) {
      if (
        error.message?.includes("404") ||
        error.message?.includes("Route not found") ||
        error.message?.includes("HTML instead of JSON")
      ) {
        console.log("[Anointed Innovations] Onboarding progress endpoint not implemented yet - starting fresh")
        return null
      }
      console.log("[Anointed Innovations] No saved onboarding progress found")
      return null
    }
  }

  async clearOnboardingProgress(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<ApiResponse>(API_ENDPOINTS.USERS.SAVE_ONBOARDING_PROGRESS)
      return {
        success: response.success,
        message: response.message
      }
    } catch (error: any) {
      if (
        error.message?.includes("404") ||
        error.message?.includes("Route not found") ||
        error.message?.includes("HTML instead of JSON")
      ) {
        console.log("[Anointed Innovations] Onboarding progress endpoint not available - nothing to clear")
        return { success: true, message: "Nothing to clear" }
      }
      throw error
    }
  }

  // Helper method to explicitly mark profile as complete
  async markProfileComplete(): Promise<{ success: boolean; message: string }> {
    return this.updateProfile({ 
      profile_complete: true, 
      profileComplete: true 
    })
  }
}

export const userService = new UserService()