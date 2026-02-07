import { apiClient } from '../api-client'
import { API_ENDPOINTS } from '../constants'

export interface UserLocation {
  id: string
  first_name: string
  last_name: string
  latitude: number
  longitude: number
  city: string
  state: string
  age?: number
  gender?: string
  distance_miles?: number
  primary_photo?: string
}

class LocationService {
  /**
   * Update user's location with coordinates
   * Backend handles reverse geocoding to get city/state
   */
  async updateUserLocation(latitude: number, longitude: number): Promise<UserLocation> {
    const response = await apiClient.post<UserLocation>(API_ENDPOINTS.USERS.UPDATE_PROFILE, {
      latitude,
      longitude,
    })
    return response
  }

  /**
   * Get nearby users based on current user's location and distance preference
   * Uses PostGIS distance calculation on backend
   */
  async getNearbyUsers(maxDistanceMiles: number, gender?: string): Promise<UserLocation[]> {
    try {
      // Construct query params for the discover endpoint
      const params = new URLSearchParams()
      if (maxDistanceMiles) params.append('maxDistance', maxDistanceMiles.toString())
      if (gender) params.append('gender', gender)

      const queryString = params.toString()
      const endpoint = queryString ? `${API_ENDPOINTS.MATCHES.DISCOVER}?${queryString}` : API_ENDPOINTS.MATCHES.DISCOVER

      const response = await apiClient.get<UserLocation[]>(endpoint)
      return response
    } catch (error) {
      console.error('[Location Service] Error getting nearby users:', error)
      return []
    }
  }

  /**
   * Calculate distance between two coordinates in miles (client-side helper)
   * Note: Backend uses PostGIS for accurate distance calculations
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959 // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
}

export const locationService = new LocationService()