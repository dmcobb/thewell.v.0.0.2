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

export interface AuthResponse {
  success: boolean
  token: string
  refreshToken?: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    profileComplete: boolean
    emailVerified?: boolean
    dateOfBirth?: string
    gender?: string
  }
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials, { requiresAuth: false })

    if (response.token) {
      await AsyncStorage.setItem("authToken", response.token)
      await AsyncStorage.setItem("user", JSON.stringify(response.user))
    }

    return response
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data, { requiresAuth: false })

    if (response.token) {
      await AsyncStorage.setItem("authToken", response.token)
      await AsyncStorage.setItem("user", JSON.stringify(response.user))
    }

    return response
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {})
    } catch (error) {
      console.error("[v0] Logout error:", error)
    } finally {
      await AsyncStorage.removeItem("authToken")
      await AsyncStorage.removeItem("user")
    }
  }

  async getCurrentUser() {
    try {
      const userStr = await AsyncStorage.getItem("user")
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error("[v0] Error getting current user:", error)
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
