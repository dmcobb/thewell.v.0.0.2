import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../constants"

export interface DiscoverUser {
  id: string
  first_name: string
  last_name: string
  bio: string
  location_city: string
  location_state: string
  date_of_birth: string
  gender: string
  denomination: string
  occupation: string
  height_cm: number
  profile_video_url: string | null
  profile_video_thumbnail_url: string | null
  photos: Array<{
    id: string
    photo_url: string
    is_primary: boolean
  }> | null
  match_score: number
}

export interface Match {
  id: string
  matched_user_id: string
  first_name: string
  last_name: string
  bio: string
  location_city: string
  primary_photo: string | null
  profile_video_thumbnail_url: string | null
  conversation_id: string
  last_message_at: string
  match_score: number
  matched_at: string
}

export interface MatchDetails {
  id: string
  matched_user_id: string
  first_name: string
  last_name: string
  bio: string
  location_city: string
  location_state: string
  date_of_birth: string
  gender: string
  denomination: string
  church_name: string
  occupation: string
  education_level: string
  height_cm: number
  has_children: boolean
  children_count: number
  wants_children: boolean
  profile_video_url: string | null
  profile_video_thumbnail_url: string | null
  photos: Array<{
    id: string
    photo_url: string
    is_primary: boolean
  }> | null
  match_score: number
}

export interface CompatibilityInsights {
  strengths: Array<{
    area: string
    question: string
    importance: string
  }>
  differences: Array<{
    area: string
    question: string
    severity: string
  }>
  concerns: Array<{
    area: string
    question: string
    severity: string
  }>
  compatibility_areas: Record<
    string,
    {
      matches: number
      total: number
      percentage: number
    }
  >
  overall_compatibility: number
}

export interface AIMatchResult {
  id: string
  first_name: string
  last_name: string
  bio: string
  location_city: string
  location_state: string
  date_of_birth: string
  gender: string
  denomination: string
  occupation: string
  height_cm: number
  profile_video_url: string | null
  profile_video_thumbnail_url: string | null
  photos: Array<{
    id: string
    photo_url: string
    is_primary: boolean
  }> | null
  match_score: number
  compatibility_insights: {
    strengths: Array<{
      area: string
      importance: string
    }>
  }
}

class MatchService {
  async getDiscoverMatches(limit = 10, offset = 0): Promise<DiscoverUser[]> {
    const response = await apiClient.get<{ success: boolean; data: DiscoverUser[] }>(
      `${API_ENDPOINTS.MATCHES.DISCOVER}?limit=${limit}&offset=${offset}`,
    )
    return response.data
  }

  async getMatches(): Promise<Match[]> {
    const response = await apiClient.get<{ success: boolean; data: Match[] }>(API_ENDPOINTS.MATCHES.GET_MATCHES)
    return response.data
  }

  async getMatchDetails(matchId: string): Promise<MatchDetails> {
    const response = await apiClient.get<{ success: boolean; data: MatchDetails }>(
      API_ENDPOINTS.MATCHES.GET_MATCH(matchId),
    )
    return response.data
  }

  async likeUser(userId: string): Promise<{ success: boolean; isMatch: boolean }> {
  const response = await apiClient.post<{ success: boolean; isMatch: boolean }>(
    API_ENDPOINTS.MATCHES.LIKE(userId),
    {},
  )
  return response
}

  async passUser(userId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(API_ENDPOINTS.MATCHES.PASS(userId), {})
  }

  async unmatch(matchId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(API_ENDPOINTS.MATCHES.UNMATCH(matchId))
  }

  async getCompatibilityInsights(userId1: string, userId2: string): Promise<CompatibilityInsights> {
    const response = await apiClient.get<{ success: boolean; data: CompatibilityInsights }>(
      `${API_ENDPOINTS.MATCHES.GET_MATCHES}/compatibility?user1=${userId1}&user2=${userId2}`,
    )
    return response.data
  }

  async getAIMatch(): Promise<AIMatchResult | null> {
    const response = await apiClient.get<{ success: boolean; data: AIMatchResult | null; message?: string }>(
      "/matches/ai-match",
    )
    return response.data
  }
}

export const matchService = new MatchService()