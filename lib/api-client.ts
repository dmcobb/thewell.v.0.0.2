import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_BASE_URL, API_ENDPOINTS } from "./constants"

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
  timeout?: number
  _isRetry?: boolean // Internal flag to prevent infinite retry loops
}

class ApiClient {
  private baseURL: string
  private defaultTimeout = 10000 // 10 seconds
  private isRefreshing = false // Flag to prevent multiple simultaneous refresh attempts
  private refreshPromise: Promise<string | null> | null = null // Store the refresh promise to reuse

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("authToken")
    } catch (error) {
      console.error("[Anointed Innovations] Error getting auth token:", error)
      return null
    }
  }

  private async refreshAuthToken(): Promise<string | null> {
    // If already refreshing, wait for that promise
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
      if (!refreshToken) {
        console.error("[Anointed Innovations] No refresh token available")
        return null
      }

      console.log("[Anointed Innovations] Attempting to refresh token...")

      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        console.error("[Anointed Innovations] Token refresh failed:", response.status)
        // Clear tokens if refresh fails
        await AsyncStorage.removeItem("authToken")
        await AsyncStorage.removeItem("refreshToken")
        await AsyncStorage.removeItem("user")
        return null
      }

      const data = await response.json()
      const newAccessToken = data.data?.accessToken || data.accessToken
      const newRefreshToken = data.data?.refreshToken || data.refreshToken

      if (newAccessToken) {
        await AsyncStorage.setItem("authToken", newAccessToken)
        if (newRefreshToken) {
          await AsyncStorage.setItem("refreshToken", newRefreshToken)
        }
        console.log("[Anointed Innovations] Token refreshed successfully")
        return newAccessToken
      }

      return null
    } catch (error) {
      console.error("[Anointed Innovations] Token refresh error:", error)
      return null
    }
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === "AbortError") {
        throw new Error("Request timeout - please check your network connection and backend server")
      }
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
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`
      }
    }

    const fullUrl = `${this.baseURL}${endpoint}`
    console.log("[Anointed Innovations] API Request:", {
      baseURL: this.baseURL,
      endpoint,
      fullUrl,
      method: restOptions.method || "GET",
    })

    try {
      const response = await this.fetchWithTimeout(
        fullUrl,
        {
          ...restOptions,
          headers: requestHeaders,
        },
        timeout,
      )

      console.log("[Anointed Innovations] Response status:", response.status)

      if (response.status === 401 && requiresAuth && !_isRetry) {
        console.log("[Anointed Innovations] Received 401, attempting token refresh...")
        const newToken = await this.refreshAuthToken()

        if (newToken) {
          console.log("[Anointed Innovations] Token refreshed, retrying request...")
          // Retry the request with the new token
          return this.request<T>(endpoint, { ...options, _isRetry: true })
        } else {
          console.error("[Anointed Innovations] Token refresh failed, user needs to login again")
          throw new Error("Session expired. Please login again.")
        }
      }

      console.log("[Anointed Innovations] Response content-type:", response.headers.get("content-type"))

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("text/html")) {
        const htmlText = await response.text()
        console.error("[Anointed Innovations] Backend returned HTML instead of JSON:")
        console.error("[Anointed Innovations] HTML Response:", htmlText.substring(0, 500))
        throw new Error(
          `Backend endpoint ${endpoint} returned HTML instead of JSON. Status: ${response.status}. This usually means the endpoint doesn't exist or has an error.`,
        )
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "An error occurred")
      }

      return data
    } catch (error: any) {
      console.error("[Anointed Innovations] API request error:", error)
      console.error("[Anointed Innovations] Failed URL:", fullUrl)
      console.error("[Anointed Innovations] Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })

      if (error.message?.includes("timeout")) {
        throw new Error("Connection timeout. Make sure your backend server is running.")
      }
      if (error.message?.includes("Network request failed")) {
        throw new Error(`Network error. Cannot reach ${fullUrl}. Is your backend running on port 5000?`)
      }
      throw error
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    })
  }

  async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    })
  }

  async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async uploadFile<T>(endpoint: string, file: any, options?: RequestOptions): Promise<T> {
    const token = await this.getAuthToken()
    const formData = new FormData()
    formData.append("file", file)

    const requestHeaders: Record<string, string> = {}
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Upload failed")
      }

      return data
    } catch (error) {
      console.error("[Anointed Innovations] File upload error:", error)
      throw error
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)