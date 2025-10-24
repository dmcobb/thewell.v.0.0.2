import AsyncStorage from "@react-native-async-storage/async-storage"
import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../constants"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: "male" | "female"
}

export interface BackendAuthResponse {
  success: boolean
  message: string
  data: {
    user: {
      id: string
      email: string
      first_name: string
      last_name: string
      is_verified: boolean
      is_active: boolean
      date_of_birth?: string
      gender?: string
      bio?: string
      location_city?: string
      location_state?: string
      profile_complete?: boolean
    }
    accessToken: string
    refreshToken: string
  }
}

// Frontend-friendly auth response
export interface AuthResponse {
  success: boolean
  token: string
  refreshToken: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    profileComplete: boolean
    emailVerified: boolean
    dateOfBirth?: string
    gender?: string
    bio?: string
    locationCity?: string
    locationState?: string
  }
}

class AuthService {
  private transformAuthResponse(backendResponse: BackendAuthResponse): AuthResponse {
    const { user, accessToken, refreshToken } = backendResponse.data

    // Use explicit boolean conversion - if profile_complete is true OR user has required fields
    const profileComplete = user.profile_complete === true || !!(user.date_of_birth && user.gender)

    return {
      success: backendResponse.success,
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profileComplete,
        emailVerified: user.is_verified,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        bio: user.bio,
        locationCity: user.location_city,
        locationState: user.location_state,
      },
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log("[Anointed Innovations] Calling backend login API...")
    const backendResponse = await apiClient.post<BackendAuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials, {
      requiresAuth: false,
    })

    console.log("[Anointed Innovations] Backend response received:", backendResponse)

    const response = this.transformAuthResponse(backendResponse)

    console.log("[Anointed Innovations] Transformed response:", response)

    if (response.token) {
      await AsyncStorage.setItem("authToken", response.token)
      await AsyncStorage.setItem("refreshToken", response.refreshToken)
      await AsyncStorage.setItem("user", JSON.stringify(response.user))
      console.log("[Anointed Innovations] Tokens and user saved to AsyncStorage")
    }

    return response
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const backendResponse = await apiClient.post<BackendAuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data, {
      requiresAuth: false,
    })

    const response = this.transformAuthResponse(backendResponse)

    if (response.token) {
      await AsyncStorage.setItem("authToken", response.token)
      await AsyncStorage.setItem("refreshToken", response.refreshToken)
      await AsyncStorage.setItem("user", JSON.stringify(response.user))
    }

    return response
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {})
    } catch (error) {
      console.error("[Anointed Innovations] Logout error:", error)
    } finally {
      await AsyncStorage.removeItem("authToken")
      await AsyncStorage.removeItem("refreshToken")
      await AsyncStorage.removeItem("user")
    }
  }

  async getCurrentUser() {
    try {
      const userStr = await AsyncStorage.getItem("user")
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error("[Anointed Innovations] Error getting current user:", error)
      return null
    }
  }

  async updateCurrentUser(updates: Partial<AuthResponse["user"]>) {
    try {
      const userStr = await AsyncStorage.getItem("user")
      if (userStr) {
        const currentUser = JSON.parse(userStr)
        
        // Handle profileComplete specifically to ensure it's a boolean
        const processedUpdates: any = { ...updates }
        
        // Ensure profileComplete is properly set as boolean
        if ('profileComplete' in processedUpdates) {
          processedUpdates.profileComplete = Boolean(processedUpdates.profileComplete)
        }
        
        const updatedUser = { ...currentUser, ...processedUpdates }
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser))
        console.log("[Anointed Innovations] User updated in AsyncStorage:", updatedUser)
        return updatedUser
      }
      return null
    } catch (error) {
      console.error("[Anointed Innovations] Error updating current user:", error)
      return null
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem("authToken")
    return !!token
  }

  async syncUserFromBackend(): Promise<AuthResponse["user"] | null> {
  try {
    console.log("[Anointed Innovations] Syncing user data from backend...")
    
    // Use the user service to get current user instead of direct API call
    const { userService } = await import("./user.service")
    const userProfile = await userService.getCurrentUser()
    
    console.log("[Anointed Innovations] User profile from backend:", userProfile)
    
    // Transform the backend user profile to frontend format
    const frontendUser = this.transformUserProfile(userProfile)
    
    await AsyncStorage.setItem("user", JSON.stringify(frontendUser))
    console.log("[Anointed Innovations] User synced from backend:", frontendUser)
    return frontendUser
  } catch (error) {
    console.error("[Anointed Innovations] Error syncing user from backend:", error)
    return null
  }
}

// Add this helper method to transform user profile
private transformUserProfile(backendUser: any): AuthResponse["user"] {
  console.log("[Anointed Innovations] Transforming user profile:", backendUser)
  
  // Use profile_complete from backend or calculate it
  const profileComplete = backendUser.profile_complete === true || 
                         !!(backendUser.date_of_birth && backendUser.gender)

  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName: backendUser.first_name,
    lastName: backendUser.last_name,
    profileComplete,
    emailVerified: backendUser.is_verified,
    dateOfBirth: backendUser.date_of_birth,
    gender: backendUser.gender,
    bio: backendUser.bio,
    locationCity: backendUser.location_city,
    locationState: backendUser.location_state,
  }
}

  async verifyEmail(token: string): Promise<{ success: boolean }> {
    return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token }, { requiresAuth: false })
  }

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }, { requiresAuth: false })
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword }, { requiresAuth: false })
  }
}

export const authService = new AuthService()