// lib/services/user.service.ts
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/constants"
import AsyncStorage from "@react-native-async-storage/async-storage"

const isDevelopment = process.env.NODE_ENV === 'development'

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
  church_attendance_frequency?: string
  occupation: string
  education_level: string
  height_cm?: number | null
  smoking_status?: string
  drinking_status?: string
  has_children: boolean
  children_count?: number | null
  children_ages?: string
  wants_children: boolean
  relationship_status?: string
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
  terms_accepted?: boolean
  terms_accepted_at?: string
  terms_version?: string
}

export interface UpdateProfileData {
  first_name?: string
  last_name?: string
  bio?: string
  gender?: string
  location_city?: string
  location_state?: string
  denomination?: string
  church_name?: string
  church_attendance_frequency?: string
  occupation?: string
  education_level?: string
  height_cm?: number | null
  smoking_status?: string
  drinking_status?: string
  has_children?: boolean
  children_count?: number | null
  children_ages?: string
  wants_children?: boolean
  relationship_status?: string
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

export interface BlockedUser {
  userId: string
  blockedAt: string
  reason?: string
}

const BLOCKED_USERS_KEY = '@thewell:blocked_users'

class UserService {
  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<{ success: boolean; data: UserProfile }>(API_ENDPOINTS.USERS.PROFILE)

    if (response && response.success && response.data) {
      await AsyncStorage.setItem("user", JSON.stringify(response.data))
      return response.data
    }
    throw new Error("Failed to fetch current user profile")
  }

  async updateProfile(data: UpdateProfileData): Promise<{ success: boolean; message: string; user?: UserProfile }> {
    const response = await apiClient.put<{ success: boolean; message: string; user?: UserProfile }>(
      API_ENDPOINTS.USERS.UPDATE_PROFILE,
      data,
    )

    if (response && response.user) {
      const userStr = await AsyncStorage.getItem("user")
      if (userStr) {
        const currentUser = JSON.parse(userStr)
        const updatedUser = { ...currentUser, ...response.user }
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser))
      }
    }

    return response || { success: false, message: "Network error or invalid response" }
  }

  async uploadPhotos(files: any[]): Promise<Array<{ id: string; photo_url: string; is_primary: boolean }>> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("photos", {
        uri: file.uri,
        type: 'image/jpeg',
        name: file.uri.split('/').pop() || 'photo.jpg',
      } as any)
    })

    const response = await apiClient.post<{
      success: boolean
      data: Array<{ id: string; photo_url: string; is_primary: boolean }>
    }>(API_ENDPOINTS.USERS.UPLOAD_PHOTOS, formData)
    
    return response?.data || []
  }

  async uploadProfileVideo(videoFile: { uri: string; type: string; name: string }): Promise<{ video_url: string; thumbnail_url: string; duration: number }> {
    const formData = new FormData()
    formData.append("video", {
      uri: videoFile.uri,
      type: videoFile.type,
      name: videoFile.name,
    } as any)

    const response = await apiClient.post<{
      success: boolean
      data: { video_url: string; thumbnail_url: string; duration: number }
    }>(API_ENDPOINTS.MEDIA.UPLOAD_VIDEO, formData)
    
    if (response && response.data) {
      return response.data
    }
    throw new Error("Video upload failed")
  }

  async uploadAndSetPrimaryPhoto(file: any) {
    const response = await apiClient.uploadFile<{
      success: boolean;
      data: Array<{ id: string; photo_url: string; is_primary: boolean }>;
    }>(API_ENDPOINTS.USERS.UPLOAD_PHOTOS, file);

    if (response && response.success && response.data && response.data.length > 0) {
      const photoId = response.data[0].id;
      await this.setPrimaryPhoto(photoId);
      return response.data[0];
    }
    throw new Error("Failed to upload photo");
  }

  async deletePhoto(photoId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(API_ENDPOINTS.USERS.DELETE_PHOTO(photoId))
    return response || { success: false, message: "Delete operation failed" }
  }

  async setPrimaryPhoto(photoId: string): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.put<{ success: boolean; data: any }>(API_ENDPOINTS.USERS.SET_PRIMARY_PHOTO(photoId), {})
    return response || { success: false, data: null }
  }

  async getUserById(userId: string): Promise<UserProfile> {
    const response = await apiClient.get<{ success: boolean; data: UserProfile }>(API_ENDPOINTS.USERS.GET_USER(userId))
    if (response && response.data) {
      return response.data
    }
    throw new Error("User not found")
  }

  async submitQuestionnaire(responses: QuestionnaireResponse[]): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.USERS.SUBMIT_QUESTIONNAIRE, { responses })
    return response || { success: false, message: "Questionnaire submission failed" }
  }

  async getQuestionnaire(): Promise<QuestionnaireResponse[]> {
    const response = await apiClient.get<{ success: boolean; data: QuestionnaireResponse[] }>(
      API_ENDPOINTS.USERS.GET_QUESTIONNAIRE,
    )
    return response?.data || []
  }

  async updatePreferences(preferences: UserPreferences): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put<{ success: boolean; message: string }>(API_ENDPOINTS.USERS.UPDATE_PREFERENCES, preferences)
    return response || { success: false, message: "Preference update failed" }
  }

  async getPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get<{ success: boolean; data: UserPreferences }>(API_ENDPOINTS.USERS.PREFERENCES)
    if (response && response.data) {
      return response.data
    }
    return {}
  }

  async deactivateAccount(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put<{ success: boolean; message: string }>(API_ENDPOINTS.USERS.DEACTIVATE, {})
    return response || { success: false, message: "Account deactivation failed" }
  }

  async deleteAccount(password: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(API_ENDPOINTS.USERS.DELETE, { password, reason })
    return response || { success: false, message: "Account deletion failed" }
  }
  
  async saveOnboardingProgress(progress: OnboardingProgress): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.USERS.SAVE_ONBOARDING_PROGRESS, progress)
      return response || { success: false, message: "Save operation returned no result" }
    } catch (error: any) {
      if (
        error.message?.includes("404") ||
        error.message?.includes("Route not found") ||
        error.message?.includes("HTML instead of JSON")
      ) {
        if (isDevelopment) {
          console.log("[Anointed Innovations] Onboarding progress endpoint not available - progress not saved")
        }
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
      return response?.data || null
    } catch (error: any) {
      if (
        error.message?.includes("404") ||
        error.message?.includes("Route not found") ||
        error.message?.includes("HTML instead of JSON")
      ) {
        if (isDevelopment) {
          console.log("[Anointed Innovations] Onboarding progress endpoint not implemented yet - starting fresh")
        }
        return null
      }
      if (isDevelopment) {
        console.log("[Anointed Innovations] No saved onboarding progress found")
      }
      return null
    }
  }

  async clearOnboardingProgress(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(API_ENDPOINTS.USERS.SAVE_ONBOARDING_PROGRESS)
      return response || { success: true, message: "Nothing to clear" }
    } catch (error: any) {
      if (
        error.message?.includes("404") ||
        error.message?.includes("Route not found") ||
        error.message?.includes("HTML instead of JSON")
      ) {
        if (isDevelopment) {
          console.log("[Anointed Innovations] Onboarding progress endpoint not available - nothing to clear")
        }
        return { success: true, message: "Nothing to clear" }
      }
      throw error
    }
  }

  // ==================== BLOCKING & REPORTING ====================

  /**
   * Report a user for inappropriate content or behavior
   */
  async reportUser(userId: string, reason: string, description?: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.USERS.REPORT_USER(userId),
      { reason, description }
    )
    return response
  }

  /**
   * Block a user - removes them from feed and prevents future matches
   */
  async blockUser(userId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      // Call backend to block user
      const response = await apiClient.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.USERS.BLOCK_USER(userId),
        { reason }
      )

      if (response.success) {
        // Add to local blocked list for immediate UI filtering
        await this.addToBlockedList(userId, reason)
      }

      return response
    } catch (error: any) {
      console.error('[UserService] Block user error:', error);
      throw error;
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(
        API_ENDPOINTS.USERS.UNBLOCK_USER(userId)
      )

      if (response.success) {
        // Remove from local blocked list
        await this.removeFromBlockedList(userId)
      }

      return response
    } catch (error: any) {
      console.error('[UserService] Unblock user error:', error);
      throw error;
    }
  }

  /**
   * Get list of blocked user IDs from local storage
   */
  async getBlockedUserIds(): Promise<string[]> {
    try {
      const blockedJson = await AsyncStorage.getItem(BLOCKED_USERS_KEY)
      if (blockedJson) {
        const blockedUsers: BlockedUser[] = JSON.parse(blockedJson)
        return blockedUsers.map(u => u.userId)
      }
      return []
    } catch (error) {
      console.error('[UserService] Error getting blocked users:', error)
      return []
    }
  }

  /**
   * Get full blocked user list with metadata
   */
  async getBlockedUsers(): Promise<BlockedUser[]> {
    try {
      const blockedJson = await AsyncStorage.getItem(BLOCKED_USERS_KEY)
      if (blockedJson) {
        return JSON.parse(blockedJson)
      }
      return []
    } catch (error) {
      console.error('[UserService] Error getting blocked users:', error)
      return []
    }
  }

  /**
   * Add user to local blocked list
   */
  private async addToBlockedList(userId: string, reason?: string): Promise<void> {
    try {
      const currentList = await this.getBlockedUsers()
      
      // Check if already blocked
      if (currentList.find(u => u.userId === userId)) {
        return
      }

      const newBlock: BlockedUser = {
        userId,
        blockedAt: new Date().toISOString(),
        reason
      }

      const updatedList = [...currentList, newBlock]
      await AsyncStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(updatedList))
    } catch (error) {
      console.error('[UserService] Error adding to blocked list:', error)
    }
  }

  /**
   * Remove user from local blocked list
   */
  private async removeFromBlockedList(userId: string): Promise<void> {
    try {
      const currentList = await this.getBlockedUsers()
      const updatedList = currentList.filter(u => u.userId !== userId)
      await AsyncStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(updatedList))
    } catch (error) {
      console.error('[UserService] Error removing from blocked list:', error)
    }
  }

  /**
   * Sync blocked users from server
   */
  async syncBlockedUsers(): Promise<void> {
    try {
      const response = await apiClient.get<{ success: boolean; data: string[] }>(
        API_ENDPOINTS.USERS.GET_BLOCKED_USERS
      )
      
      if (response.success && response.data) {
        const blockedUsers: BlockedUser[] = response.data.map(userId => ({
          userId,
          blockedAt: new Date().toISOString()
        }))
        await AsyncStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(blockedUsers))
      }
    } catch (error) {
      console.error('[UserService] Error syncing blocked users:', error)
    }
  }

  // ==================== TERMS & EULA ====================

  /**
   * Accept Terms of Service and Privacy Policy
   */
  async acceptTerms(version: string = '1.0'): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.USERS.ACCEPT_TERMS,
      { version }
    )
    
    if (response.success) {
      // Update local user data
      const userStr = await AsyncStorage.getItem("user")
      if (userStr) {
        const currentUser = JSON.parse(userStr)
        currentUser.terms_accepted = true
        currentUser.terms_accepted_at = new Date().toISOString()
        currentUser.terms_version = version
        await AsyncStorage.setItem("user", JSON.stringify(currentUser))
      }
    }
    
    return response
  }

  /**
   * Check if user has accepted current terms
   */
  async hasAcceptedTerms(): Promise<{ accepted: boolean; version?: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: { accepted: boolean; version: string } }>(
        API_ENDPOINTS.USERS.TERMS_STATUS
      )
      return response.data || { accepted: false }
    } catch (error) {
      return { accepted: false }
    }
  }
}

export const userService = new UserService()
