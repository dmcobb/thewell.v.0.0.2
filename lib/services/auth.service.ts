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

    const profileComplete = user.profile_complete ?? !!(user.date_of_birth && user.gender)

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

        const syncedUpdates: any = { ...updates }
        if ("profileComplete" in updates) {
          syncedUpdates.profile_complete = updates.profileComplete
        }
        if ("profile_complete" in (updates as any)) {
          syncedUpdates.profileComplete = (updates as any).profile_complete
        }

        const updatedUser = { ...currentUser, ...syncedUpdates }
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