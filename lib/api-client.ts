import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_BASE_URL } from "./constants"

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("authToken")
    } catch (error) {
      console.error("[v0] Error getting auth token:", error)
      return null
    }
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, headers = {}, ...restOptions } = options

    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...headers,
    }

    if (requiresAuth) {
      const token = await this.getAuthToken()
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`
      }
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...restOptions,
        headers: requestHeaders,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "An error occurred")
      }

      return data
    } catch (error) {
      console.error("[v0] API request error:", error)
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

    const requestHeaders: HeadersInit = {}
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
      console.error("[v0] File upload error:", error)
      throw error
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
