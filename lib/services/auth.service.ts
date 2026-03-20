import AsyncStorage from "@react-native-async-storage/async-storage"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/constants"

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
      profile_complete?: boolean
      date_of_birth?: string
      gender?: string
      bio?: string
      location_city?: string
      location_state?: string
    }
    accessToken: string
    refreshToken: string
  }
}

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
    photos?: any[]
  }
}

class AuthService {
  private transformAuthResponse(backendResponse: BackendAuthResponse): AuthResponse | null {
    try {
      if (!backendResponse?.data?.user) {
        // Return null instead of throwing to avoid crashing the app-wide AuthProvider on mount
        return null;
      }

      const { user, accessToken, refreshToken } = backendResponse.data
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
    } catch (error) {
      console.error("[The Well] Transformation Error:", error)
      return null;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log("[The Well] Attempting login for:", credentials.email)
    const backendResponse = await apiClient.post<BackendAuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials, {
      requiresAuth: false,
    })

    const response = this.transformAuthResponse(backendResponse)

    if (response && response.token) {
      await AsyncStorage.setItem("authToken", response.token)
      await AsyncStorage.setItem("refreshToken", response.refreshToken)
      await AsyncStorage.setItem("user", JSON.stringify(response.user))
      return response;
    }

    throw new Error("Invalid login response from server.");
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    console.log("[The Well] Attempting register for:", data.email)
    const backendResponse = await apiClient.post<BackendAuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data, {
      requiresAuth: false,
    })

    const response = this.transformAuthResponse(backendResponse)

    if (response && response.token) {
      await AsyncStorage.setItem("authToken", response.token)
      await AsyncStorage.setItem("refreshToken", response.refreshToken)
      await AsyncStorage.setItem("user", JSON.stringify(response.user))
      return response;
    }

    throw new Error("Registration succeeded but user data was missing.");
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {})
    } catch (error) {
      console.error("[The Well] Logout error:", error)
    } finally {
      await AsyncStorage.removeItem("authToken")
      await AsyncStorage.removeItem("refreshToken")
      await AsyncStorage.removeItem("user")
    }
  }

  async getCurrentUser() {
    try {
      // Check if we have a token first to prevent unnecessary 401 errors on mount
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return null;

      const response = await apiClient.get<{ success: boolean; data: any }>(API_ENDPOINTS.USERS.PROFILE)
      const user = response.data
      
      if (!user) return null;

      const transformedUser = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        first_name: user.first_name,
        last_name: user.last_name,
        profileComplete: user.profile_complete ?? false,
        emailVerified: user.is_verified ?? false,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        bio: user.bio,
        locationCity: user.location_city,
        locationState: user.location_state,
        photos: user.photos || [],
      }

      await AsyncStorage.setItem("user", JSON.stringify(transformedUser))
      return transformedUser
    } catch (error) {
      // Log for debugging but return null so the AuthProvider moves to 'not authenticated' state
      console.log("[The Well] Session check: No active user session.");
      const userStr = await AsyncStorage.getItem("user")
      return userStr ? JSON.parse(userStr) : null
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
    try {
      return await apiClient.post<{ success: boolean }>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        { token, password: newPassword },
        { requiresAuth: false },
      )
    } catch (error) {
      console.error("[The Well] Reset password failed:", error)
      throw error
    }
  }

  async updateCurrentUser(updates: Partial<AuthResponse["user"]>) {
    try {
      const userStr = await AsyncStorage.getItem("user")
      if (userStr) {
        const currentUser = JSON.parse(userStr)
        const processedUpdates: any = { ...updates }

        if ("profileComplete" in processedUpdates) {
          processedUpdates.profileComplete = Boolean(processedUpdates.profileComplete)
        }

        const updatedUser = { ...currentUser, ...processedUpdates }
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser))
        return updatedUser
      }
      return null
    } catch (error) {
      console.error("[The Well] Error updating local user:", error)
      return null
    }
  }

  async syncUserFromBackend(): Promise<AuthResponse["user"] | null> {
    try {
      const { userService } = await import("./user.service")
      const userProfile = await userService.getCurrentUser()
      const frontendUser = this.transformUserProfile(userProfile)
      await AsyncStorage.setItem("user", JSON.stringify(frontendUser))
      return frontendUser
    } catch (error) {
      console.error("[The Well] Error syncing user:", error)
      return null
    }
  }

  private transformUserProfile(backendUser: any): AuthResponse["user"] {
    const profileComplete = backendUser.profile_complete === true || !!(backendUser.date_of_birth && backendUser.gender)
    return {
      id: backendUser.id,
      email: backendUser.email,
      firstName: backendUser.first_name,
      lastName: backendUser.last_name,
      first_name: backendUser.first_name,
      last_name: backendUser.last_name,
      profileComplete,
      emailVerified: backendUser.is_verified,
      dateOfBirth: backendUser.date_of_birth,
      gender: backendUser.gender,
      bio: backendUser.bio,
      locationCity: backendUser.location_city,
      locationState: backendUser.location_state,
      photos: backendUser.photos || [],
    } as any
  }
}

export const authService = new AuthService()