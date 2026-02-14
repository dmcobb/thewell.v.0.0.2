import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants"

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
      } else {
        console.warn("[Anointed Innovations] No auth token found for authenticated request")
      }
    }

    const fullUrl = `${this.baseURL}${endpoint}`

    try {
      const response = await this.fetchWithTimeout(
        fullUrl,
        {
          ...restOptions,
          headers: requestHeaders,
        },
        timeout,
      )


      if (response.status === 401 && requiresAuth && !_isRetry) {
        const newToken = await this.refreshAuthToken()

        if (newToken) {
          // Retry the request with the new token
          return this.request<T>(endpoint, { ...options, _isRetry: true })
        } else {
          console.error("[Anointed Innovations] Token refresh failed, user needs to login again")
          throw new Error("Session expired. Please login again.")
        }
      }


      const contentType = response.headers.get("content-type")

      if (contentType && !contentType.includes("application/json")) {
        const textError = await response.text()
        console.error(`[Anointed Innovations] Non-JSON response from ${endpoint}:`, textError.substring(0, 200))
        throw new Error(`Server returned ${response.status}: ${response.statusText}. Check if the endpoint exists.`)
      }

      const data = await response.json()

      if (!response.ok) {
        // Check if it's a validation error with field-specific messages
        if (data.error && typeof data.error === "object") {
          const fieldErrors = Object.entries(data.error)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(", ")
          const errorMessage = `${data.message || "Validation failed"} - ${fieldErrors}`
          console.error(`[Anointed Innovations] API Error [${response.status}] at ${endpoint}:`, data)
          throw new Error(errorMessage)
        }

        const errorMessage = data.message || data.error || `Request failed with status ${response.status}`
        console.error(`[Anointed Innovations] API Error [${response.status}] at ${endpoint}:`, data)
        throw new Error(errorMessage)
      }

      return data
    } catch (error: any) {
      // Re-throw if it's already an Error object we created
      if (error.message && !error.message.includes("Unexpected token")) {
        throw error
      }

      console.error("[Anointed Innovations] Critical API failure:", {
        url: fullUrl,
        message: error.message,
      })
      throw new Error(`Connection error: ${error.message}`)
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
  const token = await this.getAuthToken();
  const formData = new FormData();

  // FIX 1: Use "photos" to match your backend route: uploadPhotos.array("photos", 5)
  // FIX 2: Map properties from the ImagePickerAsset object
  formData.append("photos", {
    uri: file.uri,
    name: file.fileName || 'upload.png', // asset.fileName from docs
    type: file.mimeType || 'image/png',  // asset.mimeType from docs
  } as any);

  const requestHeaders: Record<string, string> = {};
  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  // IMPORTANT: Do NOT set Content-Type manually. 
  // Fetch will automatically set it with the correct "boundary".
  const response = await fetch(`${this.baseURL}${endpoint}`, {
    method: "POST",
    headers: requestHeaders,
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Upload failed");
  return data;
}
}

export const apiClient = new ApiClient(API_BASE_URL)
