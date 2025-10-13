import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_BASE_URL } from "./constants"

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
  timeout?: number
}

class ApiClient {
  private baseURL: string
  private defaultTimeout = 10000 // 10 seconds

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
    const { requiresAuth = true, timeout = this.defaultTimeout, headers = {}, ...restOptions } = options

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

    try {
      const response = await this.fetchWithTimeout(
        `${this.baseURL}${endpoint}`,
        {
          ...restOptions,
          headers: requestHeaders,
        },
        timeout,
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "An error occurred")
      }

      return data
    } catch (error: any) {
      console.error("[Anointed Innovations] API request error:", error)
      if (error.message?.includes("timeout")) {
        throw new Error("Connection timeout. Make sure your backend server is running.")
      }
      if (error.message?.includes("Network request failed")) {
        throw new Error("Network error. Check your API_URL configuration.")
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

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
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