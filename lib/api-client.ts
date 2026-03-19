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
        // Return null silently for guest mode
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
        throw new Error("Request timeout - please check your network connection")
      }
      throw error
    }
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T | null> {
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
        // If we need auth but have no token, return null so services can handle guest state
        return null
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
          return this.request<T>(endpoint, { ...options, _isRetry: true })
        } else {
          return null // Auth failed, treat as guest
        }
      }

      const contentType = response.headers.get("content-type")
      if (contentType && !contentType.includes("application/json")) {
        return null
      }

      const data = await response.json()

      if (!response.ok) {
        // If it's a 404 or other error during init, return null to avoid blocking UI
        return null
      }

      return data as T
    } catch (error: any) {
      console.error("[Anointed Innovations] API failure:", error.message)
      return null
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T | null> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T | null> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    })
  }

  async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T | null> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    })
  }

  async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T | null> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T | null> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async uploadFile<T>(endpoint: string, file: any, options?: RequestOptions): Promise<T | null> {
    const token = await this.getAuthToken();
    const formData = new FormData();

    formData.append("photos", {
      uri: file.uri,
      name: file.fileName || 'upload.png',
      type: file.mimeType || 'image/png',
    } as any);

    const requestHeaders: Record<string, string> = {};
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: requestHeaders,
        body: formData,
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      return null;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)