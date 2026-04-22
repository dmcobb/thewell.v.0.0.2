import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants"
import { Platform } from "react-native"

const isDevelopment = process.env.NODE_ENV === 'development'

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
  timeout?: number
  _isRetry?: boolean 
}

class ApiClient {
  private baseURL: string
  private defaultTimeout = 10000 
  private isRefreshing = false 
  private refreshPromise: Promise<string | null> | null = null 

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("authToken")
    } catch (error) {
      if (isDevelopment) {
        console.error("[Anointed Innovations] Error getting auth token:", error)
      }
      return null
    }
  }

  private async refreshAuthToken(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this._performTokenRefresh()

    try {
      const newToken = await this.refreshPromise
      return newToken
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async _performTokenRefresh(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken")
      if (!refreshToken) return null

      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        await AsyncStorage.multiRemove(["authToken", "refreshToken", "user"])
        return null
      }

      const data = await response.json()
      const newAccessToken = data.data?.accessToken || data.accessToken
      const newRefreshToken = data.data?.refreshToken || data.refreshToken

      if (newAccessToken) {
        await AsyncStorage.setItem("authToken", newAccessToken)
        if (newRefreshToken) await AsyncStorage.setItem("refreshToken", newRefreshToken)
        return newAccessToken
      }
      return null
    } catch (error) {
      return null
    }
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeoutId)
      return response
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === "AbortError") throw new Error("Request timeout - check network/server")
      throw error
    }
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      requiresAuth = true,
      timeout = this.defaultTimeout,
      headers = {},
      _isRetry = false,
      ...restOptions
    } = options

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(headers as Record<string, string>),
    }

    if (requiresAuth) {
      const token = await this.getAuthToken()
      if (token) requestHeaders["Authorization"] = `Bearer ${token}`
    }

    try {
      const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
        ...restOptions,
        headers: requestHeaders,
      }, timeout)

      if (response.status === 401 && requiresAuth && !_isRetry) {
        const newToken = await this.refreshAuthToken()
        if (newToken) return this.request<T>(endpoint, { ...options, _isRetry: true })
        throw new Error("Session expired. Please login again.")
      }

      const contentType = response.headers.get("content-type")
      if (contentType && !contentType.includes("application/json")) {
         throw new Error(`Server returned non-JSON response (${response.status})`)
      }

      const responseClone = response.clone()
      let data: any = null
      try {
        data = await response.json()
      } catch (parseError) {
        const text = await responseClone.text().catch(() => null)
        const message = text || `Request failed (${response.status})`
        throw new Error(message)
      }

      if (!response.ok) {
        const errorMessage =
          data?.message || data?.error || `Request failed (${response.status})`
        throw new Error(errorMessage)
      }

      return data
    } catch (error: any) {
      throw error
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) })
  }

  async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) })
  }

  async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) })
  }

  async delete<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE", body: body ? JSON.stringify(body) : undefined })
  }

  async uploadFile<T>(endpoint: string, file: any, options?: RequestOptions): Promise<T> {
    const token = await this.getAuthToken()
    const formData = new FormData()

    // iOS FIX: Ensure the URI is correctly formatted for iOS native file system
    const uri = Platform.OS === "ios" ? file.uri.replace("file://", "") : file.uri

    formData.append("photos", {
      uri: uri,
      name: file.fileName || "upload.png",
      type: file.mimeType || "image/png",
    } as any)

    const requestHeaders: Record<string, string> = {}
    if (token) requestHeaders["Authorization"] = `Bearer ${token}`

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: requestHeaders,
      body: formData,
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Upload failed")
    return data
  }
}

export const apiClient = new ApiClient(API_BASE_URL)