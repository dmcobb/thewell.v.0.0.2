import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../constants"

export interface PrayerRequest {
  id: string
  user_id: string
  user_name: string
  content: string
  category: string
  is_anonymous: boolean
  prayer_count: number
  created_at: string
  updated_at: string
}

export interface CreatePrayerData {
  content: string
  category?: string
  is_anonymous?: boolean
}

class PrayerService {
  async getPrayerRequests(): Promise<PrayerRequest[]> {
    const response = await apiClient.get<{ success: boolean; data: PrayerRequest[] }>(API_ENDPOINTS.PRAYERS.GET_PRAYERS)
    return response.data
  }

  async getMyPrayerRequests(): Promise<PrayerRequest[]> {
    const response = await apiClient.get<{ success: boolean; data: PrayerRequest[] }>(
      API_ENDPOINTS.PRAYERS.GET_MY_PRAYERS,
    )
    return response.data
  }

  async createPrayerRequest(data: CreatePrayerData): Promise<PrayerRequest> {
    const response = await apiClient.post<{ success: boolean; data: PrayerRequest }>(
      API_ENDPOINTS.PRAYERS.CREATE_PRAYER,
      data,
    )
    return response.data
  }

  async updatePrayerRequest(requestId: string, data: Partial<CreatePrayerData>): Promise<PrayerRequest> {
    const response = await apiClient.put<{ success: boolean; data: PrayerRequest }>(
      API_ENDPOINTS.PRAYERS.UPDATE_PRAYER(requestId),
      data,
    )
    return response.data
  }

  async deletePrayerRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(API_ENDPOINTS.PRAYERS.DELETE_PRAYER(requestId))
  }

  async prayForRequest(requestId: string): Promise<{ success: boolean; prayer_count: number }> {
    const response = await apiClient.post<{ success: boolean; data: { prayer_count: number } }>(
      API_ENDPOINTS.PRAYERS.PRAY_FOR(requestId),
      {},
    )
    return { success: response.success, prayer_count: response.data.prayer_count }
  }
}

export const prayerService = new PrayerService()
