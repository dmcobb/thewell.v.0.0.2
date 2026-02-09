import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../constants"

export interface SubscriptionPlan {
  id: string
  name: string
  price_monthly: number
  price_total: number
  duration_months: number
  features: {
    ai_matches: boolean
    unlimited_likes: boolean
    chat: boolean
    browse: boolean
  }
}

export interface UserSubscription {
  id: string
  plan_id: string
  plan_name: string
  status: string
  started_at: string
  expires_at: string
  has_used_trial: boolean
  features: any
  price_monthly: number
}

export interface SubscriptionStatus {
  subscription: UserSubscription | null
  has_used_trial: boolean
  is_premium: boolean
}

export interface DailyLikeStatus {
  can_like: boolean
  likes_remaining: number
  is_premium: boolean
}

export interface PaymentResult {
  success: boolean
  message: string
  payment_id?: string
  expires_at?: string
}

class SubscriptionService {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<{ success: boolean; data: SubscriptionPlan[] }>(
      API_ENDPOINTS.SUBSCRIPTIONS.GET_PLANS,
    )
    return response.data
  }

  async getUserSubscription(): Promise<SubscriptionStatus> {
    const response = await apiClient.get<{ success: boolean; data: SubscriptionStatus }>(
      API_ENDPOINTS.SUBSCRIPTIONS.GET_SUBSCRIPTION,
    )
    return response.data
  }

  async activateTrial(): Promise<{ success: boolean; message: string; expires_at: string }> {
    return apiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.ACTIVATE_TRIAL, {})
  }

  async checkDailyLikeLimit(): Promise<DailyLikeStatus> {
    const response = await apiClient.get<{ success: boolean; data: DailyLikeStatus }>(
      API_ENDPOINTS.SUBSCRIPTIONS.CHECK_DAILY_LIKES,
    )
    return response.data
  }

  async incrementDailyLikes(): Promise<{ success: boolean; message: string }> {
    return apiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.INCREMENT_DAILY_LIKES, {})
  }

  async processPayment(planId: string, nonce: string): Promise<PaymentResult> {
    const response = await apiClient.post<PaymentResult>(API_ENDPOINTS.SUBSCRIPTIONS.CREATE_PAYMENT, {
      plan_id: planId,
      nonce: nonce,
    })
    return response
  }

  async verifyPayment(paymentId: string): Promise<{ verified: boolean; subscription: any }> {
    const response = await apiClient.get<{ success: boolean; verified: boolean; subscription: any }>(
      API_ENDPOINTS.SUBSCRIPTIONS.VERIFY_PAYMENT(paymentId),
    )
    return { verified: response.verified, subscription: response.subscription }
  }

  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    return apiClient.post(API_ENDPOINTS.PAYMENTS.CANCEL_SUBSCRIPTION, {})
  }
}

export const subscriptionService = new SubscriptionService()
